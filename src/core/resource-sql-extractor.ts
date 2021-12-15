import {basename, resolve} from 'node:path'
import {existsSync, Dirent} from 'node:fs'
import {readdir, readFile, writeFile} from 'node:fs/promises'

export default class ResourceSQLExtractor {
  _initdbDirectory: string

  _resourcesDirectory: string

  constructor(initdbDirectory: string = resolve(process.cwd()), resourcesDirectory: string = resolve(process.cwd())) {
    this._initdbDirectory = resolve(initdbDirectory, 'initdb')
    this._resourcesDirectory = resolve(resourcesDirectory, 'resources')
  }

  async extract(directory: string = this._resourcesDirectory): Promise<void> {
    /* Make sure the path is resolved */
    directory = resolve(directory)

    /* Check if the directory is valid */
    if (existsSync(directory)) {
      /* Check if the directory is a resource root */
      if (existsSync(resolve(directory, 'fxmanifest.lua')) || existsSync(resolve(directory, '__resource.lua'))) {
        /* Process all .sql files in the root of the resource */
        const directories: string[] = await readdir(directory)
        for (const sqlFile of directories.filter(path => path.split('.').pop() === 'sql')) {
          this.extractSQL(sqlFile)
        }
      } else {
        /* Get all subdirectories of the directory */
        const subdirectories: Dirent[] = await readdir(directory, {withFileTypes: true})

        /* Initialize empty promises array to wait for all subdirectories to finish in parallel */
        const promises: PromiseLike<void>[] = []

        /* Process all subDirectories if this is not a resource root */
        for (const subDirectory of subdirectories.filter((dirent: Dirent) => dirent.isDirectory()).map((dirent: Dirent) => dirent.name)) {
          promises.push(this.extract(subDirectory))
        }

        /* Search subdirectories in parallel */
        await Promise.all(promises)
      }
    }
  }

  async extractSQL(file: string): Promise<void> {
    /* Make sure the file does exist first */
    if (existsSync(file)) {
      /* Get the files contents */
      const content: Buffer = await readFile(file)
      let sql: string = content.toString()

      /* Check if the SQL does define the used database */
      if (!sql.includes('USE')) {
        /* Prepend the SQL with a use directive */
        sql = `USE ${process.env.MYSQL_DEFAULT_DATABASE}\n` + sql
      }

      /* Write to initdb */
      await writeFile(resolve(this._initdbDirectory, `999-${basename(file)}.sql`), sql)
    }
  }
}
