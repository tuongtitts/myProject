const express = require('express');
const router = express.Router();
const lessonProgressController = require('../controllers/lessonProgressController');

router.get('/:studentId/:lessonId', lessonProgressController.getLessonProgress);
router.put('/:studentId/:lessonId', lessonProgressController.createOrUpdateLessonProgress);
router.delete('/:studentId/:lessonId', lessonProgressController.deleteLessonProgress);

module.exports = router;
