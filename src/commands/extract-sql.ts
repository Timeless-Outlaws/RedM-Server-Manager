import {Command, flags} from '@oclif/command'
import ResourceSQLExtractor from '../core/resource-sql-extractor'

export default class ExtractSQL extends Command {
  static description = 'describe the command here'

  static examples = [
    '$ rsm extract-sql ./resources',
  ]

  static flags = {
    cwd: flags.string(),
  }

  async run(): Promise<void> {
    /* Get the arguments */
    const {flags} = this.parse(ExtractSQL)

    /* Initialize the extractor with the provided resourcesDirectory */
    const extractor = new ResourceSQLExtractor(flags.cwd, flags.cwd)

    /* Extract the SQL */
    await extractor.extract()
  }
}
