"use strict";

import os from "os";
import fs from "fs";
import glob from "glob";
import path from "path";
import which from "which";
import logger from "electron-log";
import { exec } from "child_process";

import settings from "./settings";
import untildify from "./untildify";
import { EnvInterface } from "./envInterface";

const homedir = `${os.homedir()}/`;

class Locator { }

class KnownPathLocator extends Locator {
  async getSearchPaths(debug = false) {
    const paths: string[] = settings.get("settings", [] as string[]);
    return paths;
  }
}

// Find the default jupyter-lab instance in the PATH
class PathLocator extends Locator {
  async getSearchPaths(debug = false) {
    return new Promise<string[]>(resolve => {
      which("jupyter-lab", (error, filename) => {
        if (error || !filename) {
          if (debug) {
            logger.error(error);
          }
          resolve([]);
        } else {
          resolve([path.dirname(path.resolve(filename))]);
        }
      });
    });
  }
}

// Find conda instances in known paths
// Ref: https://github.com/microsoft/vscode-python/blob/master/
//                 src/client/interpreter/locators/services/condaService.ts
class CondaLocator extends Locator {
  isWindows: boolean = process.platform === "win32";
  condaGlobPathsForLinuxMac: string[] = [
    '/opt/*conda*/bin/conda',
    '/usr/share/*conda*/bin/conda',
    untildify('~/*conda*/bin/conda')];
  condaGlobPathsForWindows: string[] = [
    '/ProgramData/[Mm]iniconda*/Scripts/conda.exe',
    '/ProgramData/[Aa]naconda*/Scripts/conda.exe',
    untildify('~/[Mm]iniconda*/Scripts/conda.exe'),
    untildify('~/[Aa]naconda*/Scripts/conda.exe'),
    untildify('~/AppData/Local/Continuum/[Mm]iniconda*/Scripts/conda.exe'),
    untildify('~/AppData/Local/Continuum/[Aa]naconda*/Scripts/conda.exe')];

  async getSearchPaths(debug = false) {
    let globs = this.condaGlobPathsForLinuxMac;
    if (this.isWindows) {
      globs = this.condaGlobPathsForWindows;
    }
    let paths: Promise<string[]>[] = [];
    for (const g of globs) {
      const newPaths = new Promise<string[]>(resolve => {
        glob(g, (err: any, matches: string[]) => {
          if (err) {
            if (debug) {
              logger.error(err);
            }
            resolve([]);
          } else {
            resolve(matches);
          }
        })
      });
      paths.push(newPaths);
    }
    return Promise.all(paths).then((values: string[][]) => {
      return ([] as string[]).concat.apply([], values).map(
        (filename: string) => path.dirname(path.resolve(filename)));
    });
  }
}

// Find conda environments that are known by each conda instance
// found by the CondaLocator
class CondaEnvLocator extends Locator {
  isWindows: boolean = process.platform === "win32";
  async getSearchPaths(condaSearchPaths?: Promise<string[]>, debug = false) {
    if (!condaSearchPaths) {
      const locator = new CondaLocator();
      condaSearchPaths = locator.getSearchPaths(debug);
    }
    let execName: string = "conda";
    if (this.isWindows) {
      execName = "conda.exe";
    }
    let envPaths: Promise<string[]>[] = [];
    for (const root of await condaSearchPaths) {
      const condaPath = path.resolve(root, execName);
      envPaths.push(new Promise<string[]>((resolve) => {
        exec(condaPath + " info --json", (error, stdout) => {
          if (error) {
            if (debug) {
              logger.error(error);
            }
            resolve([]);
          } else {
            const condaInfo = JSON.parse(stdout.toString());
            if (condaInfo.envs) {
              resolve(condaInfo.envs);
            } else {
              if (debug) {
                logger.error("Couldn't parse info: " + condaInfo);
              }
              resolve([]);
            }
          }
        });
      }));
    }
    return Promise.all(envPaths).then((envPaths: string[][]) => {
      return ([] as string[]).concat.apply([], envPaths).map(
        (filename: string) => path.resolve(filename, "bin"));
    });
  }
}

class CondaEnvFileLocator extends Locator {
  envFilePath = untildify("~/.conda/environments.txt");
  async getSearchPaths(debug = false) {
    return new Promise<string[]>(resolve => {
      fs.readFile(this.envFilePath, { encoding: "utf8" }, (error, data) => {
        if (error) {
          if (debug) {
            logger.error(error);
          }
          resolve([]);
        } else {
          resolve(data.split(/[\r\n]+/).map(value => path.resolve(value, "bin")));
        }
      });
    });
  }
}

// Call "--version" on an executable and return the stdout
async function getVersion(executable: string) {
  return new Promise<string>((resolve, reject) => {
    exec(executable + " --version", (error, stdout) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout.toString().trim());
      }
    });
  });
}

function tildify(pathname: string): string {
  if (pathname.startsWith(homedir)) {
    return pathname.replace(homedir, "~/");
  }
  return pathname;
}

// Get the jupyter-lab and python versions for an environment
async function getEnvInfo(searchPath: string): Promise<EnvInterface | null> {
  const jupyterLabPath = path.resolve(searchPath, "jupyter-lab");
  const jupyterLabVersion = getVersion(jupyterLabPath);
  const pythonVersion = getVersion(path.resolve(searchPath, "python"));
  return Promise.all([jupyterLabPath, pythonVersion, jupyterLabVersion]).then((value) => {
    return {
      path: tildify(value[0]),
      pythonVersion: value[1],
      jupyterLabVersion: value[2]
    }
  }).catch(() => null);
}

// Locate all the jupyter-lab executables
export async function locateAll(debug = false): Promise<EnvInterface[]> {
  const paths: Promise<string[]>[] = [];

  const pathLocator = new PathLocator();
  paths.push(pathLocator.getSearchPaths(debug));

  const knownPathLocator = new KnownPathLocator();
  paths.push(knownPathLocator.getSearchPaths(debug));

  const condaLocator = new CondaLocator();
  const condaPaths = condaLocator.getSearchPaths(debug);
  paths.push(condaPaths);

  const condaEnvFileLocator = new CondaEnvFileLocator();
  paths.push(condaEnvFileLocator.getSearchPaths(debug));

  const condaEnvLocator = new CondaEnvLocator();
  paths.push(condaEnvLocator.getSearchPaths(condaPaths, debug));

  const flattened = Promise.all(paths).then(paths => {
    const array = ([] as string[]).concat.apply([], paths);
    return array.filter((element: string, index: number, array: string[]) => {
      return array.indexOf(element) === index;
    });
  });

  const envInfo = flattened.then(searchPaths => {
    return Promise.all(searchPaths.map(getEnvInfo));
  });

  // Can't use a filter operation because TS can't work out that it'll
  // never be null
  return envInfo.then(envs => {
    let finalEnvs: EnvInterface[] = [];
    for (const env of envs) {
      if (env) {
        finalEnvs.push(env);
      }
    }
    return finalEnvs;
  });
}
