import express from 'express'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'

const router = express.Router()

/**
 * =================================================================================================
 * PROFILE MANAGEMENT ROUTES
 * =================================================================================================
 * These routes handle all profile-related operations including:
 * - Retrieving user profile data
 * - Updating profile details (name, username, bio, avatar, theme, notifications)
 * - Changing password with validation
 * - Deleting account
 * - Fetching security audit log
 * =================================================================================================
 */

// ==================== HELPER FUNCTIONS ====================

/**
 * Format user response to match frontend expectations
 * @param {Object} user - MongoDB user document
 * @returns {Object} Formatted user object
 */
const formatUserResponse = (user) => {
  return {
    _id: user._id,
    fullName: user.fullname || user.fullName,
    email: user.email,
    username: user.username || user.email.split('@')[0],
    bio: user.bio || '',
    avatar: user.avatar || 'https://api.dicebear.com/9.x/adventurer/svg?seed=Default',
    avatarVibe: user.avatarVibe || 'creative',
    accountCreated: user.createdAt,
    daysActive: user.daysActive || Math.floor((Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)),
    accountStatus: user.accountStatus || 'Verified',
    theme: user.theme || 'dark',
    notifications: user.notifications || { email: true, push: false, monthlyReport: true },
    securityHealth: user.securityHealth || 92,
    privacy: user.privacy || { profileVisibility: 'private' }
  }
}

/**
 * Validate password strength
 * @param {String} password - Password to validate
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
const validatePassword = (password) => {
  const errors = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength: (8 - errors.length) * 25 // 0-100 score
  }
}

/**
 * Generate audit log entry
 * @param {String} action - Action performed
 * @param {String} userId - User ID
 * @returns {Object} Log entry
 */
const createAuditLog = (action, userId) => {
  return {
    id: Date.now(),
    userId,
    action,
    timestamp: new Date(),
    ipAddress: '::1', // In production, get from request
    userAgent: 'Finora/1.0'
  }
}

// ==================== ROUTES ====================

/**
 * GET /api/profile
 * Retrieve user profile data
 * Query params: userId (required)
 */
router.get('/', async (req, res, next) => {
  try {
    const { userId } = req.query

    // Validation
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required',
        code: 'MISSING_USER_ID'
      })
    }

    // Fetch user from database
    const user = await User.findById(userId).select('-password')
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      })
    }

    // Return formatted user data
    return res.status(200).json({
      success: true,
      user: formatUserResponse(user)
    })
  } catch (err) {
    console.error('Error fetching profile:', err)
    next(err)
  }
})

/**
 * PUT /api/profile/update
 * Update user profile details (name, username, bio, avatar, theme, notifications, etc)
 * Body: { userId, fullName, username, bio, avatar, avatarVibe, theme, notifications, privacy }
 */
router.put('/update', async (req, res, next) => {
  try {
    const { 
      userId, 
      fullName, 
      username, 
      bio, 
      avatar, 
      avatarVibe,
      theme,
      notifications,
      privacy
    } = req.body

    // Validation
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required',
        code: 'MISSING_USER_ID'
      })
    }

    // Fetch user
    const user = await User.findById(userId)
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      })
    }

    // Update allowed fields
    if (fullName && fullName.trim()) {
      user.fullName = fullName.trim()
      user.fullname = fullName.trim() // Also update fullname for compatibility
    }

    if (username && username.trim()) {
      user.username = username.trim()
    }

    if (bio !== undefined) {
      user.bio = bio && bio.length <= 200 ? bio : (user.bio || '')
    }

    if (avatar) {
      user.avatar = avatar
    }

    if (avatarVibe) {
      user.avatarVibe = avatarVibe
    }

    if (theme) {
      user.theme = theme
    }

    if (notifications && typeof notifications === 'object') {
      user.notifications = {
        email: notifications.email !== undefined ? notifications.email : (user.notifications?.email ?? true),
        push: notifications.push !== undefined ? notifications.push : (user.notifications?.push ?? false),
        monthlyReport: notifications.monthlyReport !== undefined ? notifications.monthlyReport : (user.notifications?.monthlyReport ?? true)
      }
    }

    if (privacy && typeof privacy === 'object') {
      user.privacy = {
        profileVisibility: privacy.profileVisibility || (user.privacy?.profileVisibility ?? 'private')
      }
    }

    // Save to database
    await user.save()

    // Log the action
    console.log(`Profile updated for user ${userId}`)

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: formatUserResponse(user)
    })
  } catch (err) {
    console.error('Error updating profile:', err)
    next(err)
  }
})

/**
 * PUT /api/profile/password
 * Change user password
 * Body: { userId, currentPassword, newPassword }
 */
router.put('/password', async (req, res, next) => {
  try {
    const { userId, currentPassword, newPassword } = req.body

    // Validation
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'User ID, current password, and new password are required',
        code: 'MISSING_FIELDS'
      })
    }

    // Verify current password
    if (!currentPassword || currentPassword.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Current password cannot be empty',
        code: 'INVALID_CURRENT_PASSWORD'
      })
    }

    // Fetch user
    const user = await User.findById(userId)
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      })
    }

    // Validate current password
    const passwordMatch = await bcrypt.compare(currentPassword, user.password)
    
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect',
        code: 'INCORRECT_PASSWORD'
      })
    }

    // Validate new password strength
    const passwordValidation = validatePassword(newPassword)
    
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'New password does not meet security requirements',
        errors: passwordValidation.errors,
        strength: passwordValidation.strength,
        code: 'WEAK_PASSWORD'
      })
    }

    // Prevent using same password
    const sameAsOld = await bcrypt.compare(newPassword, user.password)
    if (sameAsOld) {
      return res.status(400).json({
        success: false,
        error: 'New password must be different from current password',
        code: 'SAME_PASSWORD'
      })
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    user.password = hashedPassword
    user.lastPasswordChange = new Date()
    
    await user.save()

    console.log(`Password changed for user ${userId}`)

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    })
  } catch (err) {
    console.error('Error changing password:', err)
    next(err)
  }
})

/**
 * DELETE /api/profile/account
 * Delete user account and all associated data
 * Query params: userId (required)
 */
router.delete('/account', async (req, res, next) => {
  try {
    const { userId } = req.query

    // Validation
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required',
        code: 'MISSING_USER_ID'
      })
    }

    // Fetch user
    const user = await User.findById(userId)
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      })
    }

    // Delete user document
    await User.findByIdAndDelete(userId)

    // TODO: In production, also delete related documents:
    // - Transactions
    // - Income entries
    // - Goals
    // - Debts
    // - Bills
    // - Budgets
    // - Emotions
    // - Quiz Results
    // - Notifications
    // etc.

    console.log(`Account deleted for user ${userId}`)

    return res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    })
  } catch (err) {
    console.error('Error deleting account:', err)
    next(err)
  }
})

/**
 * GET /api/profile/security/health
 * Get security health score and audit log
 * Query params: userId (required)
 */
router.get('/security/health', async (req, res, next) => {
  try {
    const { userId } = req.query

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required',
        code: 'MISSING_USER_ID'
      })
    }

    const user = await User.findById(userId)
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      })
    }

    // Calculate security health score
    let healthScore = 50

    // Check various security factors
    if (user.password && user.password.length > 20) healthScore += 15 // Good password hash
    if (user.lastPasswordChange && (Date.now() - user.lastPasswordChange) < (90 * 24 * 60 * 60 * 1000)) healthScore += 10 // Recent password change
    if (user.twoFactorEnabled) healthScore += 25 // 2FA enabled
    if (user.email && user.email.includes('@')) healthScore += 10 // Valid email

    // Clamp score to 0-100
    healthScore = Math.min(healthScore, 100)

    // Audit log (mock data for now)
    const auditLog = [
      {
        id: 1,
        action: 'Account Created',
        date: user.createdAt,
        type: 'account',
        status: 'success'
      },
      {
        id: 2,
        action: 'Last Password Change',
        date: user.lastPasswordChange || user.createdAt,
        type: 'security',
        status: 'success'
      },
      {
        id: 3,
        action: 'Profile Updated',
        date: user.updatedAt,
        type: 'profile',
        status: 'success'
      }
    ]

    return res.status(200).json({
      success: true,
      securityHealth: healthScore,
      status: healthScore > 80 ? 'Excellent' : healthScore > 60 ? 'Good' : healthScore > 40 ? 'Fair' : 'Poor',
      auditLog
    })
  } catch (err) {
    console.error('Error fetching security health:', err)
    next(err)
  }
})

/**
 * GET /api/profile/avatars
 * Get list of available avatars
 */
router.get('/avatars', async (req, res, next) => {
  try {
    const avatarCollections = {
      masculine: [
        'https://api.dicebear.com/9.x/adventurer/svg?seed=Destiny',
        'https://api.dicebear.com/9.x/adventurer/svg?seed=Mason',
        'https://api.dicebear.com/9.x/micah/svg?seed=Oliver',
        'https://api.dicebear.com/9.x/micah/svg?seed=Adrian',
        'https://api.dicebear.com/9.x/dylan/svg?seed=Jude',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack'
      ],
      feminine: [
        'https://api.dicebear.com/9.x/adventurer/svg?seed=Riley',
        'https://api.dicebear.com/9.x/adventurer/svg?seed=Aidan',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Kylie',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Liliana',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoey',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Emery',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Bella'
      ],
      neutral: [
        'https://api.dicebear.com/7.x/bottts/svg?seed=Willow',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Oliver',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Leo',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Gizmo',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Sasha',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Coco',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Max',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Toby'
      ]
    }

    const vibes = [
      { id: 'calm', label: 'Calm', color: 'teal' },
      { id: 'creative', label: 'Creative', color: 'purple' },
      { id: 'professional', label: 'Professional', color: 'blue' },
      { id: 'energetic', label: 'Energetic', color: 'orange' }
    ]

    return res.status(200).json({
      success: true,
      avatars: avatarCollections,
      vibes
    })
  } catch (err) {
    console.error('Error fetching avatars:', err)
    next(err)
  }
})

/**
 * POST /api/profile/validate-password
 * Validate password strength without changing it
 * Body: { password }
 */
router.post('/validate-password', async (req, res, next) => {
  try {
    const { password } = req.body

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Password is required',
        code: 'MISSING_PASSWORD'
      })
    }

    const validation = validatePassword(password)

    return res.status(200).json({
      success: true,
      isValid: validation.isValid,
      strength: validation.strength,
      errors: validation.errors
    })
  } catch (err) {
    console.error('Error validating password:', err)
    next(err)
  }
})

/**
 * GET /api/profile/username/:username
 * Check if username is available
 */
router.get('/check-username/:username', async (req, res, next) => {
  try {
    const { username } = req.params

    if (!username || username.length < 3) {
      return res.status(400).json({
        success: false,
        available: false,
        reason: 'Username must be at least 3 characters long'
      })
    }

    // Check if username exists
    const existingUser = await User.findOne({ username })

    return res.status(200).json({
      success: true,
      available: !existingUser,
      username
    })
  } catch (err) {
    console.error('Error checking username:', err)
    next(err)
  }
})

/**
 * GET /api/profile/email/:email
 * Check if email is available (for verification)
 */
router.get('/check-email/:email', async (req, res, next) => {
  try {
    const { email } = req.params

    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        available: false,
        reason: 'Invalid email format'
      })
    }

    // Check if email exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })

    return res.status(200).json({
      success: true,
      available: !existingUser,
      email
    })
  } catch (err) {
    console.error('Error checking email:', err)
    next(err)
  }
})

export default router
