import mongoose from 'mongoose'

export const connectDB = async () => {
  const uri = process.env.MONGO_URI
  if (!uri) {
    console.error('Missing MONGO_URI environment variable')
    throw new Error('MONGO_URI not set')
  }
  try {
    await mongoose.connect(uri)
    console.log('MongoDB connected')
  } catch (err) {
    console.error('MongoDB connection error:', err.message)
    throw err
  }
}

export default mongoose
