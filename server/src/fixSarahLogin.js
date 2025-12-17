import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import User from './models/User.js'

dotenv.config()

const fixSarahLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✓ MongoDB Connected')

    let sarah = await User.findOne({ email: 'sarah@gmail.com' })
    
    if (!sarah) {
      // Create Sarah if doesn't exist
      const hashedPassword = await bcrypt.hash('password123', 10)
      sarah = await User.create({
        fullname: 'sarah',
        email: 'sarah@gmail.com',
        password: hashedPassword
      })
      console.log('✓ Created user Sarah')
    } else {
      // Update password to known value
      const hashedPassword = await bcrypt.hash('password123', 10)
      sarah.password = hashedPassword
      await sarah.save()
      console.log('✓ Updated Sarah\'s password')
    }

    console.log('\n✅ Sarah can now login with:')
    console.log('   Email: sarah@gmail.com')
    console.log('   Password: password123')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

fixSarahLogin()
