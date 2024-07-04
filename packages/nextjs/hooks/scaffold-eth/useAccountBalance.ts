import { useCallback, useEffect, useState } from "react";
import { useTargetNetwork } from "./useTargetNetwork";
import { useQueryClient } from "@tanstack/react-query";
import { Address } from "viem";
import { useBalance, useBlockNumber } from "wagmi";
import { useGlobalState } from "~~/services/store/store";

export function useAccountBalance(address?: Address) {
  const [isEthBalance, setIsEthBalance] = useState(true);
  const [balance, setBalance] = useState<number | null>(null);
  const price = useGlobalState(state => state.nativeCurrencyPrice);
  const { targetNetwork } = useTargetNetwork();
  const queryClient = useQueryClient();
  const { data: blockNumber } = useBlockNumber({ watch: true, chainId: targetNetwork.id });

  const {
    data: fetchedBalanceData,
    isError,
    isLoading,
    queryKey,
  } = useBalance({
    address,
    chainId: targetNetwork.id,
  });

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockNumber]);

  const onToggleBalance = useCallback(() => {
    if (price > 0) {
      setIsEthBalance(!isEthBalance);
    }
  }, [isEthBalance, price]);

  useEffect(() => {
    if (fetchedBalanceData?.formatted) {
      setBalance(Number(fetchedBalanceData.formatted));
    }
  }, [fetchedBalanceData, targetNetwork]);

  return { balance, price, isError, isLoading, onToggleBalance, isEthBalance };
}
