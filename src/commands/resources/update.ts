import {Command, flags} from '@oclif/command'
//import ResourceManager from '../../core/resources/resource-manager'

export default class ResourcesUpdate extends Command {
  static description = 'Update resources in resources.json to their latest version based on the strategy'

  static examples = [
    '$ rsm resources update',
  ]

  static flags = {
    cwd: flags.string(),
  }

  async run(): Promise<void> {
    /* Get the arguments */
    // const {flags} = this.parse(ResourcesUpdate)

    /* Initialize the manager */
    // const manager = new ResourceManager(flags.cwd, flags.cwd)

    /* Inform the user */
    this.log('Not yet implemented :(')
  }
}
