import { BrowserWindow } from "electron"
import { JupyterServer } from "./server"
import { locateAll } from "./locators/locateAll";

export class Workspace {

  window = null;
  server = null;
  directory = null;
  url = null;

  start(directory = null, path = null) {
    let self = this;

    let window = new BrowserWindow({
      width: 800,
      height: 600,
      title: "Ganymede",
      webPreferences: {
        nodeIntegration: true
      }
    });

    window.on("close", function () {
      self.stop();
    });

    window.on("page-title-updated", function (event) {
      event.preventDefault();
    });

    window.loadFile("pages/selector.html");

    // window.on("action-select-env", (event, arg) => {
    //   console.log(event);
    // });

    this.window = window;

    locateAll().then(payload => {
      window.webContents.send("action-list-envs", payload);
    });

    // if (this.server != null) {
    //   this.server.stop();
    //   this.server = null;
    // }
    // this.server = new JupyterServer();
    // this.server.start(this, directory, path);
  }

  stop() {
    // if (this.server != null) {
    //   this.server.stop();
    //   this.server = null;
    // }
    // if (this.window != null) {
    //   this.window.destroy();
    //   this.window = null;
    // }
  }

  loadURL(url) {
    // this.window.loadURL(url);
    // this.url = url;
  }

}