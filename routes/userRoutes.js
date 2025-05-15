const express = require("express");
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


router.get("/profile", authMiddleware, userController.getProfile);

router.put("/profile", authMiddleware, userController.updateProfile);

router.post("/login", userController.login);

router.post("/logout", authMiddleware, userController.logout);

module.exports = router;