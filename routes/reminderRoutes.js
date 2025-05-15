const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/reminderController');
const authMiddleware = require('../middleware/authMiddleware');


router.get('/:studentId/:month/:year', authMiddleware, reminderController.getRemindersByMonth);


router.post('/', authMiddleware, reminderController.createReminder);


router.delete('/:studentId/:id', authMiddleware, reminderController.deleteReminder);

module.exports = router;