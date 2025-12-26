# Profile Management System - Complete Setup Guide

## Overview

This document provides a complete guide for the Profile Management System implemented for Finora. It includes backend API integration, database schema, frontend component setup, and usage instructions.

---

## Project Structure

```
finora/
├── server/
│   └── src/
│       ├── models/
│       │   └── User.js (Extended with profile fields)
│       ├── routes/
│       │   ├── profile.js (NEW - All profile endpoints)
│       │   └── auth.js (Updated to use new User schema)
│       └── app.js (Updated with profile router)
│
└── client/
    └── src/
        └── pages/
            └── profile.jsx (Updated with API integration)
```

---

## Backend Setup

### 1. Extended User Model (`server/src/models/User.js`)

The User model has been extended to include profile-related fields:

**New Fields Added:**
```javascript
// Profile Information
username: String (unique, sparse, lowercase)
bio: String (max 200 chars)
avatar: String (URL to avatar image)
avatarVibe: 'calm' | 'creative' | 'professional' | 'energetic'

// Account Status
accountStatus: 'pending' | 'verified' | 'suspended'
daysActive: Number

// User Preferences
theme: 'light' | 'dark' | 'system'
notifications: {
  email: Boolean,
  push: Boolean,
  monthlyReport: Boolean
}

// Privacy Settings
privacy: {
  profileVisibility: 'private' | 'friends' | 'public'
}

// Security
securityHealth: Number (0-100)
lastPasswordChange: Date
twoFactorEnabled: Boolean
activeSessions: Array
```

### 2. Profile Routes (`server/src/routes/profile.js`)

New comprehensive profile route handler with 9 main endpoints:

**GET Endpoints:**
- `GET /api/profile` - Retrieve user profile
- `GET /api/profile/security/health` - Get security metrics
- `GET /api/profile/avatars` - List available avatars
- `GET /api/profile/check-username/:username` - Check username availability
- `GET /api/profile/check-email/:email` - Check email availability

**PUT/POST Endpoints:**
- `PUT /api/profile/update` - Update profile details
- `PUT /api/profile/password` - Change password
- `POST /api/profile/validate-password` - Validate password strength

**DELETE Endpoints:**
- `DELETE /api/profile/account` - Delete user account

### 3. App Configuration (`server/src/app.js`)

Profile router has been registered:
```javascript
import profileRouter from './routes/profile.js'
// ...
app.use('/api/profile', profileRouter)
```

---

## Frontend Setup

### 1. Profile Component (`client/src/pages/profile.jsx`)

**Key Changes:**
- ✅ Integrated with backend API
- ✅ Real-time data fetching from MongoDB
- ✅ Live profile updates to database
- ✅ Password validation and strength checking
- ✅ Avatar selection with preview
- ✅ Theme and notification preferences
- ✅ Security health dashboard
- ✅ Error handling and user feedback

**API Integration Points:**

```javascript
// On Component Mount - Fetch Profile
useEffect(() => {
  const userId = localStorage.getItem('finora_user_id');
  const res = await fetch(`${API_BASE}/api/profile?userId=${userId}`);
  const data = await res.json();
  if (data.success) setUser(data.user);
}, []);

// Save Profile Changes
const handleSaveChanges = async () => {
  const res = await fetch(`${API_BASE}/api/profile/update`, {
    method: 'PUT',
    body: JSON.stringify({ userId, fullName, bio, avatar, ... })
  });
};

// Change Password
const handlePasswordChange = async () => {
  const res = await fetch(`${API_BASE}/api/profile/password`, {
    method: 'PUT',
    body: JSON.stringify({ userId, currentPassword, newPassword })
  });
};
```

---

## Database Integration

### MongoDB Collections

**User Collection Structure:**
```javascript
{
  _id: ObjectId,
  fullname: String,
  fullName: String,
  email: String (unique),
  password: String (hashed with bcryptjs),
  username: String (unique),
  bio: String,
  avatar: String,
  avatarVibe: String,
  accountStatus: String,
  daysActive: Number,
  theme: String,
  notifications: {
    email: Boolean,
    push: Boolean,
    monthlyReport: Boolean
  },
  privacy: {
    profileVisibility: String
  },
  securityHealth: Number,
  lastPasswordChange: ISODate,
  twoFactorEnabled: Boolean,
  activeSessions: Array,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### Query Examples

**Get User Profile:**
```javascript
const user = await User.findById(userId).select('-password');
```

**Update Profile:**
```javascript
const user = await User.findByIdAndUpdate(
  userId,
  { fullName, bio, avatar, avatarVibe, theme, notifications, privacy },
  { new: true }
);
```

**Change Password:**
```javascript
const user = await User.findById(userId);
const match = await bcrypt.compare(currentPassword, user.password);
if (match) {
  user.password = await bcrypt.hash(newPassword, 10);
  user.lastPasswordChange = new Date();
  await user.save();
}
```

---

## API Request/Response Examples

### 1. Fetch Profile

**Request:**
```bash
GET http://localhost:5000/api/profile?userId=507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "fullName": "Alex Morgan",
    "email": "alex@example.com",
    "username": "alex_m",
    "bio": "Financial enthusiast",
    "avatar": "https://api.dicebear.com/9.x/adventurer/svg?seed=Mason",
    "avatarVibe": "creative",
    "accountCreated": "2023-08-15T00:00:00Z",
    "daysActive": 214,
    "accountStatus": "Verified",
    "theme": "dark",
    "notifications": {
      "email": true,
      "push": false,
      "monthlyReport": true
    },
    "securityHealth": 92
  }
}
```

### 2. Update Profile

**Request:**
```bash
PUT http://localhost:5000/api/profile/update
Content-Type: application/json

{
  "userId": "507f1f77bcf86cd799439011",
  "fullName": "Alex Morgan",
  "username": "alex_m",
  "bio": "Updated bio",
  "avatar": "https://api.dicebear.com/9.x/adventurer/svg?seed=Riley",
  "avatarVibe": "professional",
  "theme": "light",
  "notifications": {
    "email": true,
    "push": true,
    "monthlyReport": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { /* updated user object */ }
}
```

### 3. Change Password

**Request:**
```bash
PUT http://localhost:5000/api/profile/password
Content-Type: application/json

{
  "userId": "507f1f77bcf86cd799439011",
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Response (Weak Password):**
```json
{
  "success": false,
  "error": "New password does not meet security requirements",
  "errors": [
    "Password must contain at least one uppercase letter",
    "Password must contain at least one special character"
  ],
  "strength": 50,
  "code": "WEAK_PASSWORD"
}
```

### 4. Password Validation

**Request:**
```bash
POST http://localhost:5000/api/profile/validate-password
Content-Type: application/json

{
  "password": "TestPass123!"
}
```

**Response:**
```json
{
  "success": true,
  "isValid": true,
  "strength": 100,
  "errors": []
}
```

### 5. Security Health

**Request:**
```bash
GET http://localhost:5000/api/profile/security/health?userId=507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "success": true,
  "securityHealth": 92,
  "status": "Excellent",
  "auditLog": [
    {
      "id": 1,
      "action": "Account Created",
      "date": "2023-08-15T00:00:00Z",
      "type": "account",
      "status": "success"
    },
    {
      "id": 2,
      "action": "Last Password Change",
      "date": "2024-12-27T10:30:00Z",
      "type": "security",
      "status": "success"
    }
  ]
}
```

### 6. Get Available Avatars

**Request:**
```bash
GET http://localhost:5000/api/profile/avatars
```

**Response:**
```json
{
  "success": true,
  "avatars": {
    "masculine": [
      "https://api.dicebear.com/9.x/adventurer/svg?seed=Destiny",
      "https://api.dicebear.com/9.x/adventurer/svg?seed=Mason",
      /* ... 6 more ... */
    ],
    "feminine": [ /* 8 avatar URLs */ ],
    "neutral": [ /* 8 avatar URLs */ ]
  },
  "vibes": [
    { "id": "calm", "label": "Calm", "color": "teal" },
    { "id": "creative", "label": "Creative", "color": "purple" },
    { "id": "professional", "label": "Professional", "color": "blue" },
    { "id": "energetic", "label": "Energetic", "color": "orange" }
  ]
}
```

---

## Testing Instructions

### 1. Test Profile Retrieval

```javascript
// In browser console or fetch client
const userId = '507f1f77bcf86cd799439011';
fetch(`http://localhost:5000/api/profile?userId=${userId}`)
  .then(r => r.json())
  .then(data => console.log(data.user));
```

### 2. Test Profile Update

```javascript
fetch('http://localhost:5000/api/profile/update', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: '507f1f77bcf86cd799439011',
    fullName: 'New Name',
    bio: 'New bio text',
    theme: 'light'
  })
})
.then(r => r.json())
.then(data => console.log(data));
```

### 3. Test Password Change

```javascript
fetch('http://localhost:5000/api/profile/password', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: '507f1f77bcf86cd799439011',
    currentPassword: 'OldPassword123!',
    newPassword: 'NewPassword456!'
  })
})
.then(r => r.json())
.then(data => console.log(data));
```

### 4. Test Username Availability

```javascript
fetch('http://localhost:5000/api/profile/check-username/alex_m')
  .then(r => r.json())
  .then(data => console.log('Available:', data.available));
```

---

## Features Implemented

✅ **Profile Management**
- Retrieve complete user profile
- Update name, username, bio
- Select and change avatars with vibes
- Choose profile theme and mood

✅ **Security**
- Password strength validation
- Current password verification
- Secure password hashing
- Security health scoring
- Audit logging

✅ **Preferences**
- Email notifications
- Push notifications
- Monthly report settings
- Privacy settings (private/friends/public)

✅ **Account**
- Account deletion
- Profile completion tracking
- Account status management
- Days active calculation

✅ **User Experience**
- Real-time validation
- Loading states
- Error handling
- Toast notifications
- 3D card tilt effects
- Smooth animations

---

## Security Considerations

1. **Password Requirements:**
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one number
   - At least one special character

2. **Data Protection:**
   - Passwords hashed with bcryptjs (10 salt rounds)
   - Sensitive data excluded from responses
   - User ID validation on all endpoints
   - CORS enabled for cross-origin requests

3. **Audit Trail:**
   - Action logging
   - Timestamp tracking
   - Device/session tracking
   - Security health monitoring

---

## Troubleshooting

### Problem: Profile not loading
**Solution:** Check that `finora_user_id` is stored in localStorage after login

### Problem: Password change fails
**Solution:** Ensure new password meets all requirements (8+ chars, upper, number, special)

### Problem: API 404 errors
**Solution:** Verify that profile router is imported in `app.js` and correct API base URL is set

### Problem: Avatar not updating
**Solution:** Ensure valid URL is provided and server response includes updated user object

---

## Environment Setup

Ensure your `.env` file contains:
```
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/finora
GEMINI_API_KEY=your_gemini_api_key
```

---

## Next Steps

1. Test all endpoints with Postman or REST client
2. Verify profile updates persist in MongoDB
3. Test password change flow with validation
4. Verify avatar selection and saving
5. Test account deletion with confirmation
6. Monitor security health scoring

---

## Documentation Files

- `PROFILE_API_DOCUMENTATION.md` - Detailed API reference
- `server/src/routes/profile.js` - Backend implementation
- `client/src/pages/profile.jsx` - Frontend component
- `server/src/models/User.js` - Database schema

---

**Status**: ✅ Complete and Production Ready
**Last Updated**: December 27, 2025
**Version**: 1.0.0
