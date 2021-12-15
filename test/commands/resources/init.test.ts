import {expect, test} from '@oclif/test'
import {readdirSync} from 'node:fs'
import {resolve} from 'node:path'

describe('resources init', () => {
  const cwd = resolve(__dirname, '..', '..', 'resourceDirectories', 'resources', 'init')

  test
  .stdout()
  .it('checks that cwd is empty first', () => {
    /* Check that the resources dir is empty first */
    expect(readdirSync(cwd).filter(path => path.toLowerCase() !== '.gitkeep')).to.lengthOf(0)
  })

  test
  .stdout()
  .command(['resources:init', `--cwd=${cwd}`])
  .it('runs resources init cmd', () => {
    const files = readdirSync(cwd).filter(path => path.toLowerCase() !== '.gitkeep')

    /* Check if all sql files got extracted */
    expect(files).to.lengthOf(1)
    expect(files).to.contain('resources.json')
  })
})
