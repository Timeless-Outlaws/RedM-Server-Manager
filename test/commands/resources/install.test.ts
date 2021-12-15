import {expect, test} from '@oclif/test'
import {existsSync, readdirSync} from 'node:fs'
import {resolve} from 'node:path'

describe('resources install', () => {
  const cwd = resolve(__dirname, '..', '..', 'resourceDirectories', 'resources', 'install')

  test
  .stdout()
  .it('ensures test directory is clean', () => {
    /* Check that the root dir is only contains resources.json */
    expect(readdirSync(cwd)).to.lengthOf(1).contain('resources.json')

    /* Check that resources subdirectory does not exist */
    expect(existsSync(resolve(cwd, 'resources'))).to.be.false
  })

  test
  .stdout()
  .command(['resources:install', `--cwd=${cwd}`])
  .it('runs resources install cmd', () => {
    const rootfiles = readdirSync(resolve(cwd, 'resources'))

    /* Check if all sql files got extracted */
    expect(rootfiles).to.lengthOf(1)
    expect(rootfiles).to.contain('pNotify')
  })
})
