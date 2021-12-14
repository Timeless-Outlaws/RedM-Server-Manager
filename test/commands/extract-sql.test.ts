import {expect, test} from '@oclif/test'
import { readdirSync } from 'fs'
import { resolve } from 'path'

describe('extract-sql', () => {
  const cwd = 'test/resourceDirectories/extract-sql'

  /* Run the command */
  test
  .stdout()
  .command(['extract-sql', cwd])
  .it('runs extract-sql cmd', ctx => {
    /* List the extracted files */
    const files = readdirSync(resolve(cwd, 'sql')).filter(path => path.toLowerCase() !== '.gitkeep')

    /* Check if all sql files got extracted */
    expect(files).to.lengthOf(3)
  })
})