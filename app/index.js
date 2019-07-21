const { app } = require('electron')
const { setupMenu } = require('./menu')
const { win, createWindow } = require('./window')
const { notebook, launchNotebook } = require('./notebook')

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  setupMenu()
  createWindow()
  launchNotebook()
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  app.quit()
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

app.on("quit", () => {
  if (notebook !== null) {
    notebook.kill()
  }
})