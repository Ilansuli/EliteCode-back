import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();

import { prod } from "./prod";
import { dev } from "./dev";

var config: {
  dbURL: string | undefined,
  dbName: string | undefined,
};

if (process.env.NODE_ENV === "production") {
  config = prod;
} else {
  config = dev;
}

export default config;
