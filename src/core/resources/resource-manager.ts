import {resolve} from 'node:path'
import {writeFile, rmdir, readdir} from 'node:fs/promises'
import {Dirent, existsSync} from 'node:fs'
import simpleGit, {SimpleGit, ConfigGetResult} from 'simple-git'
import fetch from 'node-fetch'
import {Extract as exractTar} from 'tar'
import {Resource} from './resource'
import {Definition} from './definition'

export default class ResourceManager {
  _definitionFile: string

  _definition: Definition

  _resourcesDirectory: string

  constructor(definitionDirectory: string = resolve(process.cwd(), 'resources.json'), resourcesDirectory: string = resolve(process.cwd(), 'resources')) {
    this._definitionFile = resolve(definitionDirectory, 'resources.json')
    this._definition = JSON.parse(this._definitionFile)
    this._resourcesDirectory = resolve(resourcesDirectory)
  }

  /**
   * Installs resources from the current definitions
   *
   * @return {Promise<void>} Will resolve once all resources are installed and the directory is cleaned
   */
  async install(): Promise<string> {
    /* Keep track of resource actions */
    const install: Promise<void>[] = []
    const update: Promise<void>[]  = []
    let removed          = 0

    /* Get resources from the definition */
    const resources: Resource[]|undefined = this._definition.resources

    /* Check if there are any resources definitions */
    if (resources && resources.length > 0) {
      /* Install every listed resource */
      for (const resource of resources) {
        /* Check if we should update or install based on if the resource already exists */
        if ((resource.type && ['tarball'].includes(resource.type)) || !existsSync(resolve(this._resourcesDirectory, resource.path))) {
          /* Check what kind of resource definition we have and use the correct installer */
          switch (resource.type) {
          case 'tarball':
            install.push(this.installTarball(resource))
            break
          default:
            install.push(this.installGit(resource))
          }
        } else {
          /* Check what kind of resource definition we have and use the correct installer */
          switch (resource.type) {
          default:
            update.push(this.installGit(resource))
          }
        }
      }
    }

    /* Wait for install & update to finish */
    await Promise.all([
      Promise.all(install),
      Promise.all(update),
    ])

    /* Remove all resources that are not explicitly installed */
    removed = await this.clean(this._resourcesDirectory, resources)

    /* Determine if any actions were performed */
    if (install.length > 0 || update.length > 0 || removed) {
      return `Successfully installed ${install.length}, updated ${update.length} and removed ${removed} resources!`
    }

    return 'No changes required, everything is up to date.'
  }

  async clean(path?: string, resources?: Resource[]): Promise<number> {
    /* Resolve the path if not set */
    path = path || this._resourcesDirectory

    /* Resolve resources from the definition if not set */
    resources = resources || this._definition.resources || []

    /* Check if this directory is a resource */
    const isManifestOutdated = existsSync(resolve(path, 'fxmanifest.lua')) // Determine if the manifest is out of date
    const isResource: boolean = isManifestOutdated || existsSync(resolve(path, 'fxmanifest.lua'))

    /* Directory is a resource */
    if (isResource) {
      /* Find the resource in the definition by its path */
      const resource: Resource|undefined = resources ? resources.find(resource => path === resolve(this._resourcesDirectory, resource.path)) : undefined

      /* Check if the resource is in the definition */
      if (resource) {
        /* Check if the manifest is outdated */
        if (isManifestOutdated) {
          console.warn(`Outdated resource manifest for ${resource.path}`)
        }

        /* Notify that no resource has been removed as this path is valid */
        return 0
      }

      /* Remove the resource as it is missing from the definition */
      await rmdir(path)

      /* Notify that one resource has been removed */
      return 1
    }
    /* Not a resource, process sub-directories */

    /* Get all subdirectories of the directory */
    let subdirectories: string[] = await ResourceManager._getSubDirectories(path)

    /* Capture promises for parallel execution */
    const promises: Promise<number>[] = []

    /* Process all subdirectories as possible resource */
    for (const subdirectory of subdirectories) {
      promises.push(this.clean(subdirectory, resources))
    }

    /* Wait for promises to finish and sum the results as the amount of removed resources */
    const removed = await (async (): Promise<number> => {
      const results = await Promise.all(promises)
      return results.reduce((deleted: number, add: number) => deleted + add, 0)
    })()

    /* Check if we are still at root, we are not allowed to delete the root */
    if (path !== this._resourcesDirectory) {
      /* Update the subdirectories */
      subdirectories = await ResourceManager._getSubDirectories(path)

      /* Check if the directory has any subdirectories now */
      if  (subdirectories.length === 0) {
      /* Remove the directory in case it does not contain any module and is not a module itself */
        await rmdir(path)
      }
    }

    return removed
  }

  async installTarball(resource: Resource): Promise<void> {
    if (!resource.url) {
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
    if (!resource.repository) {
      throw new Error('Git resources must define a repository property.')
    }

    /* Resolve the resources path */
    const path = resolve(this._resourcesDirectory, resource.path)

    /* Check if the resource directory does already exist */
    if (existsSync(path)) {
      /* Make sure it is a git repository */
      if (!existsSync(resolve(path, '.git'))) {
        /* Get the contents of the directory */
        const directoryContents: string[] = await readdir(path)

        /* Check if the directory is empty */
        if (directoryContents.length > 0) {
          /* Not empty and not a git, this is an error */
          throw new Error(`Configured resource path is polluted with non-git files at "${resource.path}".`)
        } else {
          /* Remove empty directories */
          await rmdir(path)
        }
      }

      /* Open the repository */
      const repository: SimpleGit = await simpleGit(path)

      /* Get the origin remote url */
      const url: ConfigGetResult = await repository.getConfig('remote.origin.url', 'local')

      /* Make sure it is the correct origin */
      if (url.value !== resource.repository) {
        /* Remove the repository */
        await rmdir(path)

        /* Clone the correct repository */
        await (simpleGit(path).clone(resource.repository, path))
      }
    } else {
      /* Clone the repository */
      await (simpleGit(path).clone(resource.repository, path))
    }
  }

  /**
   * Safes the definition back to resources.json
   *
   * @return {Promise<void>} Will resolve once the file is safed
   */
  async saveDefinition(): Promise<void> {
    /* Serialize the definition */
    const json: string = JSON.stringify(this._definition)

    /* (Over-)Write the definition to the resources.json it came from */
    await writeFile(this._definitionFile, json)
  }

  static async _getSubDirectories(path: string): Promise<string[]> {
    const subdirectories = await readdir(path, {withFileTypes: true})
    return subdirectories.filter((dirent: Dirent) => dirent.isDirectory()).map((dirent: Dirent) => dirent.name)
  }

  static _extractTarball(tarball: NodeJS.ReadableStream, path: string): Promise<void> {
    return (new Promise((resolve, reject) => {
      tarball.on('end', resolve)
      tarball.on('error', reject)

      tarball.pipe(exractTar({
        C: path,
      }))
    }))
  }
}
