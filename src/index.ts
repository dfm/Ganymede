import { app } from "electron";
import { dirname, basename } from "path";
import { setupMenu } from "./menu";
import { WorkspaceManager } from "./manager";

let manager = null;
let loadDirectory = null;
let loadPath = null;

app.on("ready", function () {
  manager = new WorkspaceManager();
  manager.startNewWorkspace(loadDirectory, loadPath);
  loadDirectory = null;
  loadPath = null;

  setupMenu(manager);
});

app.on("open-file", function (event, path) {
  if (app.isReady() && manager != null) {
    manager.startNewWorkspace(dirname(path), basename(path));
  } else {
    loadDirectory = dirname(path);
    loadPath = basename(path);
  }
})

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