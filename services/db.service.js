const MongoClient = require("mongodb").MongoClient;

const config = require("../config");
const logger = require("./logger.service");

module.exports = {
  getCollection,
};

var dbConn = null;

async function getCollection(collectionName) {
  try {
    const db = await connect();
    const collection = await db.collection(collectionName);
    console.log("connected to db collection");
    return collection;
  } catch (err) {
    logger.error("Failed to get Mongo collection", err);
    throw err;
  }
}

async function connect() {
  if (dbConn) return dbConn;

  try {
    logger.info(dbConn, "db is firstly connecting");
    const client = await MongoClient.connect(config.dbURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = client.db(config.dbName);
    // logger.info(db,'db.service db variable')

    dbConn = db;
    return db;
  } catch (err) {
    logger.error("Cannot Connect to DB", err);
    throw err;
  }
}
