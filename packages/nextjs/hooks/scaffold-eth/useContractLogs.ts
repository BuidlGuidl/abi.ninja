import { useEffect, useState } from "react";
import { Address, Log } from "viem";
import { usePublicClient } from "wagmi";
import { useGlobalState } from "~~/services/store/store";

export const useContractLogs = (address: Address) => {
  const [logs, setLogs] = useState<Log[]>([]);
  const targetNetwork = useGlobalState(state => state.targetNetwork);
  const client = usePublicClient({ chainId: targetNetwork.id });

  useEffect(() => {
    const fetchLogs = async () => {
      if (!client) return console.error("Client not found");
      try {
        const existingLogs = await client.getLogs({
          address: address,
          fromBlock: 0n,
          toBlock: "latest",
        });
        setLogs(existingLogs);
      } catch (error) {
        console.error("Failed to fetch logs:", error);
      }
    };
    fetchLogs();

    return client?.watchBlockNumber({
      onBlockNumber: async (_blockNumber, prevBlockNumber) => {
        const newLogs = await client.getLogs({
          address: address,
          fromBlock: prevBlockNumber,
          toBlock: "latest",
        });
        setLogs(prevLogs => [...prevLogs, ...newLogs]);
      },
    });
  }, [address, client]);

  return logs;
};
