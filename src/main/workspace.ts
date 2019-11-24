"use strict";

import { BrowserWindow, dialog } from "electron";

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
