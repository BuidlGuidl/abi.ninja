import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ContractInput } from "./ContractInput";
import { getFunctionInputKey, getInitalTupleArrayFormState } from "./utilsContract";
import { replacer } from "~~/utils/scaffold-eth/common";
import { AbiParameterTuple } from "~~/utils/scaffold-eth/contract";

type TupleArrayProps = {
  abiTupleParameter: AbiParameterTuple & { isVirtual?: true };
  setParentForm: Dispatch<SetStateAction<Record<string, any>>>;
  parentStateObjectKey: string;
  parentForm: Record<string, any> | undefined;
  initialValue?: string;
};

export const TupleArray = ({
  abiTupleParameter,
  setParentForm,
  parentStateObjectKey,
  initialValue,
}: TupleArrayProps) => {
  const depth = (abiTupleParameter.type.match(/\[\]/g) || []).length;
  const [initialState] = useState(() => {
    const defaultState = {
      form: getInitalTupleArrayFormState(abiTupleParameter),
      rows: [abiTupleParameter.components],
    };
    if (!initialValue) return defaultState;

    try {
      const parsedValue = JSON.parse(initialValue);
      if (!Array.isArray(parsedValue)) throw new Error("Expected a JSON array");

      // cap seeded rows so a hostile link can't render an unbounded number of inputs
      const MAX_SEEDED_ROWS = 100;
      const rowValues = parsedValue.slice(0, MAX_SEEDED_ROWS);
      if (parsedValue.length > MAX_SEEDED_ROWS) {
        console.warn(`Tuple array value has ${parsedValue.length} rows, seeding only the first ${MAX_SEEDED_ROWS}`);
      }

      const form: Record<string, any> = {};
      rowValues.forEach((rowValue, rowIndex) => {
        const values = depth > 1 ? [rowValue] : Object.values(rowValue);
        abiTupleParameter.components.forEach((component, componentIndex) => {
          const key = getFunctionInputKey(
            `${rowIndex}_${abiTupleParameter.name || "tuple"}`,
            component,
            componentIndex,
          );
          // named components match by key only (a partial object must not shift later values);
          // positional lookup covers unnamed components and depth>1 virtual wrappers
          const value = depth <= 1 && component.name && rowValue ? rowValue[component.name] : values[componentIndex];
          form[key] = value === undefined ? "" : typeof value === "string" ? value : JSON.stringify(value);
        });
      });

      return {
        form,
        rows: rowValues.map(() => abiTupleParameter.components),
      };
    } catch (error) {
      console.warn("Unable to parse initial tuple array value:", initialValue, error);
      return defaultState;
    }
  });
  const [form, setForm] = useState<Record<string, any>>(initialState.form);
  const [additionalInputs, setAdditionalInputs] = useState<Array<typeof abiTupleParameter.components>>(
    initialState.rows,
  );

  useEffect(() => {
    // Extract and group fields based on index prefix
    const groupedFields = Object.keys(form).reduce((acc, key) => {
      const [indexPrefix, ...restArray] = key.split("_");
      const componentName = restArray.join("_");
      if (!acc[indexPrefix]) {
        acc[indexPrefix] = {};
      }
      acc[indexPrefix][componentName] = form[key];
      return acc;
    }, {} as Record<string, Record<string, any>>);

    let argsArray: Array<Record<string, any>> = [];

    Object.keys(groupedFields).forEach(key => {
      const currentKeyValues = Object.values(groupedFields[key]);

      const argsStruct: Record<string, any> = {};
      abiTupleParameter.components.forEach((component, componentIndex) => {
        argsStruct[component.name || `input_${componentIndex}_`] = currentKeyValues[componentIndex];
      });

      argsArray.push(argsStruct);
    });

    if (depth > 1) {
      argsArray = argsArray.map(args => {
        return args[abiTupleParameter.components[0].name || "tuple"];
      });
    }

    setParentForm(parentForm => {
      return { ...parentForm, [parentStateObjectKey]: JSON.stringify(argsArray, replacer) };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(form, replacer)]);

  const addInput = () => {
    setAdditionalInputs(previousValue => {
      const newAdditionalInputs = [...previousValue, abiTupleParameter.components];

      // Add the new inputs to the form
      setForm(form => {
        const newForm = { ...form };
        abiTupleParameter.components.forEach((component, componentIndex) => {
          const key = getFunctionInputKey(
            `${newAdditionalInputs.length - 1}_${abiTupleParameter.name || "tuple"}`,
            component,
            componentIndex,
          );
          newForm[key] = "";
        });
        return newForm;
      });

      return newAdditionalInputs;
    });
  };

  const removeInput = () => {
    // Remove the last inputs from the form
    setForm(form => {
      const newForm = { ...form };
      abiTupleParameter.components.forEach((component, componentIndex) => {
        const key = getFunctionInputKey(
          `${additionalInputs.length - 1}_${abiTupleParameter.name || "tuple"}`,
          component,
          componentIndex,
        );
        delete newForm[key];
      });
      return newForm;
    });
    setAdditionalInputs(inputs => inputs.slice(0, -1));
  };

  return (
    <div>
      <div className="collapse collapse-arrow pl-4 py-1.5 border-2 border-secondary overflow-x-auto">
        <input type="checkbox" className="min-h-fit peer" />
        <div className="collapse-title p-0 min-h-fit peer-checked:mb-1 text-secondary-content/70">
          <p className="m-0 text-[1rem]">{abiTupleParameter.internalType}</p>
        </div>
        <div className="ml-3 flex-col space-y-2 border-secondary/70 border-l-2 pl-4 collapse-content">
          {additionalInputs.map((additionalInput, additionalIndex) => (
            <div key={additionalIndex} className="space-y-1">
              <span className="badge bg-secondary/60 badge-sm">
                {depth > 1 ? `${additionalIndex}` : `tuple[${additionalIndex}]`}
              </span>
              <div className="space-y-4">
                {additionalInput.map((param, index) => {
                  const key = getFunctionInputKey(
                    `${additionalIndex}_${abiTupleParameter.name || "tuple"}`,
                    param,
                    index,
                  );
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
          ))}
          <div className="flex space-x-2">
            <button className="btn btn-sm btn-secondary" onClick={addInput}>
              +
            </button>
            {additionalInputs.length > 0 && (
              <button className="btn btn-sm btn-secondary" onClick={removeInput}>
                -
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
