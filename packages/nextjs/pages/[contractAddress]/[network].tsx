import { useRouter } from "next/router";
import { ContractUI } from "~~/components/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";

const ContractDetailPage = () => {
  const router = useRouter();
  const { contractAddress } = router.query;

  const contractAbi = useGlobalState(state => state.contractAbi);

  return (
    <div>
      {contractAbi ? (
        <ContractUI deployedContractData={{ address: contractAddress, abi: JSON.parse(contractAbi || "[]") }} />
      ) : (
        <p>Loading ABI or ABI not available</p>
      )}
    </div>
  );
};

export default ContractDetailPage;
