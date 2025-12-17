import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    txId: { type: String }
  },
  { _id: false }
)

const debtSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    lender: { type: String, required: true },
    type: { type: String, default: 'Personal Loan' },
    totalAmount: { type: Number, required: true },
    remaining: { type: Number, required: true },
    interestRate: { type: Number, default: 0 },
    minPayment: { type: Number, default: 0 },
    dueDate: { type: Date },
    color: { type: String },
    icon: { type: String },
    history: { type: [paymentSchema], default: [] },
    reminders: { type: [Number], default: [] } // Custom reminder days before due date
  },
  { timestamps: true }
)

export default mongoose.model('Debt', debtSchema)
