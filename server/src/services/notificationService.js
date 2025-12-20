import Notification from '../models/Notification.js'
import Bill from '../models/Bill.js'
import Debt from '../models/Debt.js'
import Goal from '../models/Goal.js'

export const checkAndGenerateReminders = async (userId) => {
  const now = new Date()
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)

  // Mandatory intervals: 30 days, 7 days, 3 days, 1 day, 0 days
  const mandatoryIntervals = [0, 1, 3, 7, 30]

  // 1. Check Bills
  const unpaidBills = await Bill.find({
    userId,
    status: 'unpaid',
    dueDate: { $gte: today }
  })

  for (const bill of unpaidBills) {
    if (!bill.dueDate) continue

    const billDate = new Date(bill.dueDate)
    billDate.setHours(0, 0, 0, 0)
    
    const diffTime = billDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    // Combine mandatory and custom intervals
    const customReminders = bill.reminders || []
    const intervals = [...new Set([...mandatoryIntervals, ...customReminders])]

    if (intervals.includes(diffDays)) {
      const alreadyNotifiedToday = await Notification.exists({
        userId,
        relatedId: bill._id,
        type: 'bill',
        createdAt: { $gte: today }
      })

      if (!alreadyNotifiedToday) {
        let msg = ''
        if (diffDays === 0) msg = `Your bill "${bill.title}" of $${bill.amount} is due TODAY!`
        else if (diffDays === 1) msg = `Your bill "${bill.title}" of $${bill.amount} is due tomorrow.`
        else msg = `Reminder: Your bill "${bill.title}" of $${bill.amount} is due in ${diffDays} days.`

        await Notification.create({
          userId,
          type: 'bill',
          title: diffDays === 0 ? 'Bill Due Today' : 'Upcoming Bill Reminder',
          message: msg,
          relatedId: bill._id
        })
      }
    }
  }

  // 2. Check Debts
  const unpaidDebts = await Debt.find({
    userId,
    remaining: { $gt: 0 },
    dueDate: { $gte: today }
  })

  for (const debt of unpaidDebts) {
    if (!debt.dueDate) continue

    const debtDate = new Date(debt.dueDate)
    debtDate.setHours(0, 0, 0, 0)

    const diffTime = debtDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    // Combine mandatory and custom intervals
    const customReminders = debt.reminders || []
    const intervals = [...new Set([...mandatoryIntervals, ...customReminders])]

    if (intervals.includes(diffDays)) {
      const alreadyNotifiedToday = await Notification.exists({
        userId,
        relatedId: debt._id,
        type: 'debt',
        createdAt: { $gte: today }
      })

      if (!alreadyNotifiedToday) {
        let msg = ''
        const amountStr = debt.minPayment > 0 ? `$${debt.minPayment}` : 'payment'
        if (diffDays === 0) msg = `Loan payment for "${debt.lender}" (${amountStr}) is due TODAY!`
        else if (diffDays === 1) msg = `Loan payment for "${debt.lender}" (${amountStr}) is due tomorrow.`
        else msg = `Reminder: Loan payment for "${debt.lender}" (${amountStr}) is due in ${diffDays} days.`

        await Notification.create({
          userId,
          type: 'debt',
          title: diffDays === 0 ? 'Loan Payment Due Today' : 'Loan Payment Reminder',
          message: msg,
          relatedId: debt._id
        })
      }
    }
  }

  // 3. Check Goals (Deadlines)
  const incompleteGoals = await Goal.find({
    userId,
    deadline: { $gte: today }
  })

  for (const goal of incompleteGoals) {
    if (goal.current >= goal.target) continue
    if (!goal.deadline) continue

    const goalDate = new Date(goal.deadline)
    goalDate.setHours(0, 0, 0, 0)

    const diffTime = goalDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    // Combine mandatory and custom intervals
    const customReminders = goal.reminders || []
    const intervals = [...new Set([...mandatoryIntervals, ...customReminders])]

    if (intervals.includes(diffDays)) {
      const alreadyNotifiedToday = await Notification.exists({
        userId,
        relatedId: goal._id,
        type: 'goal',
        createdAt: { $gte: today }
      })

      if (!alreadyNotifiedToday) {
        let msg = ''
        if (diffDays === 0) msg = `Your goal "${goal.title}" deadline is TODAY!`
        else if (diffDays === 1) msg = `Your goal "${goal.title}" deadline is tomorrow.`
        else msg = `Reminder: Your goal "${goal.title}" deadline is in ${diffDays} days.`

        await Notification.create({
          userId,
          type: 'goal',
          title: diffDays === 0 ? 'Goal Deadline Today' : 'Goal Deadline Approaching',
          message: msg,
          relatedId: goal._id
        })
      }
    }
  }
}
