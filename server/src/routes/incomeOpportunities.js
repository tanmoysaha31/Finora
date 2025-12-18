import express from 'express'
import User from '../models/User.js'
import { Groq } from 'groq-sdk'

const router = express.Router()

// Initialize Groq (reuse from environment)
let groq = null
if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim() !== '') {
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
}

// Generate AI-powered income opportunities
async function generateOpportunities(userProfile) {
  const { skills = [], workType = 'freelance', location = 'Bangladesh', experience = 'intermediate' } = userProfile

  const prompt = `You are a career advisor specializing in income opportunities in Bangladesh and globally. Based on the following user profile, suggest 5 realistic earning opportunities or gigs:

User Profile:
- Skills: ${skills.length > 0 ? skills.join(', ') : 'general skills'}
- Work Type Preference: ${workType}
- Location: ${location}
- Experience Level: ${experience}

Generate opportunities that match their profile. Include both online/remote and local opportunities. Focus on realistic, actionable gigs.

Respond in this EXACT JSON format:
[
  {
    "title": "Job/Gig Title",
    "description": "Brief description of the opportunity",
    "platform": "Where to find it (e.g., Upwork, Fiverr, Local Market, LinkedIn)",
    "estimatedEarning": "Expected income range (e.g., $500-1000/month)",
    "difficulty": "beginner, intermediate, or advanced",
    "type": "remote, local, or hybrid",
    "icon": "fa-laptop-code, fa-pen, fa-camera, fa-briefcase, fa-chart-line, or fa-users",
    "color": "bg-blue-600, bg-green-600, bg-purple-600, bg-orange-600, or bg-indigo-600"
  }
]

Respond ONLY with valid JSON array.`

  try {
    if (!groq) {
      throw new Error('AI not configured')
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_completion_tokens: 2048,
      top_p: 1,
      stream: false
    })

    const aiResponse = chatCompletion.choices[0]?.message?.content || '[]'
    let opportunities = JSON.parse(aiResponse)

    opportunities = opportunities.map((opp, idx) => ({
      id: `opp-${idx + 1}`,
      title: opp.title || 'Earning Opportunity',
      description: opp.description || '',
      platform: opp.platform || 'Various',
      estimatedEarning: opp.estimatedEarning || 'Varies',
      difficulty: opp.difficulty || 'intermediate',
      type: opp.type || 'remote',
      icon: opp.icon || 'fa-briefcase',
      color: opp.color || 'bg-blue-600'
    }))

    return opportunities

  } catch (error) {
    console.error('Income opportunities AI error:', error)

    // Fallback opportunities
    return [
      {
        id: 'fallback-1',
        title: 'Freelance Writing',
        description: 'Write articles, blog posts, and content for clients worldwide',
        platform: 'Upwork, Fiverr, Freelancer',
        estimatedEarning: '$300-800/month',
        difficulty: 'beginner',
        type: 'remote',
        icon: 'fa-pen',
        color: 'bg-blue-600'
      },
      {
        id: 'fallback-2',
        title: 'Data Entry & Virtual Assistant',
        description: 'Help businesses with administrative tasks remotely',
        platform: 'Upwork, Remote.co',
        estimatedEarning: '$200-600/month',
        difficulty: 'beginner',
        type: 'remote',
        icon: 'fa-laptop',
        color: 'bg-green-600'
      },
      {
        id: 'fallback-3',
        title: 'Web Development Projects',
        description: 'Build websites and web applications for clients',
        platform: 'Upwork, Toptal, LinkedIn',
        estimatedEarning: '$1000-3000/month',
        difficulty: 'intermediate',
        type: 'remote',
        icon: 'fa-laptop-code',
        color: 'bg-purple-600'
      },
      {
        id: 'fallback-4',
        title: 'Social Media Management',
        description: 'Manage social media accounts for local businesses',
        platform: 'Local Businesses, Fiverr',
        estimatedEarning: '$400-1000/month',
        difficulty: 'beginner',
        type: 'hybrid',
        icon: 'fa-chart-line',
        color: 'bg-orange-600'
      },
      {
        id: 'fallback-5',
        title: 'Online Tutoring',
        description: 'Teach subjects you know well to students online',
        platform: 'Preply, Tutor.com, Local',
        estimatedEarning: '$500-1500/month',
        difficulty: 'intermediate',
        type: 'remote',
        icon: 'fa-graduation-cap',
        color: 'bg-indigo-600'
      }
    ]
  }
}

// GET: Fetch income opportunities for user
router.get('/', async (req, res, next) => {
  try {
    const { userId } = req.query

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' })
    }

    let user
    try {
      user = await User.findById(userId)
    } catch (err) {
      user = await User.findOne({ $or: [{ email: userId }, { fullname: userId }] })
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const userProfile = {
      skills: user.skills || [],
      workType: user.workType || 'freelance',
      location: user.location || 'Bangladesh',
      experience: user.experience || 'intermediate'
    }

    const opportunities = await generateOpportunities(userProfile)

    res.json({
      opportunities,
      userProfile,
      summary: {
        totalOpportunities: opportunities.length,
        remoteCount: opportunities.filter(o => o.type === 'remote').length,
        lastUpdated: new Date().toISOString()
      }
    })
  } catch (err) {
    next(err)
  }
})

// POST: Update user profile for better recommendations
router.post('/update-profile', async (req, res, next) => {
  try {
    const { userId, skills, workType, location, experience } = req.body

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (skills) user.skills = skills
    if (workType) user.workType = workType
    if (location) user.location = location
    if (experience) user.experience = experience

    await user.save()

    res.json({
      message: 'Profile updated successfully',
      profile: {
        skills: user.skills,
        workType: user.workType,
        location: user.location,
        experience: user.experience
      }
    })
  } catch (err) {
    next(err)
  }
})

export default router
