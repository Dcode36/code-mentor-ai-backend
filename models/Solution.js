const mongoose = require('mongoose');

const solutionSchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: 'User',
    required: true,
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  result: {
    type: mongoose.Schema.Types.Mixed, // Use Mixed type to store objects
    required: true,
  },
  executionTime: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  stdin: {
    type: String,
    required: true,
  },
  output: {
    type: String,
    required: true,
  },
});

const Solution = mongoose.model('Solution', solutionSchema);

module.exports = Solution;
