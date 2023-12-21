export const fetchContractABIFromEtherscan = async (verifiedContractAddress: string) => {
  const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
  const url = `https://api.etherscan.io/api?module=contract&action=getabi&address=${verifiedContractAddress}&apikey=${apiKey}`;

  const response = await fetch(url);
  const data = await response.json();
  if (data.status === "1") {
    return data.result;
  } else {
    console.log("Got non-1 status from Etherscan API", data);
    throw new Error("Got non-1 status from Etherscan API");
  }
};
