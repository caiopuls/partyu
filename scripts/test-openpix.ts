
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function testOpenPix() {
    console.log("Testing OpenPix Integration...");
    console.log("APP ID Present:", !!process.env.OPENPIX_APP_ID);

    // Dynamic import to ensure env vars are loaded first
    const { createPixCharge } = await import('../src/lib/payments/openpix');

    try {
        const correlationID = `test-${Date.now()}`;
        console.log("Creating charge with correlationID:", correlationID);

        const result = await createPixCharge({
            correlationID: correlationID,
            value: 100, // 1.00 BRL
            comment: "Test Charge",
            customer: {
                name: "Test User",
                email: "test@example.com",
                taxID: "11111111111", // CPF Inválido para teste, mas formato ok
                phone: "11999999999"
            },
            additionalInfo: [
                { key: "test", value: "true" }
            ]
        });
        console.log("Charge created successfully:");
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("Test failed:");
        console.error(error);
    }
}

testOpenPix();
