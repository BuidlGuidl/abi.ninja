import { Button, Tooltip } from "antd";
import React, { useCallback, useEffect, useState } from "react";

import { tryToDisplay } from "./utils";

const DisplayVariable = ({ contractFunction, functionInfo, refreshRequired, triggerRefresh, blockExplorer }) => {
  const [variable, setVariable] = useState("");

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
        <Tooltip title={value} placement="bottomLeft">
          <p>{value}</p>
        </Tooltip>
      </div>
    </div>
  );
};

export default DisplayVariable;
