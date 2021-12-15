import {Command, flags} from '@oclif/command'
import cli from 'cli-ux'
import {existsSync} from 'node:fs'
import {rm} from 'node:fs/promises'
import {resolve} from 'node:path'
import ResourceManager from '../../core/resources/resource-manager'

export default class ResourcesInit extends Command {
  static description = 'Initializes a new resources.json in the current directory'

  static examples = [
    '$ rsm resources init',
  ]

  static flags = {
    cwd: flags.string(),
  }

  async run(): Promise<void> {
    /* Get the arguments */
    const {flags} = this.parse(ResourcesInit)

    /* Get the path to the resources.json based on the current working directory */
    const target = resolve(flags.cwd || process.cwd(), 'resources.json')

    /* Check if an resources.json does already exist, ask if we can delete it */
    if (existsSync(target)) {
      /* Ask for permission to remove the existing file */
      const answer: string = await cli.prompt(`There already is an resources.json at ${target}, do you want to replace it? (Default: no)`)

      /* Check the answer, positive starts with y since only y or yes is allowed */
      if (answer.startsWith('y')) {
        /* Remove the existing resources.json */
        await rm(target)
      } else {
        /* Confirm the decision and abort the execution */
        this.error('Did NOT delete existing resources.json. Aborting...')
        return
      }
    }

    /* Inform the user */
    this.log(`Initializing a new resources.json at ${target}...`)

    /* Initialize the resources.json */
    await ResourceManager.init(flags.cwd)

    /* Inform the user */
    this.log('Successfully initialzed resources.json!')
  }
}
