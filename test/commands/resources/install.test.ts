import {expect, test} from '@oclif/test'
import {existsSync, readdirSync} from 'node:fs'
import {resolve} from 'node:path'

describe('resources install', () => {
  const cwd = resolve('test', 'resourceDirectories', 'resources', 'install')

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
  .it('install from definition file', () => {
    const files = readdirSync(resolve(cwd, 'resources'))

    /* Check if all sql files got extracted */
    expect(files).to.lengthOf(1)
    expect(files).to.contain('pNotify')
  })

  test
  .stdout()
  .command(['resources:install', 'https://github.com/Timeless-Outlaws/fxmigrant.git', 'fxmigrant', `--cwd=${cwd}`])
  .it('can add resources to the definition', () => {
    const files = readdirSync(resolve(cwd, 'resources'))

    /* Check if all sql files got extracted */
    expect(files).to.lengthOf(1)
    expect(files).to.contain('pNotify')
    expect(files).to.contain('fxmigrant')
  })
})
