# 🚀 Income Opportunities API Setup Guide

This guide will help you set up the free JSearch API from RapidAPI to enable the job opportunities feature.

## ✨ Features
- 🔍 Search for 10-15 real job postings
- 💼 Support for freelance, full-time, and side-hustle/part-time positions
- 🎯 Skill-based matching with dynamic match scores
- 🆓 **100% FREE** (150 requests/month on free tier)
- 🌍 Remote and location-based job search

---

## 📝 Step-by-Step Setup Instructions

### Step 1: Create a RapidAPI Account
1. Go to [RapidAPI.com](https://rapidapi.com/)
2. Click **"Sign Up"** in the top right corner
3. Sign up using:
   - Email & Password, OR
   - Google account, OR
   - GitHub account
4. Verify your email if required

### Step 2: Subscribe to JSearch API (FREE)
1. Once logged in, go to: [JSearch API Page](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch)
2. Or search for **"JSearch"** in the RapidAPI search bar
3. Click on the **"JSearch"** API
4. Click the **"Subscribe to Test"** button
5. Select the **"Basic (FREE)"** plan:
   - ✅ 150 requests/month
   - ✅ No credit card required
   - ✅ Completely free forever
6. Click **"Subscribe"** to confirm

### Step 3: Get Your API Key
1. After subscribing, you'll be on the API endpoint page
2. Look for the **"Code Snippets"** section in the center
3. You'll see headers that include:
   ```
   X-RapidAPI-Key: YOUR_API_KEY_HERE
   X-RapidAPI-Host: jsearch.p.rapidapi.com
   ```
4. **Copy your API key** (the long string after `X-RapidAPI-Key:`)

### Step 4: Add API Key to Your Project
1. Open your project folder
2. Navigate to: `server/.env`
3. Add or update the following line:
   ```env
   RAPIDAPI_KEY=your_actual_api_key_here
   ```
4. Replace `your_actual_api_key_here` with the key you copied
5. Save the file

### Step 5: Install Required Dependency
If you haven't already, install axios in your server:

```bash
cd server
npm install axios
```

### Step 6: Restart Your Server
```bash
# In the server terminal
npm start
```

---

## 🎯 How to Use

1. **Navigate to Income Opportunities** page in your app
2. **Add your skills** (e.g., React, JavaScript, Design, Python, etc.)
3. **Click "Search Jobs"** button
4. Jobs will be fetched based on your skills and displayed with:
   - Match scores (how well they match your skills)
   - Job type (Freelance, Full-time, Part-time)
   - Company information
   - Direct apply links

---

## 🔧 Technical Details

### API Endpoint Used
```
GET https://jsearch.p.rapidapi.com/search
```

### Query Parameters
- `query`: Search keywords (constructed from user skills)
- `page`: Page number (default: 1)
- `num_pages`: Number of pages to fetch (default: 1)
- `date_posted`: Filter by posting date (default: 'month')

### Backend Route
```
GET http://localhost:5000/api/jobs/search?skills=React,JavaScript&jobType=all&location=Remote
```

### Match Score Calculation
The backend calculates a match score based on:
- How many of your skills appear in the job title
- How many of your skills appear in the job description
- Percentage = (matching skills / total skills) × 100

---

## 🐛 Troubleshooting

### "API key not configured" Error
- ✅ Make sure you added `RAPIDAPI_KEY=...` to `server/.env`
- ✅ Restart your server after adding the key
- ✅ Check that there are no extra spaces around the key

### No Jobs Showing Up
- ✅ Make sure you clicked the "Search Jobs" button
- ✅ Check that you have at least one skill added
- ✅ Try different skills (e.g., "Developer", "Designer", "Writer")
- ✅ Check your internet connection
- ✅ You might have hit the 150 requests/month limit (check RapidAPI dashboard)

### "Failed to fetch job opportunities"
- ✅ Make sure your server is running on port 5000
- ✅ Check the browser console for detailed error messages
- ✅ Verify your API key is correct in the .env file

---

## 📊 Free Tier Limits

**JSearch API Free Tier:**
- ✅ 150 requests per month
- ✅ No credit card required
- ✅ Access to all job search features
- ✅ Real-time job data

**Usage Tips:**
- Each "Search Jobs" click = 3 API requests (to get variety)
- You can make ~50 searches per month
- Cache results when possible
- The backend limits to 3 search queries per request to conserve API calls

---

## 🎉 You're All Set!

Your Income Opportunities feature is now fully functional with:
- ✅ Real job listings from multiple sources
- ✅ Skill-based matching
- ✅ Freelance, full-time, and side-hustle options
- ✅ Direct application links
- ✅ Completely free API integration

**Need Help?**
- Check RapidAPI dashboard: https://rapidapi.com/developer/dashboard
- View API documentation: https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
- Monitor your usage to stay within free tier limits

---

## 🔐 Security Note

**Never commit your `.env` file to Git!**
- Your `.gitignore` should include `.env`
- Only commit `.env.example` with placeholder values
- Share setup instructions, not actual API keys
