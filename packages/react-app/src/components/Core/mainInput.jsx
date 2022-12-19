import { Input } from "antd";

export const MainInput = ({ placeholder, onChange, value, suffix, name, addonAfter, prefix, autoFocus }) => {
  return (
    <Input
      name={name}
      className="standard-input"
      placeholder={placeholder}
      onChange={onChange}
      autoFocus={autoFocus}
      value={value}
      size="large"
      suffix={suffix}
      prefix={prefix}
      addonAfter={addonAfter}
    />
  );
};
