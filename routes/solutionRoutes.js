


const express = require('express');
const router = express.Router();
const solutionController = require('../controllers/solutionController');

// POST: Submit a solution
router.post('/', solutionController.submitSolution);

// GET: Get all solutions for a question
// router.get('/:questionId', solutionController.getSolutionsForQuestion);

// GET: Get a solution by ID
router.get('/solution/:id', solutionController.getSolutionById);



// GET: Get languages and IDs
router.get('/languages', solutionController.getLanguagesAndIds);
module.exports = router;
