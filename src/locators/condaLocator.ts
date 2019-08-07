"use strict";

import * as glob from "glob";
import * as path from "path";
import { existsSync } from "fs";

import { Locator } from "./locator";

const untildify: (value: string) => string = require('untildify');

// This glob pattern will match all of the following:
// ~/anaconda/bin/conda, ~/anaconda3/bin/conda, ~/miniconda/bin/conda, ~/miniconda3/bin/conda
// /usr/share/anaconda/bin/conda, /usr/share/anaconda3/bin/conda, /usr/share/miniconda/bin/conda, /usr/share/miniconda3/bin/conda
// Ref: https://github.com/microsoft/vscode-python/blob/master/src/client/interpreter/locators/services/condaService.ts
const condaGlobPathsForLinuxMac = [
  '/opt/*conda*/bin/conda',
  '/usr/share/*conda*/bin/conda',
  untildify('~/*conda*/bin/conda')];

// ...and for windows, the known default install locations:
const condaGlobPathsForWindows = [
  '/ProgramData/[Mm]iniconda*/Scripts/conda.exe',
  '/ProgramData/[Aa]naconda*/Scripts/conda.exe',
  untildify('~/[Mm]iniconda*/Scripts/conda.exe'),
  untildify('~/[Aa]naconda*/Scripts/conda.exe'),
  untildify('~/AppData/Local/Continuum/[Mm]iniconda*/Scripts/conda.exe'),
  untildify('~/AppData/Local/Continuum/[Aa]naconda*/Scripts/conda.exe')];


export class CondaLocator extends Locator {

  isWindows: boolean = process.platform === "win32";

  async locateCondaExecutables () {
    let globs = condaGlobPathsForLinuxMac;
    if (this.isWindows) {
      globs = condaGlobPathsForWindows;
    }
    let paths: string[] = [];
    for (const g of globs) {
      const newPaths = await new Promise<string[]>((resolve, reject) => {
        glob(g, (err, matches: string[]) => {
          if (err) {
            reject(err);
          } else {
            resolve(matches);
          }
        });
      });
      paths.push(...newPaths);
    }
    return paths;
  }

  async locateJupyterLabExecutables () {
    const condaExecs = await this.locateCondaExecutables();
    let results = [];
    for (const fn of condaExecs) {
      const jupyterLabPath = path.resolve(path.dirname(await fn), "jupyter-lab");
      results.push(jupyterLabPath);
    }
    return results;
    // return condaExecs.map(function (fn: string) {
    //   return path.resolve(path.dirname(fn), "jupyter-lab");
    // }).filter(function (fn: string) {
    //   return existsSync(fn);
    // });
  }

}
