import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true },
    // Income Opportunities Profile
    skills: [{ type: String }],
    workType: { type: String, enum: ['full-time', 'part-time', 'freelance', 'contract', 'remote', 'gig'], default: 'freelance' },
    location: { type: String },
    experience: { type: String },
    // Email Integration
    emailIntegrationEnabled: { type: Boolean, default: false },
    emailProvider: { type: String, enum: ['gmail', 'outlook', 'yahoo'], default: 'gmail' },
    lastEmailSync: { type: Date }
  },
  { timestamps: true }
)

export default mongoose.model('User', userSchema)
