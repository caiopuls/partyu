
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function checkStatusLoop() {
    const transactionId = "test-123"; // Replace with valid ID
    console.log(`Monitoring status for ${transactionId}...`);

    // Dynamic import
    const { getCharge } = await import('../src/lib/payments/openpix');

    for (let i = 0; i < 10; i++) {
        try {
            const result = await getCharge(transactionId);
            console.log(`[${new Date().toISOString()}] Status: ${result.charge.status}`);

            if (result.charge.status === 'COMPLETED' || result.charge.status === 'EXPIRED') {
                console.log("Final status reached.");
                break;
            }
        } catch (error) {
            console.error("Error checking status:", error);
        }
        // Wait 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
}

checkStatusLoop();
