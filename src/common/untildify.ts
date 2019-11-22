"use strict";

import os from "os";

export const homeDirectory = os.homedir();

export default function unfildify(pathWithTilde: string) {
  if (homeDirectory) {
    return pathWithTilde.replace(/^~(?=$|\/|\\)/, homeDirectory);
  }
  return pathWithTilde;
}