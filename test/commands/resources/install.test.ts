import {expect, test} from '@oclif/test'
import { readdirSync } from 'fs'
import { resolve } from 'path'

describe('resources install', () => {
  const cwd = 'test/resourceDirectories/resources/install'

  /* Check that the resources dir is empty first */
  expect(readdirSync(resolve(cwd))).to.lengthOf(0)

  /* Run the command */
  test
  .stdout()
  .command(['resources', 'init', cwd])
  .it('runs build-info cmd', ctx => {
    /* Check if all sql files got extracted */
    expect(readdirSync(resolve(cwd))).to.equal([
      'resources.json'
    ])
  })
})
