import { useCallback, useEffect, useState } from "react";
import { blo } from "blo";
import { useDebounce } from "usehooks-ts";
import { Address, isAddress } from "viem";
import { CommonInputProps, InputBase } from "~~/components/scaffold-eth";
import { useEnsData } from "~~/hooks/useEnsData";

/**
 * Address input with ENS name resolution
 */
export const AddressInput = ({ value, name, placeholder, onChange, disabled }: CommonInputProps<Address | string>) => {
  const [displayValue, setDisplayValue] = useState<string>(value as string);

  // Debounce the input to keep clean RPC calls when resolving ENS names
  // If the input is an address, we don't need to debounce it
  const _debouncedValue = useDebounce(displayValue, 500);
  const debouncedValue = isAddress(displayValue) ? displayValue : _debouncedValue;
  const isDebouncedValueLive = debouncedValue === displayValue;

  // If the user changes the input after an ENS name is already resolved, we want to remove the stale result
  const settledValue = isDebouncedValueLive ? debouncedValue : undefined;

  const { ens: ensName, avatar_url: ensAvatar, address: ensAddress } = useEnsData(settledValue as string);

  useEffect(() => {
    if (ensName && ensAddress) {
      setDisplayValue(ensAddress);
      onChange(ensAddress as Address);
    }
  }, [ensName, onChange, settledValue, ensAddress]);

  const handleInputChange = useCallback(
    (newValue: string) => {
      setDisplayValue(newValue);
      onChange(newValue as Address);
    },
    [onChange],
  );

  return (
    <InputBase<Address>
      name={name}
      placeholder={placeholder}
      error={ensName === null}
      value={displayValue as Address}
      onChange={handleInputChange}
      disabled={disabled}
      prefix={
        ensName && (
          <div className="flex bg-base-100 rounded-l-lg items-center">
            {ensAvatar ? (
              <span className="w-[35px]">
                {
                  // eslint-disable-next-line
                  <img className="w-full rounded-lg" src={ensAvatar} alt={`${ensName} avatar`} />
                }
              </span>
            ) : null}
            <span className="text-accent px-2">{ensName}</span>
          </div>
        )
      }
      suffix={
        isAddress(displayValue) &&
        !ensAvatar && (
          // Don't want to use nextJS Image here (and adding remote patterns for the URL)
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="" className="!rounded-lg" src={blo(displayValue as `0x${string}`)} width="35" height="35" />
        )
      }
    />
  );
};
