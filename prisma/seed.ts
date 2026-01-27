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

    const expiryDate = new Date(new Date().setMonth(new Date().getMonth() + 6)) // 6 months from now

    // Create Transaction Ledger entries (audit trail)
    await prisma.transactionLedger.createMany({
        data: [
            {
                customerId: alice.customerId,
                transactionType: 'EARN',
                points: 100,
                balanceAfter: 100,
                billAmount: 500.00,
                description: 'Purchase of groceries',
            },
            {
                customerId: alice.customerId,
                transactionType: 'EARN',
                points: 50,
                balanceAfter: 150,
                billAmount: 250.00,
                description: 'Purchase of snacks',
            },
            {
                customerId: bob.customerId,
                transactionType: 'EARN',
                points: 100,
                balanceAfter: 100,
                billAmount: 1000.00,
                description: 'Festival purchase',
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

    // Create Points Buckets (working data for FIFO)
    await prisma.pointsBucket.createMany({
        data: [
            {
                customerId: alice.customerId,
                pointsEarned: 100,
                remainingPoints: 100,
                expiryDate,
            },
            {
                customerId: alice.customerId,
                pointsEarned: 50,
                remainingPoints: 50,
                expiryDate,
            },
            {
                customerId: bob.customerId,
                pointsEarned: 100,
                remainingPoints: 50, // 50 already redeemed
                expiryDate,
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
