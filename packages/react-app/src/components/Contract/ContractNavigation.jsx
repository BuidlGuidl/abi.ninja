import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Collapse } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import { AbiFooter } from "../Core/footer";
import Address from "../Address";
export default function ContractNavigation({
  contractIsDeployed,
  contractName,
  contractAddress,
  seletectedContractMethods,
  handleMethodChange,
  blockExplorer,
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
  const { Panel } = Collapse;

  return (
    <div className="contract-navigation-content">
      <div className="contract-navigation-title">
        <h2>{contractName}</h2>
        <h4>
          <Address value={contractAddress} blockExplorer={blockExplorer} fontSize={18} />
        </h4>
      </div>

      <Collapse bordered={false} defaultActiveKey={["1", "2"]} ghost>
        {contractMethodsRead.length && (
          <Panel header="READ" key="1">
            <ul>
              {contractMethodsRead.map(method => {
                return (
                  <li
                    onClick={() => {
                      if (!seletectedContractMethods.includes(method)) {
                        handleMethodChange(method);
                      }
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
        )}
        {contractMethodsSend.length && (
          <Panel header="WRITE" key="2">
            <ul>
              {contractMethodsSend.map(method => {
                return (
                  <li
                    onClick={() => {
                      if (!seletectedContractMethods.includes(method)) {
                        handleMethodChange(method);
                      }
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
        )}
      </Collapse>
      <AbiFooter></AbiFooter>
    </div>
  );
}
