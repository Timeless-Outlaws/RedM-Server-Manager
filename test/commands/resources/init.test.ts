import {expect, test} from '@oclif/test'
import { readdirSync } from 'fs'
import { resolve } from 'path'

describe('resources init', () => {
  const cwd = resolve(__dirname, '..', '..', 'resourceDirectories', 'resources', 'init')

  process.chdir(cwd)

  test
  .stdout()
  .it('checks that cwd is empty first', ctx => {
    /* Check that the resources dir is empty first */
    expect(readdirSync(cwd).filter(path => path.toLowerCase() !== '.gitkeep')).to.lengthOf(0)
  })

  test
  .stdout()
  .command(['resources:init'])
  .it('runs resources init cmd', ctx => {
    const files = readdirSync(cwd).filter(path => path.toLowerCase() !== '.gitkeep')

    /* Check if all sql files got extracted */
    expect(files).to.lengthOf(1)
    expect(files).to.contain('resources.json')
  })
})