import { createTsupConfig } from "../../scripts/tsup.config.js";

export default createTsupConfig({
  minify: true,
  format: "esm",
});
