const express = require("express");
const router = express.Router();

const controller =
  require("../controllers/controller");

router.post("/", controller.createEntry);
router.get("/", controller.getEntries);

module.exports = router;