import { Menu } from "electron";
import { installCLI } from "./cli";

const isMac = process.platform === "darwin";

export function setupMenu (manager) {
  let template: any[] = [
    { role: 'appMenu' },
    { role: 'editMenu' },
    { role: 'viewMenu' },
    { role: 'windowMenu' }
  ]
  template.splice(1, 0, {
    label: 'File',
    submenu: [
      {label: 'New Workspace', accelerator: "CmdOrCtrl+N", click: function () {
        manager.startNewWorkspace();
      }},
      {label: 'Restart Server', click: function () {
        manager.restartActiveServer();
      }},
      {label: 'Set jupyter-lab Executable', click: function () {
        manager.changeJupyterExecutable();
      }},
      {label: 'Install CLI', click: function () {
        installCLI();
      }},
      { type: 'separator' },
      isMac ? { role: 'close' } : {role: 'quit'}
    ]
  })

  let menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}