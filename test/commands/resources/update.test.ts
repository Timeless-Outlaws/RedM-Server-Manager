import {expect, test} from '@oclif/test'

describe('build-info', () => {
  /* Run the command */
  test
  .stdout()
  .command(['build-info'])
  .it('runs build-info cmd', ctx => {
    expect(ctx.stdout).to.match(/Build:\s".*",\sCommit:\s".*"/)
  })
})
