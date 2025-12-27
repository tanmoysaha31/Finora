const transactionSchema = new mongoose.Schema({
  // ... existing fields ...
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { type: String, default: 'Others' },
  // ADD THESE:
  trxId: { type: String }, // To store the unique bank/MFS ID
  paymentMethod: { type: String }, // e.g., "Mobile Banking"
  rawSMS: { type: String }, // Optional: store original message for debugging/history
  // ...
});