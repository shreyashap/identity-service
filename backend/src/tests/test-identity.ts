const BASE_URL = 'http://localhost:3000';

async function runTest(label: string, payload: any) {
    console.log(`\n--- Test: ${label} ---`);
    console.log('Request:', JSON.stringify(payload));

    try {
        const response = await fetch(`${BASE_URL}/identify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        console.log('Response Status:', response.status);
        console.log('Response Body:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Test failed:', error);
    }
}

async function startTests() {
    console.log('Starting Identity Reconciliation Tests...');

    // Scenario 1: New Customer
    await runTest('New Customer (Primary Created)', {
        email: 'mcfly@hillvalley.edu',
        phoneNumber: '123456'
    });

    // Scenario 2: Existing Phone, New Email
    await runTest('Existing Phone, New Email (Secondary Created)', {
        email: 'lorraine@hillvalley.edu',
        phoneNumber: '123456'
    });

    // Scenario 3: Link two existing primary contacts
    // First, create another independent primary
    await runTest('New Independent Customer', {
        email: 'george@hillvalley.edu',
        phoneNumber: '717171'
    });

    // Now, link them
    await runTest('Link Existing Primaries', {
        email: 'mcfly@hillvalley.edu',
        phoneNumber: '717171'
    });

    // Scenario 4: Request with existing info
    await runTest('Existing Info (No Changes)', {
        email: 'mcfly@hillvalley.edu',
        phoneNumber: '123456'
    });
}

startTests();
