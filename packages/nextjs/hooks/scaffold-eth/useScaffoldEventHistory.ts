import { useCallback, useEffect, useMemo, useState } from "react";
import { useTargetNetwork } from "./useTargetNetwork";
import { Abi, AbiEvent, ExtractAbiEventNames } from "abitype";
import { useInterval } from "usehooks-ts";
import { Hash } from "viem";
import * as chains from "viem/chains";
import { usePublicClient } from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import scaffoldConfig from "~~/scaffold.config";
import { replacer } from "~~/utils/scaffold-eth/common";
import {
  ContractAbi,
  ContractName,
  UseScaffoldEventHistoryConfig,
  UseScaffoldEventHistoryData,
} from "~~/utils/scaffold-eth/contract";

/**
 * Reads events from a deployed contract
 * @param config - The config settings
 * @param config.contractName - deployed contract name
 * @param config.eventName - name of the event to listen for
 * @param config.fromBlock - the block number to start reading events from
 * @param config.filters - filters to be applied to the event (parameterName: value)
 * @param config.blockData - if set to true it will return the block data for each event (default: false)
 * @param config.transactionData - if set to true it will return the transaction data for each event (default: false)
 * @param config.receiptData - if set to true it will return the receipt data for each event (default: false)
 * @param config.watch - if set to true, the events will be updated every pollingInterval milliseconds set at scaffoldConfig (default: false)
 * @param config.enabled - set this to false to disable the hook from running (default: true)
 */
export const useScaffoldEventHistory = <
  TContractName extends ContractName,
  TEventName extends ExtractAbiEventNames<ContractAbi<TContractName>>,
  TBlockData extends boolean = false,
  TTransactionData extends boolean = false,
  TReceiptData extends boolean = false,
>({
  contractName,
  eventName,
  fromBlock,
  filters,
  blockData,
  transactionData,
  receiptData,
  watch,
  enabled = true,
}: UseScaffoldEventHistoryConfig<TContractName, TEventName, TBlockData, TTransactionData, TReceiptData>) => {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [fromBlockUpdated, setFromBlockUpdated] = useState<bigint>(fromBlock);

  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo(contractName);
  const { targetNetwork } = useTargetNetwork();
  const publicClient = usePublicClient({
    chainId: targetNetwork.id,
  });

  const readEvents = useCallback(
    async () => {
      setIsLoading(true);
      try {
        if (!deployedContractData) {
          throw new Error("Contract not found");
        }

        if (!enabled) {
          throw new Error("Hook disabled");
        }

        if (!publicClient) {
          throw new Error("Public client not found");
        }

        const event = (deployedContractData.abi as Abi).find(
          part => part.type === "event" && part.name === eventName,
        ) as AbiEvent;

        const blockNumber = await publicClient.getBlockNumber({ cacheTime: 0 });

        if (blockNumber >= fromBlockUpdated) {
          const logs = await publicClient.getLogs({
            address: deployedContractData?.address,
            event,
            args: filters as any,
            fromBlock: fromBlockUpdated,
            toBlock: blockNumber,
          });
          setFromBlockUpdated(blockNumber + 1n);

          const newEvents = [];
          for (let i = logs.length - 1; i >= 0; i--) {
            newEvents.push({
              log: logs[i],
              args: logs[i].args,
              block:
                blockData && logs[i].blockHash === null
                  ? null
                  : await publicClient.getBlock({ blockHash: logs[i].blockHash as Hash }),
              transaction:
                transactionData && logs[i].transactionHash !== null
                  ? await publicClient.getTransaction({ hash: logs[i].transactionHash as Hash })
                  : null,
              receipt:
                receiptData && logs[i].transactionHash !== null
                  ? await publicClient.getTransactionReceipt({ hash: logs[i].transactionHash as Hash })
                  : null,
            });
          }
          setEvents([...newEvents, ...events]);
          setError(undefined);
        }
      } catch (e: any) {
        if (events.length > 0) {
          setEvents([]);
        }
        setError(e);
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      blockData,
      deployedContractData,
      enabled,
      eventName,
      events,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      JSON.stringify(filters, replacer),
      fromBlockUpdated,
      publicClient,
      receiptData,
      transactionData,
    ],
  );

  useEffect(() => {
    if (!deployedContractLoading) {
      readEvents();
    }
  }, [readEvents, deployedContractLoading]);

  useEffect(() => {
    // Reset the internal state when target network or fromBlock changed
    setEvents([]);
    setFromBlockUpdated(fromBlock);
    setError(undefined);
  }, [fromBlock, targetNetwork.id]);

  useInterval(
    async () => {
      if (!deployedContractLoading) {
        readEvents();
      }
    },
    watch && enabled ? (targetNetwork.id !== chains.hardhat.id ? scaffoldConfig.pollingInterval : 4_000) : null,
  );

  const eventHistoryData = useMemo(
    () =>
      events?.map(addIndexedArgsToEvent) as UseScaffoldEventHistoryData<
        TContractName,
        TEventName,
        TBlockData,
        TTransactionData,
        TReceiptData
      >,
    [events],
  );

  return {
    data: eventHistoryData,
    isLoading: isLoading,
    error: error,
  };
};

export const addIndexedArgsToEvent = (event: any) => {
  if (event.args && !Array.isArray(event.args)) {
    return { ...event, args: { ...event.args, ...Object.values(event.args) } };
  }

  return event;
};
