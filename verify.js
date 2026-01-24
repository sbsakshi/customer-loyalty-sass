const BASE = "http://localhost:3000/api";

async function run() {
    try {
        // Delay to let server start
        await new Promise(r => setTimeout(r, 5000));

        // 1. Register
        console.log("Registering...");
        const regRes = await fetch(BASE + "/customers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Test User", phoneNumber: "9999999999" }) // Simplified phone
        });

        if (!regRes.ok) {
            console.log("Register Error", await regRes.text());
        }

        const user = await regRes.json();
        console.log("User:", user);

        if (!user.customerId) {
            // Maybe user already exists from previous run
            if (user.customer) {
                console.log("User existed, continuing...");
            } else {
                throw new Error("Registration failed");
            }
        }

        const customerId = user.customerId || user.customer.customerId;

        // 2. Earn
        console.log("Earning points (Bill 500)...");
        const earnRes = await fetch(BASE + "/transactions/earn", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ customerId, billAmount: "500" })
        });
        const earnData = await earnRes.json();
        console.log("Earn Result:", earnData.ledger ? "Success" : earnData);

        // 3. Earn More to reach redemption threshold (Need 100)
        // 500 bill -> 50 points. Need 500 more bill.
        console.log("Earning more points (Bill 600)...");
        await fetch(BASE + "/transactions/earn", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ customerId, billAmount: "600" })
        });
        // Total should be 50 + 60 = 110.

        // 4. Check Balance
        const searchRes = await fetch(BASE + `/customers?search=${customerId}`);
        const searchData = await searchRes.json();
        const currentPoints = searchData[0].totalPoints;
        console.log("Current Points:", currentPoints);

        if (currentPoints < 110) throw new Error(`Points calculation wrong. Expected >= 110, got ${currentPoints}`);

        // 5. Redeem
        console.log("Redeeming 100 points...");

        const redeemRes = await fetch(BASE + "/transactions/redeem", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ customerId, pointsToRedeem: "100" })
        });

        if (!redeemRes.ok) console.log("Redeem Error", await redeemRes.text());

        const redeemData = await redeemRes.json();
        console.log("Redeem Result:", redeemData.ledger ? "Success" : redeemData);

        if (redeemData.customer.totalPoints !== (currentPoints - 100)) {
            throw new Error(`Redemption balance mismatch. Expected ${currentPoints - 100}, got ${redeemData.customer.totalPoints}`);
        }

        console.log("VERIFICATION SUCCESS");
    } catch (e) {
        console.error("FAILED", e);
        process.exit(1);
    }
}
run();
