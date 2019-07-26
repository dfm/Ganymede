import { app } from "electron";
import * as yargs from "yargs";
import * as fs from "fs";
import { dirname, basename, resolve } from "path";
import { setupMenu } from "./menu";
import { WorkspaceManager } from "./manager";

let manager = null;
let loadDirectory = null;
let loadPath = null;

app.on("ready", function () {
  let args;
  if (app.isPackaged) {
    args = yargs.parse(process.argv.slice(1));
  } else {
    args = yargs.parse(process.argv.slice(2));
  }

  if (args["path-environment"] != null) {
    process.env.PATH = args["path-environment"];
  }

  let cwd = process.execPath;
  if (args["executed-from"] != null) {
    cwd = args["executed-from"];
  }

  manager = new WorkspaceManager();
  setupMenu(manager);

  if (args._.length) {
    args._.forEach(function (element) {
      let path = resolve(cwd, element);
      if (fs.existsSync(path)) {
        if (fs.lstatSync(path).isDirectory()) {
          manager.startNewWorkspace(path, null);
        } else {
          manager.startNewWorkspace(dirname(path), basename(path));
        }
      }
    });
  } else {
    manager.startNewWorkspace(loadDirectory, loadPath);
    loadDirectory = null;
    loadPath = null;
  }
});

app.on("open-file", function (event, path) {
  if (app.isReady() && manager != null) {
    manager.startNewWorkspace(dirname(path), basename(path));
  } else {
    loadDirectory = dirname(path);
    loadPath = basename(path);
  }
});

// Quit when all windows are closed.
app.on("window-all-closed", function () {
  app.quit()
});

app.on("activate", function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (manager.workspaces.length == 0) {
    manager.startNewWorkspace();
  }
});

// app.on("quit", function () {
//   workspaces.forEach(function (workspace) {
//     // workspace.stop();
//   });
// });