import mongoose from 'mongoose'

const emotionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    expenseId: { type: String, required: true, index: true },
    mood: { type: String, required: true },
    necessity: { type: String },
    socialContext: { type: String },
    timestamp: { type: Date, default: Date.now },
    editCount: { type: Number, default: 1 },
    lastEditedAt: { type: Date }
  },
  { timestamps: true }
)

export default mongoose.model('EmotionCheckin', emotionSchema)
