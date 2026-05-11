const autocannon = require('autocannon');

async function runPerfTest() {
    console.log("Starting Performance Test Setup...");

    const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5500';
    
    const identifier = process.env.TEST_USER_ID || "perf.test@example.com"; 
    const password = process.env.TEST_USER_PASS || "perfpassword123";
    const userType = "Buyer";

    let token = "";
    let tempUserId = "";

    try {
        // 1. Create a temporary user to ensure login works
        console.log(`Creating temporary user at ${API_BASE_URL}/api/buyers/add...`);
        const registerRes = await fetch(`${API_BASE_URL}/api/buyers/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                name: "Perf Test User", 
                contact: "0000000000", 
                email: identifier, 
                password: password, 
                address: { d_no: "1", village: "V", mandal: "M", district: "D", state: "S", pincode: "000" } 
            })
        });
        
        const registerData = await registerRes.json();
        if (registerRes.ok && registerData.buyerId) {
            tempUserId = registerData.buyerId;
            console.log("Temporary user created.");
        } else {
            console.log("User might already exist or creation failed. Proceeding to login...");
        }

        // 2. Login to get the token
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
        if (!tempUserId) tempUserId = data.userId; // Save ID for cleanup
        
        console.log("Successfully obtained JWT token!");

    } catch (error) {
        console.error("Failed to authenticate for performance testing:", error);
        process.exit(1);
    }

    // 3. Run Autocannon programmatically with the fresh token
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
        
        // 4. Cleanup the temporary user
        try {
            console.log("Cleaning up temporary user...");
            await fetch(`${API_BASE_URL}/api/buyers/${tempUserId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log("Cleanup successful.");
        } catch (cleanupError) {
            console.error("Failed to cleanup temporary user:", cleanupError.message);
        }

        if (result.errors > 50) {
             console.error("Too many errors during performance test. Failing...");
             process.exit(1);
        }
    });
}

runPerfTest();
