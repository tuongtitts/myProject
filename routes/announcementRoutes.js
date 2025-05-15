const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const announcementController = require("../controllers/announcementController");
const authMiddleware = require("../middleware/authMiddleware");
module.exports = (io) => {
  const router = express.Router();

  router.post("/", authMiddleware, upload.single("attachment"), (req, res) => {
    announcementController.create(req, res, io);
  });
  

  router.get("/", announcementController.getAll);
  router.put("/:id", upload.single("attachment"), (req, res) =>
    announcementController.update(req, res, io)
  );
  router.delete('/:id', authMiddleware, (req, res) =>
    announcementController.delete(req, res, io)
  );  

  return router;
};
