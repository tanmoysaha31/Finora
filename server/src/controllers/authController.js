import * as authService from '../services/authService.js'

export const signup = async (req, res, next) => {
  try {
    const { fullname, email, password } = req.body
    const data = await authService.signup({ fullname, email, password })
    res.status(201).json(data)
  } catch (err) {
    next(err)
  }
}

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const data = await authService.login({ email, password })
    res.json(data)
  } catch (err) {
    next(err)
  }
}
