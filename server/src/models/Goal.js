import mongoose from 'mongoose'

const goalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    current: { type: Number, default: 0 },
    target: { type: Number, required: true },
    items: { type: String },
    icon: { type: String },
    bg: { type: String }
  },
  { timestamps: true }
)

export default mongoose.model('Goal', goalSchema)
