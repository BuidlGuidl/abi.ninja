import { HeartIcon } from "@heroicons/react/24/outline";
import { BuidlGuidlLogo } from "~~/components/assets/BuidlGuidlLogo";

export const MiniFooter = () => {
  return (
    <div className="flex justify-center items-center gap-1 text-xs w-full pt-4">
      <div className="mb-1">
        <a href="https://github.com/BuidlGuidl/abi.ninja" target="_blank" rel="noreferrer" className="link">
          Fork me
        </a>
      </div>
      <span>·</span>
      <div className="flex justify-center items-center gap-2">
        <p className="m-0 text-center">
          Built with <HeartIcon className="inline-block h-4 w-4" /> at
        </p>
        <a
          className="flex justify-center items-center gap-1"
          href="https://buidlguidl.com/"
          target="_blank"
          rel="noreferrer"
        >
          <BuidlGuidlLogo className="w-3 h-5 pb-1" />
          <span className="link">BuidlGuidl</span>
        </a>
      </div>
    </div>
  );
};
