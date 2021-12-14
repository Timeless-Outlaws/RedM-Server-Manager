import {expect, test} from '@oclif/test'
import { readdirSync } from 'fs'
import { resolve } from 'path'

describe('extract-sql', () => {
  const cwd = resolve(__dirname, '..', '..', 'test', 'resourceDirectories', 'extract-sql')

  process.chdir(cwd)

  /* Run the command */
  test
  .stdout()
  .command(['extract-sql', cwd], {
    root: resolve(cwd)
  })
  .it('runs extract-sql cmd', ctx => {
    /* List the extracted files */
    const files = readdirSync(resolve(cwd, 'sql')).filter(path => path.toLowerCase() !== '.gitkeep')

    /* Check if all sql files got extracted */
    expect(files).to.lengthOf(3)
  })
})
