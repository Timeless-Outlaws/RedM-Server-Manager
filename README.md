RedM Server Manager
=================

A CLI server manager written for the dockerized FiveM server.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/redm-server-manager.svg)](https://npmjs.org/package/redm-server-manager)
[![CircleCI](https://circleci.com/gh/Timeless-Outlaws/RedM-Server-Manager/tree/main.svg?style=shield)](https://circleci.com/gh/Timeless-Outlaws/RedM-Server-Manager/tree/main)
[![Downloads/week](https://img.shields.io/npm/dw/redm-server-manager.svg)](https://npmjs.org/package/redm-server-manager)
[![License](https://img.shields.io/npm/l/redm-server-manager.svg)](https://github.com/Timeless-Outlaws/RedM-Server-Manager/blob/main/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g redm-server-manager
$ rsm COMMAND
running command...
$ rsm (--version)
redm-server-manager/0.0.5 linux-x64 node-v17.2.0
$ rsm --help [COMMAND]
USAGE
  $ rsm COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`rsm build-info [TYPE] [URL]`](#rsm-build-info-type-url)
* [`rsm extract-sql [RESOURCESDIRECTORY]`](#rsm-extract-sql-resourcesdirectory)
* [`rsm help [COMMAND]`](#rsm-help-command)
* [`rsm resources install`](#rsm-resources-install)

## `rsm build-info [TYPE] [URL]`

Fetches information about the latest build from the fivem build server.

```
USAGE
  $ rsm build-info [TYPE] [URL]

DESCRIPTION
  Fetches information about the latest build from the fivem build server.

EXAMPLES
  $ rsm build-info latest http://runtime.fivem.net/artifacts/fivem/build_proot_linux/master
```

_See code: [src/commands/build-info.ts](https://github.com/bumbummen99/RedM/blob/v0.0.5/src/commands/build-info.ts)_

## `rsm extract-sql [RESOURCESDIRECTORY]`

describe the command here

```
USAGE
  $ rsm extract-sql [RESOURCESDIRECTORY]

DESCRIPTION
  describe the command here

EXAMPLES
  $ rsm extract-sql ./resources
```

_See code: [src/commands/extract-sql.ts](https://github.com/bumbummen99/RedM/blob/v0.0.5/src/commands/extract-sql.ts)_

## `rsm help [COMMAND]`

Display help for rsm.

```
USAGE
  $ rsm help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for rsm.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.10/src/commands/help.ts)_

## `rsm resources install`

Installs the resources as defined in resources.json or adds new resource

```
USAGE
  $ rsm resources install [-d <value>] [-o <value>]

FLAGS
  -d, --definition=<value>
  -o, --directory=<value>

DESCRIPTION
  Installs the resources as defined in resources.json or adds new resource

EXAMPLES
  $ rsm resources install
```
<!-- commandsstop -->
