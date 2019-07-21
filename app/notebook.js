const { app, dialog } = require('electron')
const { exec } = require('child_process')
const { existsSync, readFileSync } = require('fs')
const settings = require('electron-settings')
const { win, connectWindowToJupyter } = require('./window')

const homedir = require('os').homedir()
const envfile = homedir + "/.conda/environments.txt"
const re = /(http:\/\/localhost:[0-9]+\/\?token=[a-f0-9]+)/

let notebook = module.exports.notebook = null
let url = null

function getCondaJupyterLabPath () {
  // Default to the base anaconda environment if it exists
  defaultPath = homedir
  jupyterLabPath = null

  if (existsSync(envfile)) {
    lines = readFileSync(envfile, {encoding: 'utf8'}).split('\n')
    if (lines.length) {
      defaultPath = lines[0] + '/bin'
    }
    for (line in lines) {
      path = lines[line] + '/bin/jupyter-lab'
      if (existsSync(path)) {
        jupyterLabPath = path
        break
      }
    }
  }

  return {defaultPath: defaultPath, jupyterLabPath: jupyterLabPath}
}

function getJupyterLabPath (reset=false) {
  if (!reset && settings.has('jupyterlabpath')) {
    return settings.get('jupyterlabpath')
  }

  condaPaths = getCondaJupyterLabPath()
  if (!reset && condaPaths.jupyterLabPath !== null) {
    path = condaPaths.jupyterLabPath;
  } else {
    path = dialog.showOpenDialog(win, {
      message: "Select a 'jupyter-lab' executable",
      defaultPath: condaPaths.defaultPath,
      properties: ['openFile']
    })
  }
  settings.set('jupyterlabpath', path)

  return path
}

let launchNotebook = module.exports.launchNotebook = (reset=false) => {
  url = null

  if (notebook !== null) {
    notebook.kill()
    notebook = null
  }

  options = {shell: true, stdio: "inherit", cwd: homedir}
  jupyterlab_path = getJupyterLabPath(reset)

  notebook = exec(
    jupyterlab_path + ' --no-browser -y', options,
    (error, stdout, stderr) => {
      if (error) {
        notebook = null
        dialog.showMessageBox({
          type: 'error', buttons: ['Try Again', 'Quit'],
          title: "Jupyter Lab failed to launch",
          message: 'Jupyter Lab failed with the error:\n' + error
        }, (response) => {
          if (response == 0) {
            launchNotebook(true)
          } else {
            app.quit()
          }
        })
      }
    })

  // Catch errors
  notebook.on('error', (error) => {
    notebook = null
  })

  // Search for the URL in stderr
  notebook.stderr.on('data', (data) => {
    if (url === null) {
      let results = re.exec(data)
      if (results !== null) {
        url = results[0]
        connectWindowToJupyter(url)
      }
    }
  })
}
