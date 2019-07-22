import { BrowserWindow } from "electron"
import { JupyterServer } from "./server"

export class Workspace {

  window = null;
  server = null;

  start () {
    let self = this;

    this.window = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true
      }
    });

    // Emitted when the window is closed.
    this.window.on("closed", function () {
      self.stop();
    });

    if (this.server != null) {
      this.server.stop();
      this.server = null;
    }
    this.server = new JupyterServer();
    this.server.start(this);
  }

  stop () {
    this.window = null;
    if (this.server != null) {
      this.server.stop();
      this.server = null;
    }
  }

}