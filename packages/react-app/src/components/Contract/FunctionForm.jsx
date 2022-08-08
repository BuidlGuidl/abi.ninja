import { Button, Input, Tooltip } from "antd";
import React, { useState } from "react";
import Blockies from "react-blockies";
import { ReactComponent as AsteriskSVG } from "../../assets/asterisk.svg";
import { ReactComponent as PoundSVG } from "../../assets/pound.svg";

import { Transactor } from "../../helpers";
import { tryToDisplay, tryToDisplayAsText } from "./utils";
import AddressInput from "../AddressInput";

const { utils, BigNumber } = require("ethers");

const getFunctionInputKey = (functionInfo, input, inputIndex) => {
  const name = input?.name ? input.name : "input_" + inputIndex + "_";
  return functionInfo.name + "_" + name + "_" + input.type;
};

export default function FunctionForm({
  contractFunction,
  functionInfo,
  provider,
  mainnetProvider,
  gasPrice,
  triggerRefresh,
}) {
  const [form, setForm] = useState({});
  const [txValue, setTxValue] = useState();
  const [returnValue, setReturnValue] = useState();

  const tx = Transactor(provider, gasPrice);

  const inputs = functionInfo.inputs.map((input, inputIndex) => {
    const key = getFunctionInputKey(functionInfo, input, inputIndex);

    let buttons = "";
    if (input.type === "bytes32") {
      buttons = (
        <Tooltip placement="right" title="to bytes32">
          <div
            className="helper-button-contract-input"
            style={{ cursor: "pointer" }}
            onClick={async () => {
              if (utils.isHexString(form[key])) {
                const formUpdate = { ...form };
                formUpdate[key] = utils.parseBytes32String(form[key]);
                setForm(formUpdate);
              } else {
                const formUpdate = { ...form };
                formUpdate[key] = utils.formatBytes32String(form[key]);
                setForm(formUpdate);
              }
            }}
          >
            <PoundSVG />
          </div>
        </Tooltip>
      );
    } else if (input.type === "bytes") {
      buttons = (
        <Tooltip placement="right" title="to hex">
          <div
            className="helper-button-contract-input"
            style={{ cursor: "pointer" }}
            onClick={async () => {
              if (utils.isHexString(form[key])) {
                const formUpdate = { ...form };
                formUpdate[key] = utils.toUtf8String(form[key]);
                setForm(formUpdate);
              } else {
                const formUpdate = { ...form };
                formUpdate[key] = utils.hexlify(utils.toUtf8Bytes(form[key]));
                setForm(formUpdate);
              }
            }}
          >
            <PoundSVG />
          </div>
        </Tooltip>
      );
    } else if (input.type === "uint256") {
      buttons = (
        <Tooltip placement="right" title="* 10 ** 18">
          <div
            className="helper-button-contract-input"
            style={{ cursor: "pointer" }}
            onClick={async () => {
              const formUpdate = { ...form };
              formUpdate[key] = utils.parseEther(form[key]);
              setForm(formUpdate);
            }}
          >
            <AsteriskSVG />
          </div>
        </Tooltip>
      );
    } else if (input.type === "address") {
      const possibleAddress = form[key] && form[key].toLowerCase && form[key].toLowerCase().trim();
      if (possibleAddress && possibleAddress.length === 42) {
        buttons = (
          <Tooltip placement="right" title="blockie">
            <Blockies seed={possibleAddress} scale={3} />
          </Tooltip>
        );
      }
    }

    return (
      <div className="contract-method-input" key={key}>
        {input.type === "address" ? (
          <AddressInput
            autoFocus
            name={key}
            ensProvider={mainnetProvider}
            placeholder={input.name ? input.type + " " + input.name : input.type}
            value={form[key]}
            onChange={address => {
              const formUpdate = { ...form };
              formUpdate[key] = address;
              setForm(formUpdate);
            }}
            suffix={buttons}
          />
        ) : (
          <Input
            size="large"
            placeholder={input.name ? input.type + " " + input.name : input.type}
            autoComplete="off"
            value={form[key]}
            name={key}
            onChange={event => {
              const formUpdate = { ...form };
              formUpdate[event.target.name] = event.target.value;
              setForm(formUpdate);
            }}
            suffix={buttons}
          />
        )}
      </div>
    );
  });

  const txValueInput = (
    <div className="contract-method-input" key="txValueInput">
      <Input
        placeholder="transaction value"
        onChange={e => setTxValue(e.target.value)}
        value={txValue}
        size="large"
        suffix={
          <div className="helper-buttons-contract-inputs">
            <Tooltip placement="right" title=" * 10^18 ">
              <div
                className="helper-button-contract-input"
                style={{ cursor: "pointer" }}
                onClick={async () => {
                  const floatValue = parseFloat(txValue);
                  if (floatValue) setTxValue("" + floatValue * 10 ** 18);
                }}
              >
                <AsteriskSVG />
              </div>
            </Tooltip>
            <Tooltip placement="right" title="number to hex">
              <div
                className="helper-button-contract-input"
                style={{ cursor: "pointer" }}
                onClick={async () => {
                  setTxValue(BigNumber.from(txValue).toHexString());
                }}
              >
                <PoundSVG />
              </div>
            </Tooltip>
          </div>
        }
      />
    </div>
  );

  if (functionInfo.payable) {
    inputs.push(txValueInput);
  }

  const handleForm = returned => {
    if (returned) {
      setForm({});
    }
  };

  const isReadable = fn => fn.stateMutability === "view" || fn.stateMutability === "pure";

  const buttonIcon = isReadable(functionInfo) ? (
    <Button className="contract-action-button">Read 📡</Button>
  ) : (
    <Button className="contract-action-button">Send 💸</Button>
  );
  inputs.push(
    <div style={{ cursor: "pointer", margin: 4 }} key="goButton" className="contract-result-action">
      <Input
        onChange={e => setReturnValue(e.target.value)}
        defaultValue=""
        bordered={false}
        disabled
        value={returnValue}
        suffix={
          <div
            onClick={async () => {
              const args = functionInfo.inputs.map((input, inputIndex) => {
                const key = getFunctionInputKey(functionInfo, input, inputIndex);
                let value = form[key];
                if (["array", "tuple"].includes(input.baseType)) {
                  value = JSON.parse(value);
                } else if (input.type === "bool") {
                  if (value === "true" || value === "1" || value === "0x1" || value === "0x01" || value === "0x0001") {
                    value = 1;
                  } else {
                    value = 0;
                  }
                }
                return value;
              });

              let result;
              if (functionInfo.stateMutability === "view" || functionInfo.stateMutability === "pure") {
                try {
                  const returned = await contractFunction(...args);
                  handleForm(returned);
                  result = tryToDisplayAsText(returned);
                } catch (err) {
                  console.error(err);
                }
              } else {
                const overrides = {};
                if (txValue) {
                  overrides.value = txValue; // ethers.utils.parseEther()
                }
                if (gasPrice) {
                  overrides.gasPrice = gasPrice;
                }
                // Uncomment this if you want to skip the gas estimation for each transaction
                // overrides.gasLimit = hexlify(1200000);

                // console.log("Running with extras",extras)
                const returned = await tx(contractFunction(...args, overrides));
                handleForm(returned);
                result = tryToDisplay(returned);
              }

              console.log("SETTING RESULT:", result);
              setReturnValue(result);
              triggerRefresh(true);
            }}
          >
            {buttonIcon}
          </div>
        }
      />
    </div>,
  );

  return (
    <div className="contract-method">
      <h2 id={`method-${functionInfo.name}`} className="contract-method-name">
        {functionInfo.name}
      </h2>
      <div className="contract-method-inputs">{inputs}</div>
    </div>
  );
}
