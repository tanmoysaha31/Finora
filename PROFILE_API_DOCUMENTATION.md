# Profile API Documentation

## Overview

The Profile API provides comprehensive user profile management functionality for the Finora financial application. It handles profile data retrieval, updates, password management, security settings, and account deletion.

---

## API Endpoints

### 1. **GET /api/profile**
Retrieve complete user profile data.

**Query Parameters:**
```javascript
{
  userId: string (required) // MongoDB User ID
}
```

**Response (Success - 200):**
```javascript
{
  success: true,
  user: {
    _id: ObjectId,
    fullName: string,
    email: string,
    username: string,
    bio: string,
    avatar: string (URL),
    avatarVibe: 'calm' | 'creative' | 'professional' | 'energetic',
    accountCreated: Date,
    daysActive: number,
    accountStatus: 'pending' | 'verified' | 'suspended',
    theme: 'light' | 'dark' | 'system',
    notifications: {
      email: boolean,
      push: boolean,
      monthlyReport: boolean
    },
    securityHealth: number (0-100),
    privacy: {
      profileVisibility: 'private' | 'friends' | 'public'
    }
  }
}
```

**Error Response (404):**
```javascript
{
  success: false,
  error: "User not found",
  code: "USER_NOT_FOUND"
}
```

---

### 2. **PUT /api/profile/update**
Update user profile information and preferences.

**Request Body:**
```javascript
{
  userId: string (required),
  fullName: string (optional),
  username: string (optional),
  bio: string (optional, max 200 chars),
  avatar: string (optional, URL),
  avatarVibe: 'calm' | 'creative' | 'professional' | 'energetic' (optional),
  theme: 'light' | 'dark' | 'system' (optional),
  notifications: {
    email: boolean (optional),
    push: boolean (optional),
    monthlyReport: boolean (optional)
  },
  privacy: {
    profileVisibility: 'private' | 'friends' | 'public' (optional)
  }
}
```

**Response (Success - 200):**
```javascript
{
  success: true,
  message: "Profile updated successfully",
  user: { /* full user object */ }
}
```

**Error Response (400):**
```javascript
{
  success: false,
  error: "User ID is required",
  code: "MISSING_USER_ID"
}
```

---

### 3. **PUT /api/profile/password**
Change user password with validation.

**Request Body:**
```javascript
{
  userId: string (required),
  currentPassword: string (required),
  newPassword: string (required)
    // Must contain:
    // - At least 8 characters
    // - At least one uppercase letter
    // - At least one number
    // - At least one special character
}
```

**Response (Success - 200):**
```javascript
{
  success: true,
  message: "Password changed successfully"
}
```

**Error Response (401):**
```javascript
{
  success: false,
  error: "Current password is incorrect",
  code: "INCORRECT_PASSWORD"
}
```

**Error Response (400 - Weak Password):**
```javascript
{
  success: false,
  error: "New password does not meet security requirements",
  errors: [
    "Password must contain at least one uppercase letter",
    "Password must contain at least one special character"
  ],
  strength: 50, // 0-100
  code: "WEAK_PASSWORD"
}
```

---

### 4. **DELETE /api/profile/account**
Permanently delete user account and associated data.

**Query Parameters:**
```javascript
{
  userId: string (required)
}
```

**Response (Success - 200):**
```javascript
{
  success: true,
  message: "Account deleted successfully"
}
```

**Warning:** This action is irreversible and will delete:
- User profile
- All transactions
- All income entries
- All goals
- All debts
- All bills
- All quiz results
- All notifications
- All other user-related data

---

### 5. **GET /api/profile/security/health**
Get security health score and audit log.

**Query Parameters:**
```javascript
{
  userId: string (required)
}
```

**Response (Success - 200):**
```javascript
{
  success: true,
  securityHealth: number (0-100),
  status: 'Excellent' | 'Good' | 'Fair' | 'Poor',
  auditLog: [
    {
      id: number,
      action: string,
      date: Date,
      type: 'account' | 'security' | 'profile',
      status: 'success' | 'failure'
    }
  ]
}
```

---

### 6. **GET /api/profile/avatars**
Get list of available avatar styles and vibes.

**Response (Success - 200):**
```javascript
{
  success: true,
  avatars: {
    masculine: [ /* array of 8 URLs */ ],
    feminine: [ /* array of 8 URLs */ ],
    neutral: [ /* array of 8 URLs */ ]
  },
  vibes: [
    { id: 'calm', label: 'Calm', color: 'teal' },
    { id: 'creative', label: 'Creative', color: 'purple' },
    { id: 'professional', label: 'Professional', color: 'blue' },
    { id: 'energetic', label: 'Energetic', color: 'orange' }
  ]
}
```

---

### 7. **POST /api/profile/validate-password**
Validate password strength without changing it.

**Request Body:**
```javascript
{
  password: string (required)
}
```

**Response (Success - 200):**
```javascript
{
  success: true,
  isValid: boolean,
  strength: number (0-100),
  errors: string[] // Empty if valid
}
```

---

### 8. **GET /api/profile/check-username/:username**
Check if username is available.

**Path Parameters:**
```javascript
{
  username: string (required, min 3 chars)
}
```

**Response (Success - 200):**
```javascript
{
  success: true,
  available: boolean,
  username: string
}
```

**Error Response (400):**
```javascript
{
  success: false,
  available: false,
  reason: "Username must be at least 3 characters long"
}
```

---

### 9. **GET /api/profile/check-email/:email**
Check if email is available (for verification).

**Path Parameters:**
```javascript
{
  email: string (required, valid email format)
}
```

**Response (Success - 200):**
```javascript
{
  success: true,
  available: boolean,
  email: string
}
```

---

## Database Schema

### User Model

```javascript
{
  // Authentication
  fullname: String (required),
  fullName: String (alias),
  email: String (required, unique),
  password: String (required, hashed),

  // Profile
  username: String (unique, sparse),
  bio: String (max 200 chars),
  avatar: String (URL),
  avatarVibe: 'calm' | 'creative' | 'professional' | 'energetic',

  // Status
  accountStatus: 'pending' | 'verified' | 'suspended',
  daysActive: Number,

  // Preferences
  theme: 'light' | 'dark' | 'system',
  notifications: {
    email: Boolean,
    push: Boolean,
    monthlyReport: Boolean
  },

  // Privacy
  privacy: {
    profileVisibility: 'private' | 'friends' | 'public'
  },

  // Security
  securityHealth: Number (0-100),
  lastPasswordChange: Date,
  twoFactorEnabled: Boolean,
  activeSessions: [{
    device: String,
    location: String,
    lastActive: Date,
    ipAddress: String
  }],

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

---

## Frontend Integration

### 1. **Fetching Profile**
```javascript
const userId = localStorage.getItem('finora_user_id');
const response = await fetch(`/api/profile?userId=${userId}`);
const data = await response.json();
if (data.success) {
  setUser(data.user);
}
```

### 2. **Updating Profile**
```javascript
const response = await fetch('/api/profile/update', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId,
    fullName: 'New Name',
    bio: 'New bio',
    avatar: 'new-avatar-url'
  })
});
```

### 3. **Changing Password**
```javascript
const response = await fetch('/api/profile/password', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId,
    currentPassword: 'oldpass123!',
    newPassword: 'NewPass456!'
  })
});
```

### 4. **Validating Password**
```javascript
const response = await fetch('/api/profile/validate-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password: 'TestPass123!' })
});
const data = await response.json();
console.log(data.isValid, data.strength); // true, 100
```

---

## Error Handling

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `MISSING_USER_ID` | 400 | User ID not provided |
| `USER_NOT_FOUND` | 404 | User doesn't exist |
| `INCORRECT_PASSWORD` | 401 | Current password is wrong |
| `WEAK_PASSWORD` | 400 | New password doesn't meet requirements |
| `SAME_PASSWORD` | 400 | New password same as old password |
| `INVALID_CURRENT_PASSWORD` | 400 | Current password field is empty |
| `MISSING_FIELDS` | 400 | Required fields are missing |
| `MISSING_PASSWORD` | 400 | Password not provided for validation |

---

## Security Features

1. **Password Hashing**: Uses bcryptjs with 10 salt rounds
2. **Password Strength Validation**: Enforces minimum complexity requirements
3. **Current Password Verification**: Required to change password
4. **Account Status Tracking**: Monitors verification and suspension status
5. **Security Health Score**: Calculates based on security metrics
6. **Audit Logging**: Tracks profile changes and security events
7. **Session Management**: Tracks active sessions and device info

---

## Usage Examples

### Complete Profile Update with Avatar and Settings

```javascript
// Frontend
const updateProfile = async () => {
  const response = await fetch(`${API_BASE}/api/profile/update`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: localStorage.getItem('finora_user_id'),
      fullName: 'Alex Morgan',
      username: 'alex_m',
      bio: 'Financial enthusiast',
      avatar: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Mason',
      avatarVibe: 'professional',
      theme: 'dark',
      notifications: {
        email: true,
        push: false,
        monthlyReport: true
      },
      privacy: {
        profileVisibility: 'private'
      }
    })
  });
  const data = await response.json();
  if (data.success) {
    console.log('Profile updated!', data.user);
  }
};
```

### Password Change Flow

```javascript
// 1. Validate new password first
const validation = await fetch('/api/profile/validate-password', {
  method: 'POST',
  body: JSON.stringify({ password: newPassword })
}).then(r => r.json());

if (!validation.isValid) {
  alert('Password too weak: ' + validation.errors.join(', '));
  return;
}

// 2. Change password
const response = await fetch('/api/profile/password', {
  method: 'PUT',
  body: JSON.stringify({
    userId,
    currentPassword,
    newPassword
  })
}).then(r => r.json());

if (response.success) {
  alert('Password changed successfully!');
}
```

---

## Future Enhancements

- [ ] Two-factor authentication (2FA) setup
- [ ] Social login integration (Google, GitHub)
- [ ] Profile picture upload with image processing
- [ ] Email verification workflow
- [ ] Account recovery options
- [ ] Login history visualization
- [ ] Device management and session revocation
- [ ] Profile sharing and social features
- [ ] Export user data (GDPR compliance)

---

## Testing Checklist

- [ ] Create account and login
- [ ] Fetch profile successfully
- [ ] Update profile information
- [ ] Change avatar and vibe
- [ ] Update theme and notifications
- [ ] Change password with strong password
- [ ] Validate weak passwords
- [ ] Check username availability
- [ ] Check email availability
- [ ] View security health score
- [ ] View audit log
- [ ] Delete account (with confirmation)

---

**Last Updated**: December 27, 2025
**API Version**: 1.0.0
**Status**: Production Ready
