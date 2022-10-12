import { Select } from "antd";

export const NetworkSelector = ({ selectedNetwork, onUpdateNetwork, networks }) => {
  return (
    <Select
      value={selectedNetwork.name}
      className="nework-selector network-ui"
      onChange={value => {
        if (selectedNetwork.chainId !== networks[value].chainId) {
          onUpdateNetwork(value);
        }
      }}
    >
      {Object.entries(networks).map(([name, network]) => (
        <Select.Option key={name} value={name}>
          <span>{`${name[0].toUpperCase()}${name.substring(1, name.length)}`}</span>
        </Select.Option>
      ))}
    </Select>
  );
};
