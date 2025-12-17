import mongoose from 'mongoose'

const KnowledgeProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  completedLessons: [{
    type: Number 
  }],
  totalScore: {
    type: Number,
    default: 0
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

const KnowledgeProgress = mongoose.model('KnowledgeProgress', KnowledgeProgressSchema)
export default KnowledgeProgress
