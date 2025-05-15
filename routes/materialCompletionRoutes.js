const express = require('express');
const router = express.Router();
const controller = require('../controllers/materialCompletionController');

router.post('/complete', controller.markMaterialCompleted);
router.get('/completed/:studentId', controller.getCompletedMaterials);

module.exports = router;
