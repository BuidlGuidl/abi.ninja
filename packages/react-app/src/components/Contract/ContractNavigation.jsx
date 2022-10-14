import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Button, Collapse, Typography } from "antd";
import { CloseCircleOutlined, LogoutOutlined } from "@ant-design/icons";
import { AbiFooter } from "../Core/footer";
const { Text } = Typography;
export default function ContractNavigation({
  contractIsDeployed,
  contractName,
  contractAddress,
  logoutOfWeb3Modal,
  loadWeb3Modal,
  seletectedContractMethods,
  handleMethodChange,
  contractMethodsRead,
  web3Modal,
  contractMethodsSend,
}) {
  const history = useHistory();

  useEffect(() => {
    if (!history?.location?.state) return;

    const selectedMethod = history.location.state.method;
    document.getElementById(selectedMethod)?.scrollIntoView({ behavior: "smooth" });
  }, [history.location]);

  if (!contractIsDeployed) return null;
  const { Panel } = Collapse;

  return (
    <div className="contract-navigation-content">
      <div className="contract-navigation-title">
        <h2>{contractName}</h2>
        <h4>
          <Text copyable={{ text: contractAddress }}>{contractAddress.substring(0, 20)}...</Text>
        </h4>
      </div>

      <Collapse bordered={false} defaultActiveKey={["1", "2"]} ghost>
        <Panel header="READ" key="1">
          <ul>
            {contractMethodsRead.map(method => {
              return (
                <li
                  onClick={() => {
                    const queryParams = new URLSearchParams(history?.location?.search);
                    if (!seletectedContractMethods.includes(method)) {
                      handleMethodChange(method);
                    }
                    history.push({ state: { method: `method-${method}` }, search: queryParams.toString() });
                  }}
                  key={method}
                  className={seletectedContractMethods.includes(method) ? "active" : ""}
                >
                  <span data-target={`method-${method}`}>{method}</span>
                  <span>
                    {seletectedContractMethods.includes(method) ? (
                      <CloseCircleOutlined onClick={() => handleMethodChange(method)} />
                    ) : (
                      ""
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </Panel>
        <Panel header="SEND" key="2">
          <ul>
            {contractMethodsSend.map(method => {
              return (
                <li
                  onClick={() => {
                    const queryParams = new URLSearchParams(history?.location?.search);
                    if (!seletectedContractMethods.includes(method)) {
                      handleMethodChange(method);
                    }
                    history.push({ state: { method: `method-${method}` }, search: queryParams.toString() });
                  }}
                  key={method}
                  className={seletectedContractMethods.includes(method) ? "active" : ""}
                >
                  <span data-target={`method-${method}`}>{method}</span>
                  <span>
                    {seletectedContractMethods.includes(method) ? (
                      <CloseCircleOutlined onClick={() => handleMethodChange(method)} />
                    ) : (
                      ""
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </Panel>
      </Collapse>
      {web3Modal?.cachedProvider ? (
        <Button type="secondary" className="logout" onClick={() => logoutOfWeb3Modal()} icon={<LogoutOutlined />}>
          Disconnect
        </Button>
      ) : (
        <Button type="primary" className="primary" onClick={() => loadWeb3Modal()}>
          Connect
        </Button>
      )}
      <AbiFooter></AbiFooter>
    </div>
  );
}
