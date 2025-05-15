// adminRoutes.js
const express = require("express");
const adminController = require("../controllers/userAdminController");
const authMiddleware = require("../middleware/authMiddleware"); 

const router = express.Router();


router.get("/all", authMiddleware, adminController.getAllUsers);


router.post("/", authMiddleware, adminController.createUser);


router.put("/:id", authMiddleware, adminController.updateUser);


router.put("/:id/reset-password", authMiddleware, adminController.resetPassword); 
router.delete("/user/:id", authMiddleware, adminController.deleteUser);


module.exports = router;
