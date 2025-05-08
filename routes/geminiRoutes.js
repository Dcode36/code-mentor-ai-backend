const express = require('express');
const geminiController = require('../controllers/geminiController');
const router = express.Router();

router.post('/generate-solution',geminiController.getFormattedSolution);
router.post('/rate-user-code', geminiController.rateUserCode);

module.exports = router;