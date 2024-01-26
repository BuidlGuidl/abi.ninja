import { useRouter } from "next/router";
import { Address as AddressType } from "viem";
import { MetaHeader } from "~~/components/MetaHeader";
import { MiniHeader } from "~~/components/MiniHeader";
import { PaginationButton, TransactionsTable } from "~~/components/blockexplorer/";
import { Address, Balance } from "~~/components/scaffold-eth";
import { useFetchBlocks } from "~~/hooks/scaffold-eth";

const AddressPage = () => {
  const router = useRouter();
  const { address } = router.query as { address?: AddressType };
  const { blocks, transactionReceipts, currentPage, totalBlocks, setCurrentPage } = useFetchBlocks();

  const filteredBlocks = blocks.filter(block =>
    block.transactions.some(tx => {
      if (typeof tx === "string") {
        return false;
      }
      return tx.from.toLowerCase() === address?.toLowerCase() || tx.to?.toLowerCase() === address?.toLowerCase();
    }),
  );

  return (
    <>
      <MetaHeader title="Block explorer - Address details" />
      <MiniHeader />
      <div className="mx-10 mt-5 mb-20">
        <div className="flex justify-start mb-5">
          <button className="btn btn-sm btn-primary" onClick={() => router.back()}>
            Back
          </button>
        </div>
        <div className="col-span-5 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          <div className="col-span-1 flex flex-col">
            <div className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-3xl px-6 lg:px-8 mb-6 space-y-1 py-4 overflow-x-auto">
              <div className="flex">
                <div className="flex flex-col gap-1">
                  <Address address={address} format="long" />
                  <div className="flex gap-1 items-center">
                    <span className="font-bold text-sm">Balance:</span>
                    <Balance address={address} className="text" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="pt-4">
          <TransactionsTable blocks={filteredBlocks} transactionReceipts={transactionReceipts} />
          <PaginationButton
            currentPage={currentPage}
            totalItems={Number(totalBlocks)}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>
    </>
  );
};

export default AddressPage;
