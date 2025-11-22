
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function checkStatus() {
    const transactionId = "or_m6enl06hGhE4KRA0"; // This should be a valid OpenPix correlationID or ChargeID
    console.log(`Checking status for ${transactionId}...`);

    // Dynamic import
    const { getCharge } = await import('../src/lib/payments/openpix');

    try {
        const result = await getCharge(transactionId);
        console.log("Status Result:", JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("Error checking status:", error);
    }
}

checkStatus();
