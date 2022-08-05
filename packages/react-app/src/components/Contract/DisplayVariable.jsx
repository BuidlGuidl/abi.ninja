import React, { useCallback, useEffect, useState } from "react";
import { Button, Tooltip } from "antd";
import { CopyToClipboard } from "react-copy-to-clipboard";

import { tryToDisplay } from "./utils";

const DisplayVariable = ({ contractFunction, functionInfo, refreshRequired, triggerRefresh, blockExplorer }) => {
  const [variable, setVariable] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const funcResponse = await contractFunction();
      setVariable(funcResponse);
      triggerRefresh(false);
    } catch (e) {
      console.log(e);
    }
  }, [setVariable, contractFunction, triggerRefresh]);

  useEffect(() => {
    refresh();
  }, [refresh, refreshRequired, contractFunction]);

  const value = tryToDisplay(variable, false, blockExplorer);
  const valueAsText = tryToDisplay(variable, true, blockExplorer);

  return (
    <div className="contract-variable">
      <div
        className="contract-variable-name"
        style={{
          paddingRight: 6,
          display: "flex",
          alignItems: "center",
        }}
      >
        {functionInfo.name} <Button style={{ fontSize: 12 }} type="link" onClick={refresh} icon="🔄" />
      </div>
      <div className="contract-variable-value">
        <Tooltip title="copied!" placement="topLeft" visible={isCopied}>
          <CopyToClipboard
            text={valueAsText}
            onCopy={() => {
              setIsCopied(true);
              setTimeout(() => {
                setIsCopied(false);
              }, 500);
            }}
          >
            <p>{value}</p>
          </CopyToClipboard>
        </Tooltip>
      </div>
    </div>
  );
};

export default DisplayVariable;
