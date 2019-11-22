"use strict";

import "./envList.css"
import React from "react";
import { remote } from "electron";
import { EnvInterface } from "../../common/envInterface";

interface EnvProps {
  env: EnvInterface;
  onClick: (env: EnvInterface) => void;
}

class Env extends React.Component<EnvProps, {}> {
  render() {
    const env = this.props.env;
    return (
      <div className="env" onClick={() => this.props.onClick(env)}>
        <div className="env-path">{env.path}</div>
        <div className="env-python">{env.pythonVersion}</div>
        <div className="env-jupyter">JupyterLab {env.jupyterLabVersion}</div>
      </div>
    );
  }
}

interface EnvListProps {
  envs: EnvInterface[];
  onClick: (env: EnvInterface) => void;
}

export class EnvList extends React.Component<EnvListProps, {}> {
  render() {
    const self = this;
    const envs = this.props.envs.map((env: EnvInterface, index) => {
      return <Env key={index} env={env} onClick={self.props.onClick} />;
    });
    return (
      <div className="env-list">
        <div className="env-header">Choose a jupyter-lab instance:</div>
        {envs}
        <div className="env-custom-path" onClick={() => {
          const jupyterPaths = remote.dialog.showOpenDialogSync({
            title: "Choose a jupyter-lab instance",
            message: "Choose a jupyter-lab instance",
          });
          if (jupyterPaths && jupyterPaths.length) {
            self.props.onClick({
              path: jupyterPaths[0],
              pythonVersion: "custom",
              jupyterLabVersion: "custom"
            });
          }
        }}>or choose a custom instance.</div>
      </div>
    )
  }
}