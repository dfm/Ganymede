"use strict";

import logger from "electron-log";
import { BrowserWindow } from "electron";

import { untildify } from "../common/untildify";
import { JupyterProcess } from "../common/jupyterProcess";

export class Workspace {
  cwd: string;
  window: BrowserWindow;
  server: JupyterProcess | null;

  constructor(cwd: string, window: BrowserWindow) {
    this.cwd = cwd;
    this.window = window;
    this.server = null;
  }

  start(path: string) {
    this.stop();
    this.server = new JupyterProcess(path, this.cwd, untildify("~/.ganymede/logs"), (error, url) => {
      if (error) {
        logger.error(`ERROR: ${error}`);
      } else if (url) {
        this.window.loadURL(url);
      }
    });
  }

  stop() {
    if (this.server) {
      this.server.stop();
      this.server = null;
    }
  }
}
