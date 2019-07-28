"use strict";

import { execSync } from "child_process";
import * as which from "which";
import * as path from "path";
import { existsSync } from "fs";

import { Locator } from "./locator";
import { CondaLocator } from "./condaLocator";
import { getUniqueStrings } from "./utils";

// Locate conda environments by querying the 'conda' executables
export class CondaEnvLocator extends Locator {

  locateJupyterLabExecutables () {
    // Find the conda executables
    let conda = new CondaLocator();
    let condaPaths = conda.locateCondaExecutables();

    // Add in the conda from the path
    try {
      condaPaths.unshift(which.sync("conda"));
    } catch (error) {}

    // Remove duplicates
    condaPaths = getUniqueStrings(condaPaths);

    // Find the environments given by each conda executable
    let envPaths = [].concat.apply([], condaPaths.map(function (file: string) {
      try {
        let info = execSync(file + " info --json");
        let condaInfo = JSON.parse(info.toString());
        if ("envs" in condaInfo) {
          return condaInfo["envs"];
        }
      } catch (error) {}
      return [];
    }));

    // Return that environments that have jupyer-lab installed
    return envPaths.map(function (fn: string) {
      return path.resolve(fn, "bin/jupyter-lab");
    }).filter(function (fn: string) {
      return existsSync(fn);
    });
  }

}
