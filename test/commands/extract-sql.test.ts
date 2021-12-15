import {expect, test} from '@oclif/test'
import {readdirSync} from 'node:fs'
import {resolve} from 'node:path'

describe('extract-sql', () => {
  const cwd = resolve('test', 'resourceDirectories', 'extract-sql')

  /* Run the command */
  test
  .stdout()
  .command(['extract-sql', `--cwd=${cwd}`], {
    root: resolve(cwd),
  })
  .it('runs extract-sql cmd', () => {
    /* List the extracted files */
    const files = readdirSync(resolve(cwd, 'initdb')).filter(path => path.toLowerCase() !== '.gitkeep')

    /* Check if all sql files got extracted */
    expect(files).to.lengthOf(3)
  })
})
