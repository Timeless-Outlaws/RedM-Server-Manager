import {Command, flags} from '@oclif/command'
import ResourceManager from '../../core/resources/resource-manager'

export default class ResourcesURemove extends Command {
  static description = 'Removes resources from resources.json'

  static examples = [
    '$ rsm resources remove <path>',
  ]

  static args = [
    {name: 'path'},
  ]

  static flags = {
    cwd: flags.string(),
  }

  async run(): Promise<void> {
    /* Get the arguments */
    const {args, flags} = this.parse(ResourcesURemove)

    /* Initialize the manager */
    const manager = new ResourceManager(flags.cwd, flags.cwd)

    /* Try to remove the resource and get the amount of removed resources */
    const removed = await manager.removeResource(args.path)

    /* Inform the user */
    if (removed) {
      this.log(`Successfully removed ${removed} resources.`)
    } else {
      this.log(`No resources removed! Resource with path ${args.path} does not exist.`)
    }
  }
}
