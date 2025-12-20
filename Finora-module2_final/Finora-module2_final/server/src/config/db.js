import mongoose from 'mongoose'

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URL
  if (!uri) {
    console.warn('Mongo URI not set; starting without database')
    return
  }
  const insecure = String(process.env.ALLOW_INSECURE_TLS || '').toLowerCase() === 'true'
  const baseOpts = { serverSelectionTimeoutMS: 10000, connectTimeoutMS: 10000 }
  const primaryOpts = insecure ? { ...baseOpts, tlsAllowInvalidCertificates: true } : baseOpts
  try {
    await mongoose.connect(uri, primaryOpts)
    console.log('MongoDB connected')
  } catch (err) {
    console.error('MongoDB connection error:', err.message)
    const msg = String(err?.message || err)
    const isTLSIssue = /SSL routines|tlsv1 alert internal error/i.test(msg)
    if (!insecure && isTLSIssue) {
      console.warn('Retrying MongoDB connection with insecure TLS options (development only)')
      try {
        await mongoose.connect(uri, { ...baseOpts, tlsAllowInvalidCertificates: true })
        console.log('MongoDB connected (insecure TLS)')
      } catch (err2) {
        console.error('MongoDB connection error after insecure retry:', err2.message)
      }
    }
  }
}

export default mongoose
