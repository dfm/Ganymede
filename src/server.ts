import { homedir } from "os";
import { dialog } from "electron";
import { exec } from "child_process";
import { existsSync, readFileSync } from "fs";
import * as settings from "electron-settings";

const urlRegExp = /(http:\/\/localhost:[0-9]+\/\?token=[a-f0-9]+)/;
const homeDirPath = homedir();
const environFilename = homeDirPath + "/.conda/environments.txt";


export class JupyterServer {

  executable = null;
  proc = null;
  log: string;

  askForDirectory (window=null) {
    let directories = dialog.showOpenDialog(window, {
      message: "Select the root directory of your project",
      defaultPath: homeDirPath,
      properties: ["openDirectory"]
    });
    return directories[0];
  }

  getSavedExecutable () {
    return settings.get("jupyterlabpath");
  }

  askForExecutable (window=null) {
    return dialog.showOpenDialog(window, {
      message: "Select a 'jupyter-lab' executable",
      defaultPath: homeDirPath,
      properties: ["openFile"]
    });
  }

  getCondaJupyterLabPaths () {
    let paths = [];

    // Loop over the list of conda environments and check for 'jupyter-lab'
    if (existsSync(environFilename)) {
      let fileContents = readFileSync(environFilename, {encoding: 'utf8'});
      let lines = fileContents.split(/[\r\n]+/);
      paths = lines.filter(function (element, index, array) {
        let path = element + "/bin/jupyter-lab";
        return existsSync(path);
      })
    }

    return paths;
  }

  findExecutable (ask=false, save=true, window=null) {
    let path;
    if (ask) {
      path = this.askForExecutable(window);
    } else {
      path = this.getSavedExecutable();
      if (path == null) {
        let paths = this.getCondaJupyterLabPaths();
        if (paths.length) {
          path = paths[0];
        }
      }
      if (path == null) {
        path = this.askForExecutable(window);
      }
    }
    this.executable = path;
    if (save) {
      settings.set("jupyterlabpath", path);
    }
  }

  start (workspace, directory=null) {
    this.stop();

    if (this.executable == null) {
      this.findExecutable(false, true, workspace.window);
    }

    // Helper to display error dialogs
    function showError (error) {
      this.proc = null;
      dialog.showMessageBox({
        type: 'error', buttons: ['Reload', 'Close'],
        title: "Jupyter Lab crashed",
        message: 'Jupyter Lab crashed with the error:\n' + error
      }, function (response) {
        if (response == 0) {
          this.findExecutable(true);
          this.launch(workspace);
        } else {
          workspace.close();
        }
      });
    }

    // Launch the process
    if (directory == null) {
      directory = this.askForDirectory(workspace.window);
    }
    // let directory: string = this.askForDirectory(workspace.window);
    let options = {stdio: "inherit", cwd: directory};
    this.proc = exec(
      this.executable + ' --no-browser -y', options,
      function (error, stdout, stderr) {
        if (error) {
          showError(error);
        }
      }
    );

    // Catch errors
    this.proc.on("error", showError);

    // Search for the URL in stderr
    let url = null;
    this.log = "";
    this.proc.stderr.on("data", function (data) {
      if (url === null) {
        let results = urlRegExp.exec(data);
        if (results !== null) {
          url = results[0];
          workspace.window.loadURL(url);
        }
      }
      this.log += data;
    });

  }

  stop () {
    if (this.proc != null) {
      this.proc.kill();
      this.proc = null;
    }
  }

}