"use strict";

import * as path from "path";
import { app } from "electron";
import logger from "electron-log";
import { writeFile, mkdir, unlink } from "fs";
import { exec, ChildProcess } from "child_process";

const logDirectory = path.join(app.getPath("userData"), "logs");

export class JupyterProcess {
  process: ChildProcess;
  logFile: string;
  stopped: boolean = false;

  constructor(execPath: string, cwd: string, callback?: (error: any, url: string | null) => void) {
    const self = this;

    const command = execPath + " --no-browser -y"
    this.process = exec(command, { cwd: cwd }, (error: any) => {
      if (error) {
        logger.error("[JupyterLab]: " + error);
        if (callback) {
          callback(error, null);
        }
      }
    });

    this.logFile = path.resolve(logDirectory, `ganymede-${this.process.pid}.log`);
    mkdir(logDirectory, { recursive: true }, error => {
      if (error) {
        logger.error(`Failed to create directory: ${logDirectory}`);
        logger.error(error);
      }
    });
    function log(data: any) {
      if (self.stopped) {
        return;
      }
      writeFile(self.logFile, data, { flag: "a" }, error => {
        if (error) {
          logger.error(`Failed to write to file: ${self.logFile}`);
          logger.error(error);
        }
      });
    }

    // Here we're monitoring stderr to find the URL for the server
    if (this.process.stderr) {
      const urlRegEx = /(http:\/\/localhost:[0-9]+\/\?token=[a-f0-9]+)/;
      let foundUrl = false;
      this.process.stderr.setEncoding("utf8");
      this.process.stderr.on("data", (data) => {
        log(data);
        if (!foundUrl) {
          const matches = urlRegEx.exec(data);
          if (matches && matches.length) {
            foundUrl = true;
            if (callback) {
              callback(null, matches[0]);
            }
          }
        }
      });
    }

    // Log the stdout to the default logger
    if (this.process.stdout) {
      this.process.stdout.setEncoding("utf8");
      this.process.stdout.on("data", log);
    }
  }

  stop() {
    this.process.kill();
    this.stopped = true;
    unlink(this.logFile, error => {
      if (error) {
        logger.error(`Failed to delete file: ${this.logFile}`);
        logger.error(error);
      }
    });
  }
}