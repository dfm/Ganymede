"use strict";

import { locateAll, untildify } from "../common/locate";
import { JupyterProcess } from "../common/jupyterProcess";
import { EnvInterface } from "../common/envInterface";
import * as yargs from "yargs";
import { app, BrowserWindow, ipcMain, dialog } from "electron";
import * as path from "path";
import { format as formatUrl } from "url";

const isDevelopment = process.env.NODE_ENV !== "production";

class Workspace {
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
        console.log(`ERROR: ${error}`);
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
let workspaces: { [key: number]: Workspace } = {};

let envCache: EnvInterface[];

function createWindow(cwd?: string) {
  if (!cwd) {
    cwd = untildify("~");
  }
  const window = new BrowserWindow({
    title: `Ganymede: ${cwd}`,
    webPreferences: {
      nodeIntegration: true
    }
  });

  const workspace = new Workspace(cwd, window);

  // Save the window with a unique id
  let index = 0;
  while (workspaces[index]) {
    ++index;
  }
  workspaces[index] = workspace;

  let url: string;
  if (isDevelopment) {
    url = `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`;
  }
  else {
    url = formatUrl({
      pathname: path.join(__dirname, "index.html"),
      protocol: "file",
      slashes: true
    });
  }

  // Open the browser
  window.loadURL(url);

  // When it's ready, tell it what its ID is or send it the cached environments
  window.webContents.on("did-finish-load", () => {
    if (envCache) {
      window.webContents.send("show-envs", envCache);
    } else {
      window.webContents.send("set-index", index);
    }
  });

  // Shut down the server on close
  window.on("closed", () => {
    workspace.stop();
    delete workspaces[index];
  });

  // Don't let JupyterLab set the window title
  window.on("page-title-updated", event => event.preventDefault());

  // Deal with the fact that JupyterLab cancels closing the window if there are
  // unsaved changes
  window.webContents.on("will-prevent-unload", event => {
    const result = dialog.showMessageBoxSync(window, {
      type: "question",
      buttons: ["Continue", "Cancel"],
      title: "Unsaved changes will be lost",
      message: "Closing this window will cause unsaved changes to be lost.",
      defaultId: 0,
      cancelId: 1
    });
    if (result === 0) {
      event.preventDefault();
    }
  });
}

app.on("ready", () => {
  let args = yargs.parse(process.argv.slice(1));
  if (!app.isPackaged) {
    args = yargs.parse(process.argv.slice(2));
  }

  const path = args["path-environment"];
  if (path) {
    process.env.PATH = path as string;
  }

  let cwd = untildify("~");
  const execFrom = args["executed-from"];
  if (execFrom) {
    cwd = execFrom as string;
  }
  console.log(cwd);

  // Just run the locator
  if (args.locate) {
    locateAll().then(values => {
      console.log(values);
      app.quit();
    });
  } else {
    createWindow(cwd);
  }
});

app.on("activate", () => {
  if (!Object.keys(workspaces).length) {
    createWindow()
  }
});

app.on("window-all-closed", function () {
  app.quit()
});

app.on("quit", function () {
  for (let index in workspaces) {
    workspaces[index].stop();
    delete workspaces[index];
  }
});

ipcMain.on("launch-server", (event, index, env: EnvInterface) => {
  console.log(index, env);
  const workspace = workspaces[index];
  if (workspace) {
    workspace.start(env.path);
  }
});

ipcMain.on("cache-envs", (event, envs: EnvInterface[]) => {
  envCache = envs;
});