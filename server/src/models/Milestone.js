import mongoose from 'mongoose'

const milestoneSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true, 
      index: true 
    },
    goalId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Goal', 
      index: true 
    },
    type: { 
      type: String, 
      required: true,
      enum: ['goal_created', 'goal_25', 'goal_50', 'goal_75', 'goal_100', 'debt_cleared', 'savings_milestone']
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number },
    percentage: { type: Number },
    achievedAt: { type: Date, default: Date.now },
    icon: { type: String, default: 'fa-trophy' },
    color: { type: String, default: 'text-yellow-500' }
  },
  { timestamps: true }
)

// Compound index to prevent duplicate milestones
milestoneSchema.index({ userId: 1, goalId: 1, type: 1 }, { unique: true })

export default mongoose.model('Milestone', milestoneSchema)
