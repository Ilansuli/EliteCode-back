const itemService = require("./item.service.js");

const logger = require("../../services/logger.service.js");

async function getItems(req, res) {
  try {
    const filterBy = {
      owner: req.query.owner || "",
      label: req.query.label || "",
    };
    logger.debug("Getting Items", filterBy);
    const items = await itemService.query(filterBy);
    res.json(items);
  } catch (err) {
    logger.error("Failed to get items", err);
    res.status(500).send({ err: "Failed to get items" });
  }
}

async function getItemById(req, res) {
  try {
    const itemId = req.params.id;
    const item = await itemService.getById(itemId);
    res.json(item);
  } catch (err) {
    logger.error("Failed to get item", err);
    res.status(500).send({ err: "Failed to get item" });
  }
}

async function addItem(req, res) {
  const { loggedinUser } = req;
  try {
    const item = req.body;
    item.owner = loggedinUser;
    const addedItem = await itemService.add(item);
    res.json(addedItem);
  } catch (err) {
    logger.error("Failed to add item", err);
    res.status(500).send({ err: "Failed to add item" });
  }
}

async function updateItem(req, res) {
  try {
    const item = req.body;
    const updatedItem = await itemService.update(item);
    res.json(updatedItem);
  } catch (err) {
    logger.error("Failed to update item", err);
    res.status(500).send({ err: "Failed to update item" });
  }
}

async function removeItem(req, res) {
  try {
    const itemId = req.params.id;
    const removedId = await itemService.remove(itemId);
    res.send(removedId);
  } catch (err) {
    logger.error("Failed to remove item", err);
    res.status(500).send({ err: "Failed to remove item" });
  }
}

async function addItemMsg(req, res) {
  const { loggedinUser } = req;
  try {
    const itemId = req.params.id;
    const msg = {
      txt: req.body.txt,
      by: loggedinUser,
    };
    const savedMsg = await itemService.addItemMsg(itemId, msg);
    res.json(savedMsg);
  } catch (err) {
    logger.error("Failed to update item", err);
    res.status(500).send({ err: "Failed to update item" });
  }
}

async function removeItemMsg(req, res) {
  const { loggedinUser } = req;
  try {
    const itemId = req.params.id;
    const { msgId } = req.params;

    const removedId = await itemService.removeItemMsg(itemId, msgId);
    res.send(removedId);
  } catch (err) {
    logger.error("Failed to remove item msg", err);
    res.status(500).send({ err: "Failed to remove item msg" });
  }
}

module.exports = {
  getItems,
  getItemById,
  addItem,
  updateItem,
  removeItem,
  addItemMsg,
  removeItemMsg,
};
