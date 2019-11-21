import React from "react";
import { EnvInterface } from "../../common/envInterface";

interface EnvProps {
  env: EnvInterface;
  onClick: (env: EnvInterface) => void;
}

class Env extends React.Component<EnvProps, {}> {
  render() {
    const env = this.props.env;
    return (
      <div onClick={() => this.props.onClick(env)}>{env.path}</div>
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
    return this.props.envs.map((env: EnvInterface, index) => {
      return <Env key={index} env={env} onClick={self.props.onClick} />;
    });
  }
}