
const API_BASE = 'http://localhost:5000/api';

async function run() {
    try {
        console.log('--- Starting Same-Day Notification Test ---');

        // 1. Create User
        const email = `sameday_${Date.now()}@test.com`;
        console.log(`Creating user: ${email}`);
        let res = await fetch(`${API_BASE}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fullname: 'Same Day Tester',
                email,
                password: 'password123'
            })
        });
        let data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Signup failed');
        const userId = data.id;
        console.log(`User ID: ${userId}`);

        // 2. Create Debt (Due TODAY)
        const today = new Date();
        const dueDate = today.toISOString().split('T')[0]; // "YYYY-MM-DD"
        
        console.log(`Creating Debt due today (${dueDate})...`);
        res = await fetch(`${API_BASE}/debts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                lender: 'Same Day Loan',
                totalAmount: 500,
                remaining: 500,
                minPayment: 50,
                dueDate: dueDate, // Sending string like frontend
                type: 'Personal Loan'
            })
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Debt creation failed');
        const debtId = data.id;
        console.log(`Debt Created: ${debtId}`);

        // 3. Fetch Notifications (triggers generation)
        console.log('Fetching Notifications...');
        res = await fetch(`${API_BASE}/notifications?userId=${userId}`);
        data = await res.json();
        
        if (data.debug) {
            console.log('Debug Info:', JSON.stringify(data.debug, null, 2));
        }

        const notifications = data.notifications || [];
        console.log(`Notifications Count: ${notifications.length}`);
        
        const found = notifications.find(n => n.relatedId === debtId);
        if (found) {
            console.log('SUCCESS: Notification found!');
            console.log(JSON.stringify(found, null, 2));
        } else {
            console.log('FAILURE: No notification found for this debt.');
        }

    } catch (err) {
        console.error('Test Failed:', err);
    }
}

run();
