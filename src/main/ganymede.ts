"use strict";

import * as path from "path";
import { format as formatUrl } from "url";
import { BrowserWindow, dialog, ipcMain } from "electron";

import { Workspace } from "./workspace";
import { untildify } from "../common/untildify";
import { EnvInterface } from "../common/envInterface";

const isDevelopment = process.env.NODE_ENV !== "production";
let workspaces: Workspace[] = [] as Workspace[];
let envCache: EnvInterface[];

export function createWindowIfNone(cwd?: string) {
  if (!Object.keys(workspaces).length) {
    createWindow();
  }
}

export function createWindow(cwd?: string) {
  const window = new BrowserWindow({
    title: "Ganymede",
    webPreferences: {
      nodeIntegration: true
    }
  });
  console.log(`window.id: ${window.id}`);

  if (!cwd) {
    let newCwds = dialog.showOpenDialogSync(
      window,
      {
        title: "Select a working directory",
        message: "Select a working directory",
        properties: ["openDirectory"]
      }
    );
    if (!newCwds || newCwds.length === 0) {
      cwd = untildify("~");
    } else {
      cwd = newCwds[0];
    }
  }
  window.setTitle(`Ganymede: ${cwd}`);

  const workspace = new Workspace(cwd, window);

  // Save the window with a unique id
  let index = window.id;
  workspaces[index] = workspace;

  let url: string;
  if (isDevelopment) {
    url = formatUrl({
      protocol: "http",
      hostname: "localhost",
      slashes: true,
      port: process.env.ELECTRON_WEBPACK_WDS_PORT,
      query: {
        index: index
      }
    })
  }
  else {
    url = formatUrl({
      pathname: path.join(__dirname, "index.html"),
      protocol: "file",
      slashes: true,
      query: {
        index: index
      }
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

export function quit() {
  for (let index in workspaces) {
    workspaces[index].stop();
    delete workspaces[index];
  }
}

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
