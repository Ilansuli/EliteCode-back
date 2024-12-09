import { config } from "dotenv";
config();
export const dev = {
  dbURL: process.env.DB_URL,
  dbName: process.env.DB_NAME,
};
