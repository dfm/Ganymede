"use strict";

import { Menu, dialog } from "electron";
import fs from "fs";
import path from "path";

const isMac = process.platform === "darwin";

export function setup(createWindow: () => void) {
  let template: any[] = [
    { role: "appMenu" },
    { role: "editMenu" },
    { role: "viewMenu" },
    { role: "windowMenu" }
  ]
  template.splice(1, 0, {
    label: "File",
    submenu: [
      {
        label: "New Workspace", accelerator: "CmdOrCtrl+N", click: () => {
          createWindow();
        }
      },
      {
        label: 'Install CLI', click: function () {
          installCLI();
        }
      },
      { type: 'separator' },
      isMac ? { role: 'close' } : { role: 'quit' }
    ]
  })

  let menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function installCLI() {
  const script_path = path.resolve(process.resourcesPath, "ganymede.sh");
  const target_path = "/usr/local/bin/ganymede";

  fs.unlink(target_path, function () {
    fs.symlink(script_path, target_path, function (error) {
      if (error != null) {
        dialog.showMessageBox({
          type: "error",
          message: `Failed to install CLI:\n\n${error}`,
          buttons: ["OK"]
        });
      }
    });
  });
}