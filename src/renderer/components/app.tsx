"use strict";

import "./app.css";

import React from "react";
import ReactDOM from "react-dom";
import { ipcRenderer } from "electron";

import { EnvList } from "./envList";
import { Spinner } from "./spinner";

import { locateAll } from "../../common/locate";
import { EnvInterface } from "../../common/envInterface";

interface AppState {
  working: boolean;
  envs: EnvInterface[];
}

class App extends React.Component<{}, AppState> {
  index: number;

  constructor(props: any) {
    super(props);
    this.state = {
      working: true,
      envs: ([] as EnvInterface[])
    };
    this.showEnvs = this.showEnvs.bind(this);

    const urlParams = new URLSearchParams(window.location.search);
    const newIndex = urlParams.get("index");
    if (!newIndex) {
      this.index = -1;
    } else {
      this.index = parseInt(newIndex);
    }
  }

  render() {
    if (this.state.working) {
      return <Spinner />;
    }
    const self = this;
    return <EnvList
      envs={this.state.envs}
      onClick={(env: EnvInterface) => {
        ipcRenderer.send("launch-server", self.index, env);
        self.setState({ working: true });
      }} />;
  }

  showEnvs(event: any, envs: EnvInterface[]) {
    this.setState({ working: false, envs: envs });
  }

  componentDidMount() {
    const self = this;
    ipcRenderer.on("show-envs", this.showEnvs);
    ipcRenderer.on("stop-working", () => {
      self.setState({ working: false });
    });
    locateAll().then((envs) => {
      ipcRenderer.send("cache-envs", envs);
      self.showEnvs(null, envs);
    });
  }

  componentWillUnmount() {
    ipcRenderer.removeListener("show-envs", this.showEnvs);
  }
}

export function startApp() {
  ReactDOM.render(<App />, document.getElementById("app"));
}