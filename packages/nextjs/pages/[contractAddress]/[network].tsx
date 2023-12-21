import { useRouter } from "next/router";

const ContractDetailPage = () => {
  const router = useRouter();
  const { contractAddress, network } = router.query;

  // You can now use contractAddress and network to fetch data, etc.
  // For example, fetch contract details from an API or local data source

  return (
    <div>
      <h1>Contract Details</h1>
      <p>Contract Address: {contractAddress}</p>
      <p>Network: {network}</p>
      {/* Render additional contract details here */}
    </div>
  );
};

export default ContractDetailPage;
