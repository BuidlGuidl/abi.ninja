const path = require("path");

const buildNextEslintCommand = (filenames) =>
  `yarn workspace @se-2/nextjs eslint --fix ${filenames
    .map((f) => path.relative(path.join("packages", "nextjs"), f))
    .join(" ")}`;

const checkTypesNextCommand = () => "yarn next:check-types";

module.exports = {
  "packages/nextjs/**/*.{ts,tsx}": [
    buildNextEslintCommand,
    checkTypesNextCommand,
  ],
};
