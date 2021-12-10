import { resolve } from "path"
import { writeFile, rmdir, readdir } from "fs/promises"
import { Resource } from "./Resource"
import { Dirent, existsSync } from "fs"
import { Definition } from "./Definition"
import { Repository, Clone } from 'nodegit'
import fetch from 'node-fetch'
import { Extract } from 'tar'

export default class ResourceManager {

  _definitionFile: string

  _definition: Definition

  _resourcesDirectory: string

  constructor(definitionDirectory: string = resolve(process.cwd(), 'resources.json'), resourcesDirectory: string = resolve(process.cwd(), 'resources')) {
    this._definitionFile =resolve(definitionDirectory, 'resources.json')
    this._definition = JSON.parse(this._definitionFile)
    this._resourcesDirectory = resolve(resourcesDirectory)
  }

  /**
   * Installs resources from the current definitions
   */
  async install(): Promise<string> {
    /* Keep track of resource actions */
    let installed: number = 0
    let updated: number   = 0
    let removed: number   = 0

    /* Get resources from the definition */
    const resources: Resource[]|undefined = this._definition.resources

    /* Check if there are any resources definitions */
    if (resources && resources.length) {
      /* Install every listed resource */
      for (const resource of resources) {
        /* Check if we should update or install based on if the resource already exists */
        if ( ( resource.type && ['tarball'].includes(resource.type)) || ! existsSync(resolve(this._resourcesDirectory, resource.path))) {
          /* Check what kind of resource definition we have and use the correct installer */
          switch (resource.type) {
            case 'tarball':
              await this.installTarball(resource)
            default:
              await this.installGit(resource)
          }

          /* Increment the amount of newly installed resources */
          installed++
        } else {
          /* Check what kind of resource definition we have and use the correct installer */
          switch (resource.type) {
            default:
              await this.installGit(resource)
          }

          /* Increment the amount of updated resources */
          updated++
        }
      }
    }

    /* Remove all resources that are not explicitly installed */
    removed = await this.clean(this._resourcesDirectory, resources)
    
    /* Determine if any actions were performed */
    if (installed || updated || removed) {
      return `Successfully installed ${installed}, updated ${updated} and removed ${removed} resources!`
    } else {
      return 'No changes required, everything is up to date.'
    }
  }

  async clean(path: string = this._resourcesDirectory, resources: Resource[]|undefined): Promise<number> {
    /* Resolve resources from the definition if not set */
    resources = resources || this._definition.resources || []

    /* Check if this directory is a resource */
    let isManifestOutdated = existsSync(resolve(path, 'fxmanifest.lua')) // Determine if the manifest is out of date
    let isResource: Boolean = isManifestOutdated || existsSync(resolve(path, 'fxmanifest.lua'))

    /* Directory is a resource */
    if (isResource) {
      /* Find the resource in the definition by its path */
      const resource: Resource|undefined = resources ? resources.filter(resource => path === resolve(this._resourcesDirectory, resource.path)).shift() : undefined

      /* Check if the resource is in the definition */
      if (resource) {
        /* Check if the manifest is outdated */
        if (isManifestOutdated) {
          console.warn(`Outdated resource manifest for ${resource.path}`)
        }

        /* Notify that no resource has been removed as this path is valid */
        return 0
      } else {
        /* Remove the resource as it is missing from the definition */
        await rmdir(path)

        /* Notify that one resource has been removed */
        return 1
      }
    }
    /* Not a resource, process sub-directories */
    else {
      /* Get all subdirectories of the directory */
      const subdirectories: string[] = await ResourceManager._getSubDirectories(path)

      /* Capture promises for parallel execution */
      const promises: Promise<number>[]= []

      /* Process all subdirectories as possible resource */
      for (const subdirectory of subdirectories) {
        promises.push(this.clean(subdirectory, resources))
      }

      /* Wait for promises to finish and sum the results as the amount of removed resources*/
      const removed = ( await Promise.all(promises) ).reduce((deleted: number, add: number) => deleted + add, 0)

      /* Check if we are still at root, we are not allowed to delete the root */
      if (path !== this._resourcesDirectory) {
        /* Check if the directory has any subdirectories now */
        if (! ( await ResourceManager._getSubDirectories(path)).length) {
          /* Remove the directory in case it does not contain any module and is not a module itself */
          await rmdir(path)
        }
      }
      

      return removed
    }
  }

  async installTarball(resource: Resource): Promise<void> {
    if (! resource.url) {
      throw new Error('Resources of type tarball must define a url property.')
    }

    /* Resolve the resources path */
    const path: string = resolve(this._resourcesDirectory, resource.path)

    /* Check if the resource directory does already exist */
    if (existsSync(path)) {
      /* Remove it */
      rmdir(path)
    }

    /* Download the latest tarball */
    const response = await fetch(resource.url)

    /* Extract the tarball */
    await ResourceManager._extractTarball(response.body, path)
  }

  async installGit(resource: Resource): Promise<void> {
    if (! resource.repository) {
      throw new Error('Git resources must define a repository property.')
    }
    /* Resolve the resources path */
    const path = resolve(this._resourcesDirectory, resource.path)

    /* Check if the resource directory does already exist */
    if (existsSync(path)) {
      /* Make sure it is a git repository */
      if (! existsSync(resolve(path, '.git'))) {
        /* Check if the folder is empty */
        if ( ( await readdir(path) ).length ) {
          /* Not empty and not a git, this is an error */
          throw new Error('Configured resource path is polluted with non-git files at "${resource.path}".')
        } else {
          /* Remove empty directories */
          await rmdir(path)
        }
      }

      /* Open the repository */
      let repository: Repository = await Repository.open(path)

      /* Make sure it is the correct origin */
      if ( (await repository.getRemote('origin')).url() !== resource.repository ) {
        /* Remove the repository */
        await rmdir(path)

        /* Clone the correct repository */
        repository = await Clone.clone(resource.repository, resource.path)
      }
    } else {
      /* Clone the repository */
      await Clone.clone(resource.repository, resource.path)
    }
  }
  
  /**
   * Safes the definition back to resources.json
   */
  async saveDefinition(): Promise<void> {
    /* Serialize the definition */
    const json = JSON.stringify(this._definition)
    
    /* (Over-)Write the definition to the resources.json it came from */
    return writeFile(this._definitionFile, json)
  }

  static async _getSubDirectories(path: string): Promise<string[]> {
    return ( await readdir(path, { withFileTypes: true }) ).filter((dirent: Dirent) => dirent.isDirectory()).map((dirent: Dirent) => dirent.name)
  }

  static _extractTarball(tarball: NodeJS.ReadableStream, path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      tarball.on('end', resolve)
      tarball.on('error', reject)

      tarball.pipe(Extract({
        C: path
      }))
    })    
  }
}
