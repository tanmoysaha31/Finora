import mongoose from 'mongoose'

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', index: true },
    incomeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Income', index: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    paymentMethod: { type: String },
    note: { type: String }
  },
  { timestamps: true }
)

export default mongoose.model('Transaction', transactionSchema)
