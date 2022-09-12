import React from "react";

import Address from "../Address";
import { BigNumber } from "ethers";

const { utils } = require("ethers");

const tryToDisplay = (thing, asText = false, blockExplorer) => {
  if (thing && BigNumber.isBigNumber(thing)) {
    if (thing.gt(utils.parseUnits("0.01"))) {
      const displayable = `${thing.toString()} (Ξ ${utils.formatUnits(thing, "ether")})`;
      return asText ? thing.toString() : displayable;
    } else {
      return thing.toString();
    }
  }
  if (thing && thing.indexOf && thing.indexOf("0x") === 0 && thing.length === 42) {
    return asText ? thing : <Address address={thing} fontSize={14} blockExplorer={blockExplorer} />;
  }
  if (thing && thing.constructor && thing.constructor.name === "Array") {
    const mostReadable = v => (["number", "boolean"].includes(typeof v) ? v : tryToDisplayAsText(v));
    const displayable = JSON.stringify(thing.map(mostReadable));
    return asText ? (
      displayable
    ) : (
      <span style={{ overflowWrap: "break-word", width: "100%" }}>{displayable.replaceAll(",", ",\n")}</span>
    );
  }
  return JSON.stringify(thing);
};

const tryToDisplayAsText = thing => tryToDisplay(thing, true);

const isPositiveInteger = str => {
  if (typeof str !== "string") {
    return false;
  }

  const num = Number(str);

  return Number.isInteger(num) && num > 0;
};

export { tryToDisplay, tryToDisplayAsText, isPositiveInteger };
