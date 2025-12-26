import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    // Basic Authentication
    fullname: { type: String, required: true },
    fullName: { type: String }, // Alias for fullname
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true },

    // Profile Information
    username: { type: String, unique: true, sparse: true, lowercase: true },
    bio: { type: String, default: '', maxlength: 200 },
    avatar: { type: String, default: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Default' },
    avatarVibe: { type: String, enum: ['calm', 'creative', 'professional', 'energetic'], default: 'creative' },

    // Account Status
    accountStatus: { type: String, enum: ['pending', 'verified', 'suspended'], default: 'verified' },
    daysActive: { type: Number, default: 0 },

    // User Preferences
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'dark' },
    
    // Notification Settings
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: false },
      monthlyReport: { type: Boolean, default: true }
    },

    // Privacy Settings
    privacy: {
      profileVisibility: { type: String, enum: ['private', 'friends', 'public'], default: 'private' }
    },

    // Security
    securityHealth: { type: Number, default: 92, min: 0, max: 100 },
    lastPasswordChange: { type: Date },
    twoFactorEnabled: { type: Boolean, default: false },
    activeSessions: [{
      device: String,
      location: String,
      lastActive: Date,
      ipAddress: String
    }]
  },
  { timestamps: true }
)

// Create text index for search
userSchema.index({ fullname: 'text', email: 'text', username: 'text' })

export default mongoose.model('User', userSchema)
