// models/Question.js
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
  },
  tags: [String],
  sampleInput: {
    type: String,
  },
  sampleOutput: {
    type: String,
  },
  constraints: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);