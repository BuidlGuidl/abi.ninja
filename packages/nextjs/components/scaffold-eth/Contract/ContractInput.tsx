import { Dispatch, SetStateAction } from "react";
import { AbiParameter } from "abitype";
import {
  AddressInput,
  Bytes32Input,
  BytesInput,
  InputBase,
  IntegerInput,
  IntegerVariant,
} from "~~/components/scaffold-eth";

type ContractInputProps = {
  setForm: Dispatch<SetStateAction<Record<string, any>>>;
  form: Record<string, any> | undefined;
  stateObjectKey: string;
  paramType: AbiParameter;
};

/**
 * Generic Input component to handle input's based on their function param type
 */
export const ContractInput = ({ setForm, form, stateObjectKey, paramType }: ContractInputProps) => {
  const inputProps = {
    name: stateObjectKey,
    value: form?.[stateObjectKey],
    placeholder: paramType.type,
    onChange: (value: any) => {
      setForm(form => ({ ...form, [stateObjectKey]: value }));
    },
  };

  const renderInput = () => {
    switch (paramType.type) {
      case "address":
        return <AddressInput {...inputProps} />;
      case "bytes32":
        return <Bytes32Input {...inputProps} />;
      case "bytes":
        return <BytesInput {...inputProps} />;
      case "string":
        return <InputBase {...inputProps} />;
      default:
        if (paramType.type.includes("int") && !paramType.type.includes("[")) {
          return <IntegerInput {...inputProps} variant={paramType.type as IntegerVariant} />;
        } else {
          return <InputBase {...inputProps} />;
        }
    }
  };

  return (
    <div className="flex flex-col gap-1 w-full pl-2">
      <div className="flex items-center">
        {paramType.name && <span className="text-xs font-medium mr-2">{paramType.name}</span>}
        <span className="block text-xs font-thin">{paramType.type}</span>
      </div>
      {renderInput()}
    </div>
  );
};
