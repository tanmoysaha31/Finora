import mongoose from 'mongoose'

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URL
  if (!uri) {
    console.warn('Mongo URI not set; starting without database')
    return
  }
  try {
    await mongoose.connect(uri)
    console.log('MongoDB connected')
  } catch (err) {
    console.error('MongoDB connection error:', err.message)
  }
}

export default mongoose
