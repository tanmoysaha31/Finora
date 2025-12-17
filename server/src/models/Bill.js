import mongoose from 'mongoose'

const billSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    category: { type: String, default: 'Utilities' },
    isRecurring: { type: Boolean, default: false },
    frequency: { type: String, enum: ['weekly', 'monthly', 'yearly'], default: 'monthly' },
    status: { type: String, enum: ['unpaid', 'paid', 'overdue'], default: 'unpaid' },
    reminders: { type: [Number], default: [] } // Custom reminder days before due date
  },
  { timestamps: true }
)

export default mongoose.model('Bill', billSchema)
