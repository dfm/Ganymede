"use strict";

import * as which from "which";
import { Locator } from "./locator";

export class PathLocator extends Locator {

  locateJupyterLabExecutables () {
    try {
      return [which.sync("jupyter-lab")];
    } catch (error) {
      return null;
    }
  }

}