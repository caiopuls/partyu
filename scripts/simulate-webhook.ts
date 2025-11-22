
import dotenv from 'dotenv';
import path from 'path';
import fetch from 'node-fetch';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function simulateWebhook() {
    const orderId = process.argv[2];

    if (!orderId) {
        console.error("Usage: npx ts-node scripts/simulate-webhook.ts <order_id>");
        process.exit(1);
    }

    console.log(`Simulating OpenPix Webhook for Order ID: ${orderId}`);

    const payload = {
        charge: {
            status: "COMPLETED",
            correlationID: orderId,
            value: 10000, // 100.00 BRL
            transactionID: `mock-tx-${Date.now()}`,
            customer: {
                name: "Mock Customer",
                email: "mock@example.com",
                taxID: {
                    taxID: "00000000000",
                    type: "BR:CPF"
                }
            }
        }
    };

    try {
        const response = await fetch('http://localhost:3000/api/webhooks/openpix', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log("Webhook Response:", response.status, data);
    } catch (error) {
        console.error("Error sending webhook:", error);
    }
}

simulateWebhook();
