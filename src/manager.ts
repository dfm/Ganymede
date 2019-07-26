import { Workspace } from "./workspace";
import { JupyterServer } from "./server";

export class WorkspaceManager {
  workspaces = [];
  activeWorkspace = null;

  startNewWorkspace (directory=null, path=null) {
    let self = this;
    let workspace = new Workspace();
    workspace.start(directory, path);
    this.workspaces.push(workspace);

    workspace.window.on("focus", function () {
      self.activeWorkspace = workspace;
    });

    this.activeWorkspace = workspace;
  }

  changeJupyterExecutable () {
    if (this.activeWorkspace == null) {
      this.startNewWorkspace();
      return;
    }

    let server = this.activeWorkspace.server;
    if (server != null) {
      server.stop();
    } else {
      server = this.activeWorkspace.server = new JupyterServer();
    }

    server.findExecutable(true, false, this.activeWorkspace.window);
    server.start(this.activeWorkspace, server.directory);
  }

  restartActiveServer () {
    if (this.activeWorkspace == null) {
      return;
    }

    let server = this.activeWorkspace.server;
    if (server != null) {
      server.stop();
    } else {
      server = this.activeWorkspace.server = new JupyterServer();
    }

    server.start(this.activeWorkspace, server.directory);
  }

}