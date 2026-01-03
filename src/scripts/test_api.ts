import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api/v1';

const testApi = async () => {
    try {
        console.log('Testing API...');

        // 1. List Items
        const itemsRes = await fetch(`${BASE_URL}/items`);
        const items = await itemsRes.json();
        console.log('Items Count:', Array.isArray(items) ? items.length : items);

        if (Array.isArray(items) && items.length > 0) {
            const pizza = items.find((i: any) => i.name === 'Margherita Pizza');
            if (pizza) {
                console.log('Found Pizza via API:', pizza.id);

                // 2. Place Order via API
                console.log('Placing Order via API...');
                const orderRes = await fetch(`${BASE_URL}/orders`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        items: [{ itemId: pizza.id, qty: 1 }]
                    })
                });
                const orderResult = await orderRes.json();
                console.log('Order API Result:', orderResult);
            }
        }

    } catch (error) {
        console.error('API Test Failed:', error);
    }
};

// Wait for server to start if running via a wrapper, or just run
testApi();
