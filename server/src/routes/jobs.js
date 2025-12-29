import express from 'express';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

/**
 * GET /api/jobs/search
 * Search for jobs based on skills and preferences
 * Query params: skills (comma-separated), jobType (freelance, fulltime, side-hustle)
 */
router.get('/search', async (req, res) => {
  try {
    const { skills = '', jobType = 'all', location = 'Remote' } = req.query;
    
    // Parse skills
    const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
    
    if (skillsArray.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide at least one skill' 
      });
    }

    const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
    const RAPIDAPI_HOST = 'jsearch.p.rapidapi.com';

    if (!RAPIDAPI_KEY) {
      return res.status(500).json({ 
        success: false, 
        message: 'API key not configured. Please set RAPIDAPI_KEY in .env file' 
      });
    }

    const allJobs = [];

    // Build search queries based on job type and skills
    const searchQueries = [];
    
    for (const skill of skillsArray) {
      if (jobType === 'all' || jobType === 'freelance') {
        searchQueries.push(`${skill} freelance remote`);
      }
      if (jobType === 'all' || jobType === 'fulltime') {
        searchQueries.push(`${skill} developer full-time`);
      }
      if (jobType === 'all' || jobType === 'side-hustle') {
        searchQueries.push(`${skill} part-time remote`);
      }
    }

    // Limit queries to avoid exceeding API limits and timeouts
    const limitedQueries = searchQueries.slice(0, 3);

    // Fetch jobs for each query
    for (const query of limitedQueries) {
      try {
        const options = {
          method: 'GET',
          url: 'https://jsearch.p.rapidapi.com/search',
          params: {
            query: query,
            page: '1',
            num_pages: '1',
            date_posted: 'month',
            remote_jobs_only: true
          },
          headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': RAPIDAPI_HOST
          },
          timeout: 10000
        };

        console.log(`[${new Date().toISOString()}] Fetching jobs for: "${query}"`);
        const response = await axios.request(options);
        
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          console.log(`✅ Found ${response.data.data.length} jobs for: "${query}"`);
          allJobs.push(...response.data.data);
        } else {
          console.log(`⚠️ No data in response for: "${query}"`);
        }
      } catch (error) {
        const errorMsg = error.response?.status === 429 ? 'API Rate Limited' : error.message;
        console.error(`❌ Error for query "${query}": ${errorMsg}`);
      }
    }

    // Remove duplicates based on job_id
    const uniqueJobs = Array.from(
      new Map(allJobs.map(job => [job.job_id, job])).values()
    );

    console.log(`Total unique jobs found: ${uniqueJobs.length}`);

    // Calculate match score and format jobs
    const jobsWithScore = uniqueJobs.map(job => {
      const jobTitle = (job.job_title || '').toLowerCase();
      const jobDescription = (job.job_description || '').toLowerCase();
      const jobText = `${jobTitle} ${jobDescription}`;
      
      // Count matching skills
      const matchingSkills = skillsArray.filter(skill => 
        jobText.includes(skill.toLowerCase())
      );
      
      // Calculate match percentage
      let matchScore = 60; // Base score
      if (matchingSkills.length > 0) {
        matchScore = Math.min(
          Math.round(((matchingSkills.length / skillsArray.length) * 40) + 60),
          100
        );
      }
      
      // Determine job type from job title
      let detectedType = 'fulltime';
      if (jobTitle.includes('freelance') || jobTitle.includes('contract')) {
        detectedType = 'freelance';
      } else if (jobTitle.includes('part') || jobTitle.includes('part-time') || jobTitle.includes('part time')) {
        detectedType = 'side-hustle';
      }

      return {
        id: job.job_id,
        title: job.job_title || 'Job Title',
        company: job.employer_name || 'Company',
        platform: 'JSearch',
        rate: job.job_salary_currency_code ? `${job.job_salary_currency_code} ${job.job_min_salary || 'Competitive'}` : 'Competitive',
        type: detectedType,
        matchScore: Math.max(60, Math.min(matchScore + Math.floor(Math.random() * 5), 100)),
        skills: matchingSkills.length > 0 ? matchingSkills : skillsArray.slice(0, 3),
        posted: job.job_posted_at_datetime_utc 
          ? getTimeAgo(job.job_posted_at_datetime_utc)
          : 'Recently',
        logo: getJobEmoji(detectedType),
        description: job.job_description 
          ? job.job_description.substring(0, 200) + '...'
          : 'No description available',
        applyLink: job.job_apply_link || 'https://jsearch.p.rapidapi.com',
        location: job.job_city || job.job_country || 'Remote',
        employerLogo: job.employer_logo || null,
        highlights: job.job_highlights || [],
        jobType: job.job_employment_type || detectedType
      };
    });

    // Filter by job type if specified
    let filteredJobs = jobsWithScore;
    if (jobType !== 'all') {
      filteredJobs = jobsWithScore.filter(job => job.type === jobType);
    }

    // Sort by match score descending
    filteredJobs.sort((a, b) => b.matchScore - a.matchScore);

    // Limit to 15 jobs
    const limitedJobs = filteredJobs.slice(0, 15);

    res.json({
      success: true,
      count: limitedJobs.length,
      jobs: limitedJobs,
      searchedSkills: skillsArray,
      totalFetched: uniqueJobs.length
    });

  } catch (error) {
    console.error('Job search error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching job opportunities',
      error: error.message 
    });
  }
});

/**
 * Helper function to calculate time ago
 */
function getTimeAgo(datetime) {
  const now = new Date();
  const posted = new Date(datetime);
  const diffMs = now - posted;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffHours < 24) {
    return diffHours === 0 ? 'Just now' : `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks}w ago`;
  } else {
    return 'Over a month ago';
  }
}

/**
 * Helper function to get emoji based on job type
 */
function getJobEmoji(type) {
  const emojis = {
    freelance: ['🎨', '💻', '✍️', '🎭', '🎬', '📱'],
    fulltime: ['💼', '🏢', '👔', '📊', '🖥️', '⚙️'],
    'side-hustle': ['🌟', '📰', '🎯', '💡', '🚀', '⭐']
  };
  
  const emojiArray = emojis[type] || emojis.freelance;
  return emojiArray[Math.floor(Math.random() * emojiArray.length)];
}

/**
 * POST /api/jobs/insights
 * Generate AI-powered career insights based on user skills and job matches
 */
router.post('/insights', async (req, res) => {
  try {
    const { skills = [], jobs = [], currentIncome = 0 } = req.body;

    if (!skills || skills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Skills array is required'
      });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Gemini API key not configured'
      });
    }

    // Prepare job data summary
    const jobSummary = jobs.slice(0, 5).map(job => ({
      title: job.title,
      company: job.company,
      type: job.type,
      rate: job.rate,
      matchScore: job.matchScore,
      skills: job.skills
    }));

    // Create detailed prompt for Gemini
    const prompt = `You are a professional career advisor and income strategist. Analyze the following data and provide personalized career insights:

USER PROFILE:
- Current Skills: ${skills.join(', ')}
- Current Monthly Income: $${currentIncome}

TOP MATCHED JOBS (Sample):
${jobSummary.map((job, i) => `${i + 1}. ${job.title} at ${job.company} (${job.type}) - Match: ${job.matchScore}% - Rate: ${job.rate}`).join('\n')}

TASK:
Provide a JSON response with the following structure (no markdown, just pure JSON):

{
  "potentialImpact": {
    "monthlyIncrease": <number: realistic monthly income increase in USD>,
    "projections": {
      "current": <number: current monthly income>,
      "oneGig": <number: with 1 additional gig>,
      "twoGigs": <number: with 2 gigs>,
      "threeGigs": <number: with 3 gigs>
    },
    "insight": "<string: 1-2 sentence insight about their earning potential>"
  },
  "skillUnlock": {
    "missingSkill": "<string: one key skill they should learn>",
    "potentialIncrease": "<string: salary increase potential like '$15/hr' or '20%'>",
    "reasoning": "<string: 1-2 sentences why this skill is valuable>",
    "matchImprovement": <number: percentage increase in job matches>
  },
  "topRecommendation": {
    "action": "<string: specific actionable advice>",
    "timeframe": "<string: estimated timeline like '2-3 months'>",
    "impact": "<string: expected outcome>"
  }
}

Base your analysis on:
1. Current job market trends for their skills
2. Realistic income projections based on job type (freelance/fulltime/part-time)
3. In-demand skills that complement their existing skillset
4. Practical, achievable recommendations

Be realistic, professional, and encouraging. Focus on actionable insights.`;

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY.replace(/"/g, ''));
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    
    console.log('[Jobs Insights] Generating AI insights...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    
    // Clean up the response (remove markdown code blocks if present)
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    console.log('[Jobs Insights] Raw AI response:', text.substring(0, 200) + '...');
    
    const insights = JSON.parse(text);
    
    res.json({
      success: true,
      insights: insights,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Jobs Insights] Error:', error);
    
    // Fallback insights if AI fails
    const fallbackInsights = {
      potentialImpact: {
        monthlyIncrease: 1200,
        projections: {
          current: req.body.currentIncome || 5000,
          oneGig: (req.body.currentIncome || 5000) + 600,
          twoGigs: (req.body.currentIncome || 5000) + 1200,
          threeGigs: (req.body.currentIncome || 5000) + 2000
        },
        insight: "Based on your skills, taking on 2-3 additional projects could significantly boost your monthly income."
      },
      skillUnlock: {
        missingSkill: "TypeScript",
        potentialIncrease: "$15/hr",
        reasoning: "TypeScript is highly demanded and complements your existing JavaScript skills perfectly.",
        matchImprovement: 25
      },
      topRecommendation: {
        action: "Focus on building a portfolio with your current skills while learning one new complementary skill",
        timeframe: "1-2 months",
        impact: "Increase job matches by 30% and unlock higher-paying opportunities"
      }
    };

    res.json({
      success: true,
      insights: fallbackInsights,
      generatedAt: new Date().toISOString(),
      fallback: true
    });
  }
});

/**
 * GET /api/jobs/stats
 * Get user job search statistics
 */
router.get('/stats', async (req, res) => {
  try {
    // This would typically come from database based on user activity
    res.json({
      success: true,
      stats: {
        totalSearches: 42,
        applicationsSubmitted: 8,
        matchRate: 87,
        avgMatchScore: 84
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching statistics' 
    });
  }
});

export default router;
