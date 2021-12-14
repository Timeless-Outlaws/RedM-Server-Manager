import {Command, flags} from '@oclif/command'
import { existsSync } from 'fs'
import { resolve } from 'path'
import { ResourceType } from '../../core/resources/definition'
import ResourceManager from '../../core/resources/resource-manager'

export default class ResourcesInstall extends Command {
  static description = 'Installs the resources as defined in resources.json or adds new resource'

  static examples = [
    '$ rsm resources install',
  ]

  static args = [
      {name: 'resource'},
      {name: 'path'}
  ]

  static flags = {
    // can pass either --force or -f
    definition: flags.string({char: 'd'}),
    directory: flags.string({char: 'o'}),
  }

  async run(): Promise<void> {
    /* Get the arguments */
    const {args, flags} = this.parse(ResourcesInstall)

    /* Initialize the manager */
    const manager = new ResourceManager(flags.definition, flags.directory)

    /* Check if we are supposed to install a resource, otherwise just install */
    if (args.resource || args.path) {
        if (! args.resource || ! args.path) {
            throw new Error('When installing resources the resource AND path has to be provided.')
        }

        /* Check if the given path exists */
        if (! existsSync(resolve(args.path))) {
            throw new Error(`The provided path does not exist at ${args.path}.`)
        }

        /* Get the type of resource to install, will fail if the resource type can not be determined */
        const resourceType: ResourceType = ResourceManager.getResourceTypeFromInput(args.resource)

        /* Initialize the ResourceManager now that we have a valid type and path */
        const resourceManager: ResourceManager = new ResourceManager(flags.definition, flags.directory)

        /* Add the resource to the definition, this will also install the resource and revert the definition on success */
        await resourceManager.addResource({
            type: resourceType,
            path: args.path,
            url: args.resource,
        })
    } else {
        /* Intall resources as defined */
        await manager.install()
    }
  }
}
