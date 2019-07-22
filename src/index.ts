import { app } from "electron";
import { dirname, basename } from "path";
import { Workspace } from "./workspace";
import { setupMenu } from "./menu";

let workspaces = [];
let loadDirectory = null;
let loadPath = null;

function startNewWorkspace (directory=null, path=null) {
  let workspace = new Workspace();
  workspace.start(directory, path);
  workspaces.push(workspace);
}

app.on("ready", function () {
  setupMenu(startNewWorkspace);
  startNewWorkspace(loadDirectory, loadPath);
  loadDirectory = null;
  loadPath = null;
  console.log(process.path)
});

app.on("open-file", function (event, path) {
  if (app.isReady()) {
    startNewWorkspace(dirname(path), basename(path));
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
  if (workspaces.length == 0) {
    startNewWorkspace();
  }
});

// app.on("quit", function () {
//   workspaces.forEach(function (workspace) {
//     // workspace.stop();
//   });
// });