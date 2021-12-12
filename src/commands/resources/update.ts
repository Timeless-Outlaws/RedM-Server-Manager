import {Command} from '@oclif/command'

export default class ResourcesUpdate extends Command {
  static description = 'Update resources in resources.json to their latest version based on the strategy'

  static examples = [
    '$ rsm resources update',
  ]

  async run(): Promise<void> {
    /* Inform the user */
    this.log(`Not yet implemented :(`)
  }
}
