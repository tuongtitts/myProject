const express = require("express");
const router = express.Router();
const userStatusController = require("../controllers/userStatusController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, userStatusController.getOnlineUsers);

module.exports = router;