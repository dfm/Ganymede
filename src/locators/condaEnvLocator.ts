"use strict";

import { exec } from "child_process";
import * as which from "which";
import * as path from "path";
import { existsSync } from "fs";

import { Locator } from "./locator";
import { CondaLocator } from "./condaLocator";
import { getUniqueStrings } from "./utils";

// Locate conda environments by querying the 'conda' executables
export class CondaEnvLocator extends Locator {

  async locateJupyterLabExecutables () {
    // Find the conda executables
    const conda = new CondaLocator();
    let condaPaths = await conda.locateCondaExecutables();

    condaPaths.unshift(await new Promise<string>((resolve, reject) => {
      which("conda", (err, path) => {
        if (err) {
          reject(err);
        } else {
          resolve(path);
        }
      });
    }));

    condaPaths = getUniqueStrings(condaPaths);

    return Promise.all(condaPaths.map(value => {
      return new Promise<string[]>((resolve, reject) => {
        exec(value + " info --json", (error, stdout, stderr) => {
          if (error) {
            resolve([]);
          } else {
            const condaInfo = JSON.parse(stdout.toString());
            if ("envs" in condaInfo) {
              resolve(condaInfo["envs"]);
            } else {
              resolve([]);
            }
          }
        });
      });
    })).then(list_of_lists => {
      return [].concat.apply([], list_of_lists).map((fn: string) => {
        return path.resolve(fn, "bin/jupyter-lab");
      }).filter((fn: string) => {
        return existsSync(fn);
      });
    });
  }

}
