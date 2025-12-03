import mongoose from 'mongoose'

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.warn('MONGODB_URI not set, skipping DB connection')
    return
  }
  try {
    await mongoose.connect(uri, { autoIndex: true })
    console.log('MongoDB connected')
  } catch (err) {
    console.error('MongoDB connection error')
  }
}
