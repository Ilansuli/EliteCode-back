import { MongoClient } from "mongodb";
import config from "../config/index";
import { loggerService } from "./logger.service";

var dbConn = null;

export async function getCollection(collectionName: string) {
  try {
    const db = await connect();
    const collection = db?.collection(collectionName);
    return collection;
  } catch (err) {
    loggerService.error("Failed to get Mongo collection", err);
    throw err;
  }
}

async function connect() {
  if (dbConn) return dbConn;
  try {
    if (config.dbURL) {
      loggerService.info(dbConn, "db is firstly connecting");
      const client = await MongoClient.connect(config.dbURL, {
        ssl: true,
        tls: true,
      });
      const db = client.db(config.dbName);
      dbConn = db;
      return db;
    }
  } catch (err) {
    loggerService.error("Cannot Connect to DB", err);
    throw err;
  }
}
