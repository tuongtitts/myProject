const express = require('express');
const router = express.Router();
const userAnnouncementController = require('../controllers/userAnnouncementController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, userAnnouncementController.getAnnouncements);
router.post('/', authMiddleware, userAnnouncementController.createAnnouncement);
router.post('/all', authMiddleware, userAnnouncementController.createAnnouncementForAll); // Route mới
router.put('/:id/read', authMiddleware, userAnnouncementController.markAsRead);
router.delete('/:id', authMiddleware, userAnnouncementController.deleteAnnouncement);

module.exports = router;