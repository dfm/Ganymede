"use strict";

import { BrowserWindow, dialog } from "electron";

import { JupyterProcess } from "../common/jupyterProcess";

export class Workspace {
  cwd: string;
  window: BrowserWindow;
  server: JupyterProcess | null;
  path: string | undefined;

  constructor(cwd: string, window: BrowserWindow, path?: string) {
    this.cwd = cwd;
    this.window = window;
    this.server = null;
    this.path = path;
  }

  start(path: string) {
    const self = this;
    this.stop();
    this.server = new JupyterProcess(path, this.cwd, (error, url) => {
      if (error) {
        dialog.showMessageBox({
          type: "error",
          message: `Failed to launch jupyter-lab at path:\n\n${path}\n\nWith error:\n\n${error}`,
          buttons: ["OK"]
        });
        self.window.webContents.send("stop-working");
      } else if (url) {
        let fullUrl = new URL(url);
        if (self.path) {
          fullUrl.pathname += "lab/tree/" + self.path;
        }
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
