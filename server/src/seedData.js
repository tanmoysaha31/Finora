import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from './models/User.js'
import Transaction from './models/Transaction.js'
import Income from './models/Income.js'
import Goal from './models/Goal.js'

dotenv.config()

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✓ MongoDB Connected')
  } catch (err) {
    console.error('MongoDB connection error:', err)
    process.exit(1)
  }
}

const seedDataForSarah = async () => {
  try {
    await connectDB()

    // Find Sarah
    const sarah = await User.findOne({ fullname: /sarah/i })
    if (!sarah) {
      console.error('❌ User Sarah not found')
      process.exit(1)
    }

    console.log(`✓ Found user: ${sarah.fullname} (${sarah.email})`)

    // Delete existing data for Sarah
    await Transaction.deleteMany({ userId: sarah._id })
    await Income.deleteMany({ userId: sarah._id })
    await Goal.deleteMany({ userId: sarah._id })
    console.log('✓ Cleared existing data')

    // Create income records (last 3 months)
    const incomes = []
    const today = new Date()
    
    for (let i = 0; i < 3; i++) {
      const incomeDate = new Date(today)
      incomeDate.setMonth(today.getMonth() - i)
      incomeDate.setDate(1)
      
      incomes.push({
        userId: sarah._id,
        amount: 3500,
        source: 'Monthly Salary',
        date: incomeDate,
        note: 'Regular monthly income',
        isRecurring: true
      })
    }

    await Income.insertMany(incomes)
    console.log(`✓ Created ${incomes.length} income records`)

    // Create diverse transactions (expenses)
    const transactions = []
    const categories = {
      'Food': [
        { title: 'Grocery Shopping', amount: -180, icon: 'fa-cart-shopping' },
        { title: 'Restaurant Dinner', amount: -65, icon: 'fa-utensils' },
        { title: 'Coffee Shop', amount: -25, icon: 'fa-mug-hot' },
        { title: 'Lunch Takeout', amount: -35, icon: 'fa-burger' },
        { title: 'Snacks & Beverages', amount: -40, icon: 'fa-cookie' }
      ],
      'Transport': [
        { title: 'Gas Station', amount: -80, icon: 'fa-gas-pump' },
        { title: 'Uber Ride', amount: -25, icon: 'fa-car' },
        { title: 'Public Transit Pass', amount: -120, icon: 'fa-bus' },
        { title: 'Car Maintenance', amount: -150, icon: 'fa-wrench' }
      ],
      'Shopping': [
        { title: 'Clothing Store', amount: -200, icon: 'fa-shirt' },
        { title: 'Online Shopping', amount: -95, icon: 'fa-bag-shopping' },
        { title: 'Shoes', amount: -120, icon: 'fa-shoe-prints' },
        { title: 'Electronics', amount: -180, icon: 'fa-laptop' }
      ],
      'Entertainment': [
        { title: 'Movie Tickets', amount: -35, icon: 'fa-film' },
        { title: 'Streaming Services', amount: -45, icon: 'fa-tv' },
        { title: 'Concert Tickets', amount: -80, icon: 'fa-music' },
        { title: 'Gaming', amount: -60, icon: 'fa-gamepad' }
      ],
      'Utility': [
        { title: 'Electricity Bill', amount: -120, icon: 'fa-bolt' },
        { title: 'Internet Bill', amount: -70, icon: 'fa-wifi' },
        { title: 'Water Bill', amount: -45, icon: 'fa-droplet' },
        { title: 'Phone Bill', amount: -55, icon: 'fa-phone' }
      ],
      'Health': [
        { title: 'Gym Membership', amount: -50, icon: 'fa-dumbbell' },
        { title: 'Pharmacy', amount: -35, icon: 'fa-pills' },
        { title: 'Doctor Visit', amount: -100, icon: 'fa-user-doctor' }
      ],
      'Savings': [
        { title: 'Emergency Fund Deposit', amount: -200, icon: 'fa-piggy-bank' },
        { title: 'Investment Account', amount: -300, icon: 'fa-chart-line' }
      ]
    }

    // Generate transactions over the last 3 months
    for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
      for (const [category, items] of Object.entries(categories)) {
        // Add 1-3 transactions per category per month
        const numTransactions = Math.floor(Math.random() * 3) + 1
        
        for (let i = 0; i < numTransactions && i < items.length; i++) {
          const item = items[i]
          const txDate = new Date(today)
          txDate.setMonth(today.getMonth() - monthOffset)
          txDate.setDate(Math.floor(Math.random() * 28) + 1)
          
          transactions.push({
            userId: sarah._id,
            title: item.title,
            category: category,
            amount: item.amount,
            date: txDate,
            paymentMethod: ['Credit Card', 'Debit Card', 'Cash'][Math.floor(Math.random() * 3)],
            note: `${category} expense`
          })
        }
      }
    }

    // Add some small expenses (coffee, snacks, etc.)
    for (let i = 0; i < 15; i++) {
      const smallDate = new Date(today)
      smallDate.setDate(today.getDate() - Math.floor(Math.random() * 30))
      
      transactions.push({
        userId: sarah._id,
        title: ['Coffee', 'Snack', 'Parking', 'Magazine', 'Water Bottle'][Math.floor(Math.random() * 5)],
        category: 'Food',
        amount: -(Math.floor(Math.random() * 15) + 5), // $5-$20
        date: smallDate,
        paymentMethod: 'Cash'
      })
    }

    await Transaction.insertMany(transactions)
    console.log(`✓ Created ${transactions.length} transactions`)

    // Create savings goals
    const goals = [
      {
        userId: sarah._id,
        title: 'Emergency Fund',
        current: 1200,
        target: 5000,
        type: 'savings',
        deadline: new Date(today.getFullYear(), today.getMonth() + 6, 1),
        icon: 'fa-shield',
        bg: 'bg-emerald-600',
        color: 'bg-emerald-500',
        shadow: 'shadow-emerald-500/50'
      },
      {
        userId: sarah._id,
        title: 'Vacation Fund',
        current: 800,
        target: 2500,
        type: 'travel',
        deadline: new Date(today.getFullYear(), today.getMonth() + 4, 1),
        icon: 'fa-plane',
        bg: 'bg-blue-600',
        color: 'bg-blue-500',
        shadow: 'shadow-blue-500/50'
      },
      {
        userId: sarah._id,
        title: 'New Laptop',
        current: 400,
        target: 1500,
        type: 'purchase',
        deadline: new Date(today.getFullYear(), today.getMonth() + 3, 1),
        icon: 'fa-laptop',
        bg: 'bg-purple-600',
        color: 'bg-purple-500',
        shadow: 'shadow-purple-500/50'
      }
    ]

    await Goal.insertMany(goals)
    console.log(`✓ Created ${goals.length} savings goals`)

    console.log('\n✅ Data seeding completed successfully!')
    console.log(`\nSummary for ${sarah.fullname}:`)
    console.log(`- Incomes: ${incomes.length} records ($${incomes.reduce((sum, i) => sum + i.amount, 0).toFixed(2)} total)`)
    console.log(`- Transactions: ${transactions.length} records ($${Math.abs(transactions.reduce((sum, t) => sum + t.amount, 0)).toFixed(2)} total expenses)`)
    console.log(`- Goals: ${goals.length} savings goals`)
    console.log(`- Net Savings: $${(incomes.reduce((sum, i) => sum + i.amount, 0) + transactions.reduce((sum, t) => sum + t.amount, 0)).toFixed(2)}`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding data:', error)
    process.exit(1)
  }
}

seedDataForSarah()
