"use strict";

import * as path from "path";
import { exec } from "child_process";

export class PythonEnvironment {

  envPath: string;

  constructor (envPath: string) {
    this.envPath = envPath;
  }

  async _getVersion (command: string) {
    const fullCommand = path.resolve(this.envPath, command) + " --version";
    return new Promise<{stdout: string, stderr: string}>((resolve, reject) => {
      exec(fullCommand, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve({stdout: stdout.toString().trim(), stderr: stderr.toString().trim()});
        }
      });
    });
  }

  async getPythonVersion () {
    const result = await this._getVersion("python");
    return result.stderr;
  }

  async getJupyterLabVersion () {
    const result = await this._getVersion("jupyter-lab");
    return result.stdout;
  }

  async getInfo () {
    return {
      path: this.envPath,
      pythonVersion: await this.getPythonVersion(),
      jupyterLabVersion: await this.getJupyterLabVersion()
    }
  }

}