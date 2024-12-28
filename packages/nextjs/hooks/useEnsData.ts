import { useQuery } from "@tanstack/react-query";
import { Address as AddressType, isAddress } from "viem";

const isEns = (value: string) => value.endsWith(".eth") || value.endsWith(".xyz");

export const useEnsData = (addressOrEns: AddressType | string) => {
  const { data: ensData } = useQuery({
    queryKey: ["ensData", addressOrEns],
    queryFn: async () => {
      if (!addressOrEns || (!isAddress(addressOrEns) && !isEns(addressOrEns))) return {};

      const response = await fetch(`https://ensdata.net/${addressOrEns}`);
      const data = await response.json();

      if (data.error) {
        return { error: true };
      }

      return {
        ens: data.ens,
        address: data.address,
        avatar_url: data.avatar_url || data.records_primary.avatar_small,
      };
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    enabled: Boolean(addressOrEns) && (isEns(addressOrEns) || isAddress(addressOrEns)),
    retry: false,
  });

  return ensData || {};
};
