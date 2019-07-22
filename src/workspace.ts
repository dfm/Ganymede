import { BrowserWindow } from "electron"
import { JupyterServer } from "./server"

export class Workspace {

  window = null;
  server = null;
  directory = null;
  url = null;

  start (app, directory=null, path=null) {
    let self = this;

    this.window = new BrowserWindow({
      width: 800,
      height: 600,
      title: "Ganymede",
      webPreferences: {
        nodeIntegration: true
      }
    });

    this.window.on("close", function () {
      self.stop();
    });

    this.window.on("page-title-updated", function (event) {
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
    if (this.window != null) {
      this.window.destroy();
      this.window = null;
    }
  }

  loadURL (url) {
    this.window.loadURL(url);
    this.url = url;
  }

}