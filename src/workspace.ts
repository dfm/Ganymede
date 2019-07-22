import { BrowserWindow } from "electron"
import { JupyterServer } from "./server"

export class Workspace {

  window = null;
  server = null;
  log = null;

  start (directory=null, path=null) {
    let self = this;

    this.log = new BrowserWindow({
      width: 800,
      height: 600,
      // show: false,
      webPreferences: {
        nodeIntegration: true
      }
    });
    this.log.loadFile("pages/log.html");

    this.window = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: false
      }
    });

    // Emitted when the window is closed.
    this.window.on("close", function () {
      self.stop();
    });

    this.log.on("close", function (event) {
      self.log.hide();
      event.preventDefault();
    });

    if (this.server != null) {
      this.server.stop();
      this.server = null;
    }
    this.server = new JupyterServer();
    this.server.start(this, directory, path);
  }

  stop () {
    if (this.server != null) {
      this.server.stop();
      this.server = null;
    }
    if (this.log != null) {
      this.log = null;
    }
    if (this.window != null) {
      this.window.destroy();
      this.window = null;
    }
  }

}