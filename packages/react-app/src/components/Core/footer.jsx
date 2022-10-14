import { GithubFilled, HeartFilled } from "@ant-design/icons";

export const AbiFooter = () => {
  return (
    <div className="footer-items">
      <p>
        <GithubFilled />{" "}
        <a href="https://github.com/carletex/abi.ninja" target="_blank" rel="noreferrer">
          Fork me
        </a>
      </p>
      <p className="separator"> | </p>
      <p>
        Built with <HeartFilled style={{ color: "red" }} /> at 🏰{" "}
        <a href="https://buidlguidl.com/" target="_blank" rel="noreferrer">
          BuidlGuidl
        </a>
      </p>
    </div>
  );
};
