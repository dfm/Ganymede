import { app } from "electron";
import { Workspace } from "./workspace";
import { setupMenu } from "./menu";

let workspaces = [];

function startNewWorkspace () {
  let workspace = new Workspace();
  workspace.start();
  workspaces.push(workspace);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", function () {
  setupMenu(startNewWorkspace);
  startNewWorkspace();
});

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