// File: src/routes/lessonRoutes.js
const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');

router.post('/', lessonController.createLesson);
router.get('/:courseId', lessonController.getLessonsByCourse);
router.get('/details/:lessonId', lessonController.getLessonDetails);
router.put('/:lessonId', lessonController.updateLesson);
router.delete('/:lessonId', lessonController.deleteLesson);

module.exports = router;