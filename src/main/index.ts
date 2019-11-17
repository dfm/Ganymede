"use strict";

import { locateAll } from "../common/locate";
import * as yargs from "yargs";
import { app, BrowserWindow } from "electron";
import * as path from "path";
import { format as formatUrl } from "url";

const isDevelopment = process.env.NODE_ENV !== "production";
let mainWindow: BrowserWindow | null;

function createWindow() {
  mainWindow = new BrowserWindow({
    title: "Ganymede",
    webPreferences: {
      nodeIntegration: true
    }
  });

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

  mainWindow.loadURL(url);
  mainWindow.on("closed", () => {
    mainWindow = null;
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

  let cwd = process.execPath;
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
    createWindow();
  }
});

app.on("activate", () => {
  if (!mainWindow) {
    createWindow()
  }
});


// import { app } from "electron";
// import * as yargs from "yargs";
// import * as fs from "fs";
// import { dirname, basename, resolve } from "path";
// import { setupMenu } from "./menu";
// import { WorkspaceManager } from "./manager";

// let manager = null;
// let loadDirectory = null;
// let loadPath = null;

// app.on("ready", function () {
//   let args;
//   if (app.isPackaged) {
//     args = yargs.parse(process.argv.slice(1));
//   } else {
//     args = yargs.parse(process.argv.slice(2));
//   }

//   if (args["path-environment"] != null) {
//     process.env.PATH = args["path-environment"];
//   }

//   let cwd = process.execPath;
//   if (args["executed-from"] != null) {
//     cwd = args["executed-from"];
//   }

//   manager = new WorkspaceManager();
//   setupMenu(manager);

//   if (args._.length) {
//     args._.forEach(function (element) {
//       let path = resolve(cwd, element);
//       manager.startNewWorkspace(path);
//     });
//   } else {
//     manager.startNewWorkspace(loadDirectory, loadPath);
//     loadDirectory = null;
//     loadPath = null;
//   }
// });

// app.on("open-file", function (event, path) {
//   if (app.isReady() && manager != null) {
//     manager.startNewWorkspace(path);
//   } else {
//     loadDirectory = dirname(path);
//     loadPath = basename(path);
//   }
// });

// // Quit when all windows are closed.
// app.on("window-all-closed", function () {
//   app.quit()
// });

// app.on("activate", function () {
//   // On macOS it's common to re-create a window in the app when the
//   // dock icon is clicked and there are no other windows open.
//   if (manager.workspaces.length == 0) {
//     manager.startNewWorkspace();
//   }
// });

// // app.on("quit", function () {
// //   workspaces.forEach(function (workspace) {
// //     // workspace.stop();
// //   });
// // });