import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding ...')

    // Create Customers
    const alice = await prisma.customer.upsert({
        where: { phoneNumber: '9876543210' },
        update: {},
        create: {
            customerId: 'CUST001',
            name: 'Alice Sharma',
            phoneNumber: '9876543210',
            totalPoints: 150,
            address: '123, MG Road, Bangalore',
            messages: {
                create: [
                    {
                        messageType: 'WELCOME',
                        content: 'Welcome to Manbhavan Store!',
                        status: 'SENT'
                    }
                ]
            }
        },
    })

    const bob = await prisma.customer.upsert({
        where: { phoneNumber: '9988776655' },
        update: {},
        create: {
            customerId: 'CUST002',
            name: 'Bob Gupta',
            phoneNumber: '9988776655',
            totalPoints: 50,
            address: '456, Park Street, Kolkata',
        },
    })

    const charlie = await prisma.customer.upsert({
        where: { phoneNumber: '8877665544' },
        update: {},
        create: {
            customerId: 'CUST003',
            name: 'Charlie Singh',
            phoneNumber: '8877665544',
            totalPoints: 0,
        },
    })

    // Create Transactions (Ledger)
    await prisma.pointsLedger.createMany({
        data: [
            {
                customerId: alice.customerId,
                transactionType: 'EARN',
                points: 100,
                balanceAfter: 100,
                billAmount: 500.00,
                description: 'Purchase of groceries',
                remainingPoints: 100,
                expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 6)) // 6 months from now
            },
            {
                customerId: alice.customerId,
                transactionType: 'EARN',
                points: 50,
                balanceAfter: 150,
                billAmount: 250.00,
                description: 'Purchase of snacks',
                remainingPoints: 50,
                expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 6))
            },
            {
                customerId: bob.customerId,
                transactionType: 'EARN',
                points: 100,
                balanceAfter: 100,
                billAmount: 1000.00,
                description: 'Festival purchase',
                remainingPoints: 50, // Let's say he redeemed 50 later (simulated below)
                expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 6))
            },
            {
                customerId: bob.customerId,
                transactionType: 'REDEEM',
                points: -50,
                balanceAfter: 50,
                description: 'Redemption at checkout',
            }
        ]
    })

    console.log({ alice, bob, charlie })
    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
