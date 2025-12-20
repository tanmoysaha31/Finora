import mongoose from 'mongoose'

const contactSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    avatar: { type: String },
    avatarType: { type: String },
    icon: { type: String }
  },
  { timestamps: true }
)

export default mongoose.model('Contact', contactSchema)
