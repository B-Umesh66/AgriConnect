const autocannon = require('autocannon');

async function runPerfTest() {
    console.log("Starting Performance Test Setup...");

    const API_BASE_URL = 'http://localhost:5500';

    // Use the existing user from the database
    const identifier = "tej@gmail.com";
    const password = "123";
    const userType = "Farmer";

    let token = "";

    try {
        console.log(`Attempting login at ${API_BASE_URL}/api/auth/login...`);
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, password, userType })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(`Login failed: ${data.message || 'Unknown error'}`);
        }

        token = data.token;
        console.log("Successfully obtained JWT token!");

    } catch (error) {
        console.error("Failed to authenticate for performance testing:", error);
        process.exit(1);
    }

    // Run Autocannon programmatically with the fresh token
    const targetUrl = `${API_BASE_URL}/api/bookings`;
    console.log(`Running autocannon against ${targetUrl}...`);

    const instance = autocannon({
        url: targetUrl,
        connections: 50,
        duration: 20,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    autocannon.track(instance, { renderProgressBar: true });

    instance.on('done', async (result) => {
        console.log("\n--- Performance Test Completed ---");
        console.log(autocannon.printResult(result));

        if (result.errors > 50) {
            console.error("Too many errors during performance test. Failing...");
            process.exit(1);
        }
    });
}

runPerfTest();
