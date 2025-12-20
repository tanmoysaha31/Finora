export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500
  const message = err.message || 'Server error'
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error:', message)
  }
  res.status(status).json({ error: message })
}
