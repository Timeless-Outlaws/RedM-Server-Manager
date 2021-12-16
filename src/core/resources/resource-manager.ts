import {resolve} from 'node:path'
import {writeFile, rm, readdir, mkdir} from 'node:fs/promises'
import {Dirent, existsSync, readFileSync} from 'node:fs'
import simpleGit, {SimpleGit, ConfigGetResult} from 'simple-git'
import fetch, {Response} from 'node-fetch'
import {Extract as exractTar} from 'tar'
import isGitUrl from 'is-git-url'
import {Definition, Resource, ResourceType} from './definition'

export default class ResourceManager {
  _definitionFile: string

  _definition: Definition

  _resourcesDirectory: string

  constructor(definitionDirectory: string = resolve(process.cwd()), resourcesDirectory: string = resolve(process.cwd())) {
    this._definitionFile = resolve(definitionDirectory, 'resources.json')
    this._definition = JSON.parse(readFileSync(this._definitionFile).toString())
    this._resourcesDirectory = resolve(resourcesDirectory, 'resources')
  }

  static async init(path: string = resolve(process.cwd())): Promise<void> {
    /* Get the path to the resources.json based on the current working directory */
    const target = resolve(path, 'resources.json')

    /* Check if an resources.json does already exist */
    if (existsSync(target)) {
      throw new Error('resources.json does already exist.')
    }

    /* Initialize the new definiton */
    const definition: Definition = {
      resources: [], // Initialize resources array
    }

    /* Write the new resources.json */
    await writeFile(target, JSON.stringify(definition))
  }

  /**
   * Installs resources from the current definitions
   *
   * @return {Promise<void>} Will resolve once all resources are installed and the directory is cleaned
   */
  async install(): Promise<string> {
    /* Create the resources directory if it does not exist */
    if (!existsSync(this._resourcesDirectory)) {
      await mkdir(this._resourcesDirectory)
    }

    /* Keep track of resource actions */
    const install: Promise<void>[] = []
    const update: Promise<void>[]  = []
    let removed          = 0

    /* Install every listed resource */
    for (const resource of this._definition.resources) {
      /* Check if we should update or install based on if the resource already exists */
      if ((resource.type && ['tarball'].includes(resource.type)) || !existsSync(resolve(this._resourcesDirectory, resource.path))) {
        /* Check what kind of resource definition we have and use the correct installer */
        switch (resource.type) {
        case ResourceType.TARBALL:
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

    /* Wait for install & update to finish */
    await Promise.all([
      Promise.all(install),
      Promise.all(update),
    ])

    /* Remove all resources that are not explicitly installed */
    removed = await this.clean()

    /* Determine if any actions were performed */
    if (install.length > 0 || update.length > 0 || removed) {
      return `Successfully installed ${install.length}, updated ${update.length} and removed ${removed} resources!`
    }

    return 'No changes required, everything is up to date.'
  }

  async clean(path: string = this._resourcesDirectory): Promise<number> {
    /* Check if this directory is a resource */
    const isManifestOutdated = existsSync(resolve(path, '__resource.lua')) // Determine if the manifest is out of date
    const isResource: boolean = isManifestOutdated || existsSync(resolve(path, 'fxmanifest.lua'))

    /* Directory is a resource */
    if (isResource) {
      /* Find the resource in the definition by its path */
      const resource: Resource|undefined = this._definition.resources.find(resource => path === resolve(this._resourcesDirectory, resource.path))

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
      await rm(path, {recursive: true, force: true})

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
      promises.push(this.clean(resolve(path, subdirectory)))
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
        await rm(path, {recursive: true, force: true})
      }
    }

    return removed
  }

  async addResource(resource: Resource): Promise<void> {
    /* Check if the resource does already exist in the definition */
    if (this._definition.resources.some(entry => entry.type === resource.type && entry.url === resource.url)) {
      return
    }

    /* Add the resource to the definition */
    this._definition.resources.push(resource)

    /* Save the definition to the disk */
    await this.saveDefinition()
  }

  async removeResource(path: string): Promise<number> {
    /* Count the defined resources */
    const count = this._definition.resources.length

    /* Remove the resource by path */
    this._definition.resources = this._definition.resources.filter(entry => resolve(entry.path) !== resolve(path))

    /* Save the resource definition file */
    await this.saveDefinition()

    /* Clean the removed resources from the disk */
    await this.clean()

    /* Determine and return how many resources have been removed */
    return count - this._definition.resources.length
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
      rm(path, {recursive: true, force: true})
    }

    /* Download the latest tarball */
    const response = await fetch(resource.url)

    /* Extract the tarball */
    await ResourceManager._extractTarball(response.body, path)
  }

  async installGit(resource: Resource): Promise<void> {
    if (!resource.url) {
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
          await rm(path, {recursive: true, force: true})
        }
      }

      /* Open the repository */
      const repository: SimpleGit = await simpleGit(path)

      /* Get the origin remote url */
      const url: ConfigGetResult = await repository.getConfig('remote.origin.url', 'local')

      /* Make sure it is the correct origin */
      if (url.value !== resource.url) {
        /* Remove the repository */
        await rm(path, {recursive: true, force: true})

        /* Clone the correct repository */
        await (simpleGit().clone(resource.url, path))
      }
    } else {
      /* Clone the repository */
      await (simpleGit().clone(resource.url, path))
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

  static async getResourceTypeFromInput(input: string): Promise<ResourceType> {
    /* Check if the input is a GIT url */
    if (isGitUrl(input)) {
      return ResourceType.GIT
    }

    /* Check if the input is a tarball */
    if (input.startsWith('http') && await ResourceManager.urlIsTarball(input)) {
      return ResourceType.TARBALL
    }

    /* Input not supported, fail */
    throw new Error(`Could not determine type for input "${input}".`)
  }

  static async urlIsTarball(url: string): Promise<boolean> {
    const response: Response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow'
    })

    /* Get the received Content-Type header from the request */
    const contentType: string|null = response.headers.get('content-type')

    /* Check that the URL returns a gzip Content-Type header, also allow experimental x- version */
    return !!contentType && ['application/gzip', 'application/x-gzip'].includes(contentType)
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
