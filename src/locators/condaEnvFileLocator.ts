"use strict";

import { homedir } from "os";
import * as path from "path";
import { readFileSync, existsSync } from "fs";

import { Locator } from "./locator";

// Locate jupyter-lab executables in the environments listed in the conda environments file
export class CondaEnvFileLocator extends Locator {

  async locateJupyterLabExecutables () {
    const homeDir = homedir();
    if (!homeDir) {
      return [];
    }

    const envFilePath = path.join(homeDir, '.conda', 'environments.txt');
    if (!existsSync(envFilePath)) {
      return [];
    }

    const fileContents = readFileSync(envFilePath, {encoding: 'utf8'});
    const lines = fileContents.split(/[\r\n]+/);
    return lines.map(function (value) {
      return value + "/bin/jupyter-lab";
    }).filter(function (element) {
      return existsSync(element);
    });
  }
}