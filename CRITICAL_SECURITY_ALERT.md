# 🚨 CRITICAL SECURITY ALERT

## Issue Detected
**Your Gemini API Key has been compromised and is publicly leaked.**

### Error Message
```
[403 Forbidden] Your API key was reported as leaked. Please use another API key.
```

### Current Leaked Key
```
AIzaSyB0FvREiNB8OiVqK-zKYemXXf-fo3ycpHE
```

---

## IMMEDIATE ACTION REQUIRED

### Step 1: Get New API Key

1. Go to **Google AI Studio**: https://aistudio.google.com/app/apikey
2. Click **"Get API key"** or **"Create API key"**
3. Select your Google Cloud project or create new one
4. **Copy the new API key** (it will look like: `AIzaSy...`)
5. **DO NOT SHARE THIS KEY PUBLICLY**

### Step 2: Update Your .env File

1. Open `server/.env`
2. Replace the old key with new key:
   ```env
   GEMINI_API_KEY="YOUR_NEW_KEY_HERE"
   ```
3. Save the file

### Step 3: Restart Server

```powershell
cd server
npm start
```

---

## Security Best Practices (MUST FOLLOW)

### ✅ DO:
- ✅ Keep API keys in `.env` files (never in code)
- ✅ Add `.env` to `.gitignore`
- ✅ Use environment variables in production
- ✅ Rotate keys regularly (every 3-6 months)
- ✅ Set up API key restrictions in Google Cloud Console

### ❌ DON'T:
- ❌ Commit `.env` files to GitHub/Git
- ❌ Share API keys in chat/messages
- ❌ Hardcode keys in source code
- ❌ Push keys to public repositories
- ❌ Screenshot/share code with visible keys

---

## Check if .env is Protected

Run this command to verify `.env` is ignored:
```powershell
git check-ignore server/.env
```

Expected output: `server/.env` (means it's ignored - GOOD)

If not ignored, add to `.gitignore`:
```
# In .gitignore file
server/.env
.env
*.env
```

---

## What I Fixed

1. ✅ Updated Gemini model names to correct versions:
   - `gemini-1.5-flash-latest`
   - `gemini-1.5-pro-latest`
   - `gemini-pro`

2. ✅ System now has robust fallback (will work once you add new key)

3. ✅ All AI features will automatically retry with different models

---

## After Getting New Key

Test the system:
```powershell
cd server
node test-sms-parsing.js
```

Expected: No `[403 Forbidden]` errors - AI parsing should work.

---

## Why This Happened

API keys can be leaked through:
- Committing `.env` to GitHub
- Sharing code screenshots with visible keys
- Public repository with exposed secrets
- Accidentally pasting keys in chat/forums

**Google automatically detects and blocks leaked keys to protect your account.**

---

## Need Help?

1. Generate new key: https://aistudio.google.com/app/apikey
2. Update `.env` file with new key
3. Restart server
4. Test AutoExpense and Jobs features

---

**PRIORITY: Get new API key NOW - all AI features are currently blocked.**
