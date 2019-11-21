"use strict";

import "./spinner.css"
import React from "react";

export function Spinner(props: any) {
  return (
    < div id="spinner">
      <div className="lds-ring">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div >
  );
}
