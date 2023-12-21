import { HeartIcon } from "@heroicons/react/24/outline";
import { BuidlGuidlLogo } from "~~/components/assets/BuidlGuidlLogo";

export const MiniFooter = () => {
  return (
    <div className="mt-10">
      <ul className="menu menu-horizontal w-full">
        <div className="flex w-full items-center justify-center gap-2 text-xs">
          <div className="text-center">
            <a href="https://github.com/scaffold-eth/se-2" target="_blank" rel="noreferrer" className="link">
              Fork me
            </a>
          </div>
          <span>·</span>
          <div className="flex items-center justify-center gap-2">
            <p className="m-0 text-center">
              Built with <HeartIcon className="inline-block h-4 w-4" /> at
            </p>
            <a
              className="flex items-center justify-center gap-1"
              href="https://buidlguidl.com/"
              target="_blank"
              rel="noreferrer"
            >
              <BuidlGuidlLogo className="h-5 w-3 pb-1" />
              <span className="link">BuidlGuidl</span>
            </a>
          </div>
          <span>·</span>
          <div className="text-center">
            <a href="https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA" target="_blank" rel="noreferrer" className="link">
              Support
            </a>
          </div>
        </div>
      </ul>
    </div>
  );
};
