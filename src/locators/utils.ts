"use strict";

export function getUniqueStrings (array: string[]) {
  return array.filter(function (element: string, index: number, array: string[]) {
    return array.indexOf(element) === index;
  })
}