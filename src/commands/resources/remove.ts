import {Command} from '@oclif/command'

export default class ResourcesURemove extends Command {
  static description = 'Removes resources from resources.json'

  static examples = [
    '$ rsm resources remove',
  ]

  async run(): Promise<void> {
    /* Inform the user */
    this.log(`Not yet implemented :(`)
  }
}
