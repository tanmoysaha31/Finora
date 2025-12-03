import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  ID: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  isClient: { type: Boolean, default: false },
  isStaff: { type: Boolean, default: false },
})

export default mongoose.model('User', userSchema)
