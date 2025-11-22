
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function testPaymentV5() {
    console.log("Testing Pagar.me V5 API...");
    const apiKey = process.env.PAGARME_API_KEY;
    console.log("API KEY Present:", !!apiKey);

    if (!apiKey) {
        console.error("API Key missing");
        return;
    }

    const auth = Buffer.from(apiKey + ':').toString('base64');

    const payload = {
        customer: {
            name: "Test User",
            email: "test@example.com",
            document: "05682666024", // CPF válido gerado para teste (necessário para V5?)
            type: "individual",
            phones: {
                mobile_phone: {
                    country_code: "55",
                    area_code: "11",
                    number: "999999999"
                }
            }
        },
        items: [
            {
                amount: 100,
                description: "Test Item",
                quantity: 1,
                code: "test_item_1"
            }
        ],
        payments: [
            {
                payment_method: "pix",
                pix: {
                    expires_in: 3600
                }
            }
        ]
    };

    try {
        const response = await fetch('https://api.pagar.me/core/v5/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${auth}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("V5 Request Failed:", response.status, response.statusText);
            console.error("Response Body:", JSON.stringify(data, null, 2));
        } else {
            console.log("V5 Payment Created Successfully!");
            console.log("Order ID:", data.id);
            console.log("Status:", data.status);
        }

    } catch (error) {
        console.error("Network Error:", error);
    }
}

testPaymentV5();
