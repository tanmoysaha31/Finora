import mongoose from 'mongoose'

const incomeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true },
    source: { type: String, required: true },
    date: { type: Date, required: true },
    note: { type: String },
    isRecurring: { type: Boolean, default: false },
    paymentMethod: { type: String }
  },
  { timestamps: true }
)

export default mongoose.model('Income', incomeSchema)
