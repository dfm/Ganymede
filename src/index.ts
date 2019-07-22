import { app } from "electron";
import { dirname } from "path";
import { existsSync } from "fs";
import { Workspace } from "./workspace";
import { setupMenu } from "./menu";

let workspaces = [];
let loadDirectory = null;

function startNewWorkspace (directory=null) {
  let workspace = new Workspace();
  workspace.start(directory);
  workspaces.push(workspace);
}

app.on("ready", function () {
  setupMenu(startNewWorkspace);
  startNewWorkspace(loadDirectory);
});

app.on("open-file", function (event, path) {
  if (app.isReady()) {
    startNewWorkspace(dirname(path));
  } else {
    loadDirectory = dirname(path);
  }
})

// Quit when all windows are closed.
app.on("window-all-closed", function () {
  app.quit()
});

app.on("activate", function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (workspaces.length == 0) {
    startNewWorkspace();
  }
});

app.on("quit", function () {
  workspaces.forEach(function (workspace) {
    workspace.stop();
  });
});