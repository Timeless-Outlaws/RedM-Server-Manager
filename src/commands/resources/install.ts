import {Command, flags} from '@oclif/command'
import ResourceManager from '../../core/resources/resource-manager'

export default class ResourcesInstall extends Command {
  static description = 'Installs the resources as defined in resources.json or adds new resource'

  static examples = [
    '$ rsm resources install',
  ]

  static flags = {
    // can pass either --force or -f
    definition: flags.string({char: 'd'}),
    directory: flags.string({char: 'o'}),
  }

  async run(): Promise<void> {
    /* Get the arguments */
    const {flags} = this.parse(ResourcesInstall)

    /* Initialize the manager */
    const manager = new ResourceManager(flags.definition, flags.directory)

    /* Intall resources as defined */
    await manager.install()
  }
}
