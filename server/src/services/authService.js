import bcrypt from 'bcryptjs'
import User from '../models/User.js'

const badRequest = (message) => Object.assign(new Error(message), { status: 400 })
const conflict = (message) => Object.assign(new Error(message), { status: 409 })
const unauthorized = (message) => Object.assign(new Error(message), { status: 401 })

export const signup = async ({ fullname, email, password }) => {
  if (!fullname || !email || !password) throw badRequest('Missing fields')
  const existing = await User.findOne({ email })
  if (existing) throw conflict('Email exists')
  const hash = await bcrypt.hash(password, 10)
  const user = await User.create({ fullname, email, password: hash })
  return { id: user._id, fullname, email }
}

export const login = async ({ email, password }) => {
  if (!email || !password) throw badRequest('Missing fields')
  const user = await User.findOne({ email })
  if (!user) throw unauthorized('Invalid credentials')
  const ok = await bcrypt.compare(password, user.password)
  if (!ok) throw unauthorized('Invalid credentials')
  return { id: user._id, fullname: user.fullname, email }
}
