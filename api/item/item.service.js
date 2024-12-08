const dbService = require("../../services/db.service");
const logger = require("../../services/logger.service");
const utilService = require("../../services/util.service");
const ObjectId = require("mongodb").ObjectId;

async function query(filterBy = {}) {
  console.log("item.service back", filterBy);
  try {
    const criteria = _buildCriteria(filterBy);
    console.log(criteria);
    const collection = await dbService.getCollection("item");
    var items = await collection.find(criteria).toArray();
    return items;
  } catch (err) {
    logger.error("cannot find items", err);
    throw err;
  }
}
function _buildCriteria(filterBy) {
  const criteria = {};
  if (filterBy.owner) {
    criteria["owner._id"] = { $eq: filterBy.owner };
  }
  if (filterBy.label) {
    criteria.label = { $in: [filterBy.label] };
  }
  return criteria;
}
async function getById(itemId) {
  try {
    const collection = await dbService.getCollection("item");
    const item = collection.findOne({ _id: ObjectId(itemId) });
    return item;
  } catch (err) {
    logger.error(`while finding item ${itemId}`, err);
    throw err;
  }
}

async function remove(itemId) {
  try {
    const collection = await dbService.getCollection("item");
    await collection.deleteOne({ _id: ObjectId(itemId) });
    return itemId;
  } catch (err) {
    logger.error(`cannot remove item ${itemId}`, err);
    throw err;
  }
}

async function add(item) {
  try {
    const collection = await dbService.getCollection("item");
    const { insertedId } = await collection.insertOne(item);
    const savedItem = { _id: insertedId, ...item };
    return savedItem;
  } catch (err) {
    logger.error("cannot insert item", err);
    throw err;
  }
}
async function update(item) {
  try {
    const collection = await dbService.getCollection("item");
    const { _id } = item;
    delete item._id;
    await collection.updateOne({ _id: ObjectId(_id) }, { $set: item });
    return item;
  } catch (err) {
    logger.error(`cannot update item ${item._id}`, err);
    throw err;
  }
}

async function addItemMsg(itemId, msg) {
  try {
    msg.id = utilService.makeId();
    const collection = await dbService.getCollection("item");
    await collection.updateOne(
      { _id: ObjectId(itemId) },
      { $push: { msgs: msg } }
    );
    return msg;
  } catch (err) {
    logger.error(`cannot add item msg ${itemId}`, err);
    throw err;
  }
}

async function removeItemMsg(itemId, msgId) {
  try {
    const collection = await dbService.getCollection("item");
    await collection.updateOne(
      { _id: ObjectId(itemId) },
      { $pull: { msgs: { id: msgId } } }
    );
    return msgId;
  } catch (err) {
    logger.error(`cannot add item msg ${itemId}`, err);
    throw err;
  }
}

module.exports = {
  remove,
  query,
  getById,
  add,
  update,
  addItemMsg,
  removeItemMsg,
};
