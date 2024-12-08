const express = require("express");
const {
  requireAuth,
  requireAdmin,
} = require("../../middlewares/requireAuth.middleware");
const { log } = require("../../middlewares/logger.middleware.js");
const {
  getItems,
  getItemById,
  addItem,
  updateItem,
  removeItem,
  addItemMsg,
  removeItemMsg,
} = require("./item.controller.js");
const router = express.Router();

// middleware that is specific to this router
// router.use(requireAuth)

router.get("/", log, getItems);
router.get("/:id", getItemById);
router.post("/", requireAuth, addItem);
// router.post('/', addItem)
router.put("/:id", requireAuth, updateItem);
// router.put('/:id', updateItem)
router.delete("/:id", requireAuth, removeItem);
// router.delete('/:id', removeItem)
router.delete("/:id", requireAuth, removeItem);

// router.post('/:id/msg', requireAuth, addItemMsg)
// router.delete('/:id/msg/:msgId', requireAuth, removeItemMsg)

module.exports = router;
