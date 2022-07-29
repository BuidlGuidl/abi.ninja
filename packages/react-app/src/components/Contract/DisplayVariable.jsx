import { Button, Divider } from "antd";
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

  return (
    <div className="contract-variable">
      <div
        style={{
          paddingRight: 6,
          color: "#b2b2b2",
          fontSize: 18,
          display: "flex",
          alignItems: "center",
        }}
      >
        {functionInfo.name} <Button style={{ fontSize: 12 }} type="link" onClick={refresh} icon="🔄" />
      </div>
      <div>
        <p>{tryToDisplay(variable, false, blockExplorer)}</p>
      </div>
    </div>
  );
};

export default DisplayVariable;
