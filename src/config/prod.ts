import { config } from "dotenv";
config();
export const prod = {
  dbURL: process.env.DB_URL,
  dbName: process.env.DB_NAME,
};
