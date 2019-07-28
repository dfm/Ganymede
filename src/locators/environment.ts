"use strict";

import * as path from "path";
import { execSync, spawnSync } from "child_process";
import { existsSync } from "fs";

export class PythonEnvironment {

  envPath: string;

  constructor (envPath: string) {
    this.envPath = envPath;
  }

  getPythonVersion () {
    let command = path.resolve(this.envPath, "python");
    if (!existsSync(command)) {
      return null;
    }
    try {
      let result = spawnSync(command, ["--version"]);
      if (!result.stderr) {
        return null;
      }
      return result.stderr.toString().trim();
    } catch(err) {
      return null;
    }
  }

  getJupyterLabVersion () {
    let command = path.resolve(this.envPath, "jupyter-lab");
    if (!existsSync(command)) {
      return null;
    }
    try {
      return execSync(command + " --version").toString().trim();
    } catch(err) {
      return null;
    }
  }

  getInfo () {
    return {
      path: this.envPath,
      pythonVersion: this.getPythonVersion(),
      jupyterLabVersion: this.getJupyterLabVersion()
    }
  }

}