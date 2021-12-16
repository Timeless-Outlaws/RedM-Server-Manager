import {expect, test} from '@oclif/test'
import {existsSync, readdirSync} from 'node:fs'
import {resolve} from 'node:path'

describe('resources install and remove', () => {
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
  .it('can add resources from git', () => {
    const files = readdirSync(resolve(cwd, 'resources'))

    /* Check if all sql files got extracted */
    expect(files).to.lengthOf(2)
    expect(files).to.contain('pNotify')
    expect(files).to.contain('fxmigrant')
  })

  test
  .stdout()
  .command(['resources:remove', 'pNotify', `--cwd=${cwd}`])
  .it('can remove resources from the definition', () => {
    const files = readdirSync(resolve(cwd, 'resources'))

    /* Check if all sql files got extracted */
    expect(files).to.lengthOf(1)
    expect(files).to.contain('fxmigrant')
  })

  test
  .stdout()
  .command(['resources:install', 'https://github.com/bumbummen99/pNotify/tarball/master', 'pNotify', `--cwd=${cwd}`])
  .it('can add resources from tarballs', () => {
    const files = readdirSync(resolve(cwd, 'resources'))

    /* Check if all sql files got extracted */
    expect(files).to.lengthOf(2)
    expect(files).to.contain('pNotify')
    expect(files).to.contain('fxmigrant')
  })

  test
  .stdout()
  .command(['resources:install', 'https://definitely.not/a/git/repo', 'doesnotmatter', `--cwd=${cwd}`])
  .it('Does not install nonsense URLs', () => {
    const files = readdirSync(resolve(cwd, 'resources'))

    /* Check if all sql files got extracted */
    expect(files).to.lengthOf(2)
    expect(files).to.contain('pNotify')
    expect(files).to.contain('fxmigrant')
  })
})
