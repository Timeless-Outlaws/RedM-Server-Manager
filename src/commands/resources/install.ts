import {Command} from '@oclif/command'

export default class ResourcesInstall extends Command {
  static description = 'Installs the resources as defined in resources.json or adds new resource'

  static examples = [
    `$ rsm extract-sql ./resources`,
  ]

  static args = [
    {name: 'resourcesDirectory'},
  ]

  async run(): Promise<void> {
    /* Get the arguments */
    const {args} = this.parse(ResourcesInstall)

    this.log('Not yet implemented :(')
  }
}