import {expect, test} from '@oclif/test'
import { readdirSync } from 'fs'
import { resolve } from 'path'

describe('resources init', () => {
  const cwd = 'test/resourceDirectories/resources/init'

  test
  .stdout()
  .it('checks that cwd is empty first', ctx => {
    /* Check that the resources dir is empty first */
    expect(readdirSync(resolve(cwd)).filter(path => path.toLowerCase() !== '.gitkeep')).to.lengthOf(0)
  })

  test
  .stdout()
  .command(['resources:init', cwd])
  .it('runs resources init cmd', ctx => {
    /* Check if all sql files got extracted */
    expect(readdirSync(resolve(cwd)).filter(path => path.toLowerCase() !== '.gitkeep')).to.equal([
      'resources.json'
    ])
  })
})