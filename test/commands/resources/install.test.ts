import {expect, test} from '@oclif/test'
import { existsSync, readdirSync } from 'fs'
import { resolve } from 'path'

describe('resources install', () => {
  const cwd = 'test/resourceDirectories/resources/install'

  test
  .stdout()
  .it('ensures test directory is clean', ctx => {
    /* Check that the root dir is only contains resources.json */
    expect(readdirSync(resolve(cwd))).to.lengthOf(1).contain('resources.json')

    /* Check that resources subdirectory does not exist */
    expect(existsSync(resolve(cwd, 'resources'))).to.be.false
  })
  

  test
  .stdout()
  .command(['resources:install'], {
    root: resolve(cwd)
  })
  .it('runs resources install cmd', ctx => {
    const files = readdirSync(resolve(cwd, 'resources'))

    /* Check if all sql files got extracted */
    expect(files).to.lengthOf(1)
    expect(files).to.contain('resources.json')
  })
})
