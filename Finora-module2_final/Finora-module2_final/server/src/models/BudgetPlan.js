import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    icon: { type: String },
    color: { type: String },
    spent: { type: Number, default: 0 },
    limit: { type: Number, default: 0 }
  },
  { _id: false }
)

const budgetPlanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    income: { type: Number, default: 0 },
    categories: { type: [categorySchema], default: [] }
  },
  { timestamps: true }
)

export default mongoose.model('BudgetPlan', budgetPlanSchema)
