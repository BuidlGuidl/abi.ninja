import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ContractInput } from "./ContractInput";
import { getFunctionInputKey, getInitalTupleFormState } from "./utilsContract";
import { replacer } from "~~/utils/scaffold-eth/common";
import { AbiParameterTuple } from "~~/utils/scaffold-eth/contract";

type TupleProps = {
  abiTupleParameter: AbiParameterTuple;
  setParentForm: Dispatch<SetStateAction<Record<string, any>>>;
  parentStateObjectKey: string;
  parentForm: Record<string, any> | undefined;
  initialValue?: string;
};

export const Tuple = ({ abiTupleParameter, setParentForm, parentStateObjectKey, initialValue }: TupleProps) => {
  const [form, setForm] = useState<Record<string, any>>(() => {
    const initialForm = getInitalTupleFormState(abiTupleParameter);
    if (!initialValue) return initialForm;

    try {
      const parsedValue = JSON.parse(initialValue);
      if (typeof parsedValue !== "object" || parsedValue === null || Array.isArray(parsedValue)) {
        throw new Error("Expected a JSON object");
      }

      const values = Object.values(parsedValue);
      abiTupleParameter.components.forEach((component, componentIndex) => {
        const key = getFunctionInputKey(abiTupleParameter.name || "tuple", component, componentIndex);
        // named components match by key only (a partial object must not shift later values);
        // positional lookup is just for unnamed components
        const value = component.name ? parsedValue[component.name] : values[componentIndex];
        // nested tuples arrive as plain objects in hand-written JSON; children expect serialized strings
        initialForm[key] = value === undefined ? "" : typeof value === "string" ? value : JSON.stringify(value);
      });
    } catch (error) {
      console.warn("Unable to parse initial tuple value:", initialValue, error);
    }

    return initialForm;
  });

  useEffect(() => {
    const values = Object.values(form);
    const argsStruct: Record<string, any> = {};
    abiTupleParameter.components.forEach((component, componentIndex) => {
      argsStruct[component.name || `input_${componentIndex}_`] = values[componentIndex];
    });

    setParentForm(parentForm => ({ ...parentForm, [parentStateObjectKey]: JSON.stringify(argsStruct, replacer) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(form, replacer)]);

  return (
    <div>
      <div className="collapse collapse-arrow pl-4 py-1.5 border-2 border-secondary overflow-x-auto">
        <input type="checkbox" className="min-h-fit peer" />
        <div className="collapse-title p-0 min-h-fit peer-checked:mb-2 text-secondary-content/70">
          <p className="m-0 p-0 text-[1rem]">{abiTupleParameter.internalType}</p>
        </div>
        <div className="ml-3 flex-col space-y-4 border-secondary/80 border-l-2 pl-4 collapse-content">
          {abiTupleParameter?.components?.map((param, index) => {
            const key = getFunctionInputKey(abiTupleParameter.name || "tuple", param, index);
            return (
              <ContractInput
                setForm={setForm}
                form={form}
                key={key}
                stateObjectKey={key}
                paramType={param}
                initialValue={typeof form[key] === "string" ? form[key] : undefined}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
