
const API_BASE = 'http://localhost:5000/api';
let userId;

async function test() {
  try {
    console.log('--- Starting Test ---');

    // 1. Login or Signup
    const email = `testuser_${Date.now()}@example.com`;
    const password = 'password123';
    console.log(`Creating user: ${email}`);
    
    let res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullname: 'Test User', email, password })
    });
    
    let data = await res.json();
    if (!res.ok) {
        console.log('Signup failed/exists, trying login...');
        res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        data = await res.json();
    }
    
    userId = data.id;
    if (!userId) {
        console.error('Auth response:', data);
        throw new Error('No User ID found');
    }
    console.log(`User ID: ${userId}`);

    // 2. Create Debt (Due in 2 days)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 2);
    
    console.log('Creating Debt...');
    res = await fetch(`${API_BASE}/debts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId,
            lender: 'Test Bank',
            totalAmount: 1000,
            remaining: 500,
            minPayment: 50,
            dueDate: dueDate.toISOString(),
            type: 'Personal Loan'
        })
    });
    console.log('Debt Created:', await res.json());

    // 3. Create Goal (Deadline in 2 days)
    console.log('Creating Goal...');
    res = await fetch(`${API_BASE}/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId,
            title: 'Test Goal',
            targetAmount: 1000,
            savedAmount: 100,
            deadline: dueDate.toISOString()
        })
    });
    console.log('Goal Created:', await res.json());

    // 4. Create Bill (Due in 1 day)
    const billDate = new Date();
    billDate.setDate(billDate.getDate() + 1);
    console.log('Creating Bill...');
    res = await fetch(`${API_BASE}/bills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId,
            title: 'Electric Bill',
            amount: 150,
            dueDate: billDate.toISOString(),
            category: 'Utility'
        })
    });
    console.log('Bill Created:', await res.json());

    // 5. Fetch Notifications (Should trigger generation)
    console.log('Fetching Notifications...');
    res = await fetch(`${API_BASE}/notifications?userId=${userId}`);
    data = await res.json();
    
    console.log('Notifications Count:', data.notifications ? data.notifications.length : 0);
    if (data.notifications && data.notifications.length > 0) {
        console.log('First Notification:', data.notifications[0]);
    }

  } catch (err) {
    console.error('TEST FAILED:', err);
  }
}

test();
