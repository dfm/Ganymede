"use strict";

import * as which from "which";
import { Locator } from "./locator";

export class PathLocator extends Locator {

  async locateJupyterLabExecutables () {
    return new Promise<string[]>((resolve, reject) => {
      which("jupyter-lab", (error, path) => {
        if (error) {
          reject(error);
        } else {
          resolve([path]);
        }
      });
    });
  }

}