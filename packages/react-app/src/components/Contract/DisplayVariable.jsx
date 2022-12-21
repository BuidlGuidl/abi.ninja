import React, { useCallback, useEffect, useState } from "react";
import { Button, Tooltip } from "antd";

import { tryToDisplay } from "./utils";
import { RetweetOutlined } from "@ant-design/icons";
import Text from "antd/es/typography/Text";

const DisplayVariable = ({ contractFunction, functionInfo, refreshRequired, triggerRefresh, blockExplorer }) => {
  const [variable, setVariable] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const funcResponse = await contractFunction();
      setVariable(funcResponse);
      triggerRefresh(false);
    } catch (e) {
      console.log(e);
    }
    setIsRefreshing(false);
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
          fontWeight: 800,
        }}
      >
        {functionInfo.name}{" "}
        <Tooltip title="Refresh">
          <Button
            style={{ fontSize: 12 }}
            type="link"
            onClick={refresh}
            icon={<RetweetOutlined />}
            loading={isRefreshing}
          />
        </Tooltip>
      </div>
      <div className="contract-variable-value">
        {value === valueAsText || typeof value === "string" ? (
          <Text copyable={{ text: valueAsText, tooltips: true }}>
            <span>{value}</span>
          </Text>
        ) : (
          <span>{value}</span>
        )}
      </div>
    </div>
  );
};

export default DisplayVariable;
