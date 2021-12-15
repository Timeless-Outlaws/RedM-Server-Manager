RedM Server Manager
=================

A CLI server manager written for the dockerized FiveM server.

[![Test](https://github.com/Timeless-Outlaws/RedM-Server-Manager/actions/workflows/Test.yml/badge.svg)](https://github.com/Timeless-Outlaws/RedM-Server-Manager/actions/workflows/Test.yml)
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
redm-server-manager/0.0.8 linux-x64 node-v17.2.0
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
* [`rsm resources init`](#rsm-resources-init)
* [`rsm resources install [RESOURCE] [PATH]`](#rsm-resources-install-resource-path)
* [`rsm resources remove [PATH]`](#rsm-resources-remove-path)
* [`rsm resources update`](#rsm-resources-update)

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

_See code: [lib/commands/build-info.js](https://github.com/bumbummen99/RedM/blob/v0.0.8/lib/commands/build-info.js)_

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

_See code: [lib/commands/extract-sql.js](https://github.com/bumbummen99/RedM/blob/v0.0.8/lib/commands/extract-sql.js)_

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

## `rsm resources init`

Initializes a new resources.json in the current directory

```
USAGE
  $ rsm resources init

DESCRIPTION
  Initializes a new resources.json in the current directory

EXAMPLES
  $ rsm resources init
```

## `rsm resources install [RESOURCE] [PATH]`

Installs the resources as defined in resources.json or adds new resource

```
USAGE
  $ rsm resources install [RESOURCE] [PATH] [-d <value>] [-o <value>]

FLAGS
  -d, --definition=<value>
  -o, --directory=<value>

DESCRIPTION
  Installs the resources as defined in resources.json or adds new resource

EXAMPLES
  $ rsm resources install
```

## `rsm resources remove [PATH]`

Removes resources from resources.json

```
USAGE
  $ rsm resources remove [PATH] [-d <value>] [-o <value>]

FLAGS
  -d, --definition=<value>
  -o, --directory=<value>

DESCRIPTION
  Removes resources from resources.json

EXAMPLES
  $ rsm resources remove <path>
```

## `rsm resources update`

Update resources in resources.json to their latest version based on the strategy

```
USAGE
  $ rsm resources update

DESCRIPTION
  Update resources in resources.json to their latest version based on the strategy

EXAMPLES
  $ rsm resources update
```
<!-- commandsstop -->
