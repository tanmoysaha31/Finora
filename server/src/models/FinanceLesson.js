import mongoose from 'mongoose';

const FinanceLessonSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  desc: String,
  icon: String,
  color: String,
  content: {
    intro: String,
    importance: [String],
    example: String,
    types: [String],
    rules: [String],
    methods: [String],
    principle: String,
    scams: [String],
    prevention: String
  },
  quiz: [{
    q: String,
    options: [String],
    answer: Number
  }]
});

const FinanceLesson = mongoose.model('FinanceLesson', FinanceLessonSchema);
export default FinanceLesson;
