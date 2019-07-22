"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
var workspace_1 = require("./workspace");
var menu_1 = require("./menu");
var workspaces = [];
function startNewWorkspace() {
    var workspace = new workspace_1.Workspace();
    workspace.start();
    workspaces.push(workspace);
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electron_1.app.on("ready", function () {
    menu_1.setupMenu(startNewWorkspace);
    startNewWorkspace();
});
// Quit when all windows are closed.
electron_1.app.on("window-all-closed", function () {
    electron_1.app.quit();
});
electron_1.app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (workspaces.length == 0) {
        startNewWorkspace();
    }
});
electron_1.app.on("quit", function () {
    workspaces.forEach(function (workspace) {
        workspace.stop();
    });
});
//# sourceMappingURL=index.js.map