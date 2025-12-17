import mongoose from 'mongoose'

const QuizResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  traits: {
    discipline: { type: Number, default: 0 },
    risk: { type: Number, default: 0 },
    knowledge: { type: Number, default: 0 },
    mindfulness: { type: Number, default: 0 }
  },
  personaKey: {
    type: String,
    required: true,
    enum: ['wealth_architect', 'savvy_investor', 'balanced_realist', 'spontaneous_spender', 'cautious_guardian']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const QuizResult = mongoose.model('QuizResult', QuizResultSchema)
export default QuizResult
