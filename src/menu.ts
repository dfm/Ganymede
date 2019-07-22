import { Menu } from "electron";
// const { launchNotebook } = require('./notebook')
const isMac = process.platform === "darwin";

export function setupMenu (startNewWorkspace) {
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
        startNewWorkspace();
      }},
      isMac ? { role: 'close' } : {role: 'quit'},
      { type: 'separator' },
      // { label: 'Set jupyter-lab executable', click: () => {launchNotebook(true)} },
    ]
  })

  let menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}