import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Typography } from "antd";
const { Text } = Typography;
export default function ContractNavigation({
  contractIsDeployed,
  contractName,
  contractAddress,
  contractMethodsRead,
  contractMethodsSend,
}) {
  const history = useHistory();

  useEffect(() => {
    if (!history?.location?.state) return;

    const selectedMethod = history.location.state.method;
    document.getElementById(selectedMethod)?.scrollIntoView({ behavior: "smooth" });
  }, [history.location]);

  if (!contractIsDeployed) return null;

  return (
    <div className="contract-navigation-content">
      <div className="contract-navigation-title">
        <h2>{contractName}</h2>
        <h4>
          <Text copyable={{ text: contractAddress }}>{contractAddress.substring(0, 20)}...</Text>
        </h4>
      </div>

      <ul>
        <li className="header">Read</li>
        {contractMethodsRead.map(method => {
          return (
            <li key={method}>
              <span
                data-target={`method-${method}`}
                onClick={() => history.push({ state: { method: `method-${method}` } })}
              >
                {method}
              </span>
            </li>
          );
        })}
      </ul>
      <ul>
        <li className="header">Send</li>
        {contractMethodsSend.map(method => {
          return (
            <li key={method}>
              <span
                data-target={`method-${method}`}
                onClick={() => history.push({ state: { method: `method-${method}` } })}
              >
                {method}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
