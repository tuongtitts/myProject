// courseRoutes.js
const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

router.get('/category/:categoryId', courseController.getCoursesByCategory);
router.post('/', courseController.createCourse);
router.delete('/:id', courseController.deleteCourse);

module.exports = router;