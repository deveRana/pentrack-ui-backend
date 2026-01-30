// prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const { users } = require('./user-data');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...\n');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🧹 Cleaning up existing data...');
    await prisma.authAuditLog.deleteMany();
    await prisma.oTPCode.deleteMany();
    await prisma.session.deleteMany();
    await prisma.oAuthProvider.deleteMany();
    await prisma.pentester.deleteMany();
    await prisma.client.deleteMany();
    await prisma.partner.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Cleanup complete\n');

    // Seed Users
    console.log('👥 Seeding users...');
    let seededCount = 0;

    for (const userData of users) {
        try {
            // Extract profile data
            const { clientProfile, partnerProfile, pentesterProfile, ...userDataWithoutProfiles } = userData;

            // Create user
            const user = await prisma.user.create({
                data: userDataWithoutProfiles,
            });

            console.log(`  ✓ Created ${user.role}: ${user.email}`);

            // Create role-specific profiles
            if (clientProfile && user.role === 'CLIENT') {
                await prisma.client.create({
                    data: {
                        userId: user.id,
                        ...clientProfile,
                    },
                });
                console.log(`    → Client profile created`);
            }

            if (partnerProfile && user.role === 'PARTNER') {
                await prisma.partner.create({
                    data: {
                        userId: user.id,
                        ...partnerProfile,
                    },
                });
                console.log(`    → Partner profile created`);
            }

            if (pentesterProfile && user.role === 'PENTESTER') {
                await prisma.pentester.create({
                    data: {
                        userId: user.id,
                        ...pentesterProfile,
                    },
                });
                console.log(`    → Pentester profile created`);
            }

            seededCount++;
        } catch (error) {
            console.error(`  ✗ Failed to create user ${userData.email}:`, error.message);
        }
    }

    console.log(`\n✅ Successfully seeded ${seededCount} users\n`);

    // Summary
    console.log('📊 Database Summary:');
    const userCount = await prisma.user.count();
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    const radminCount = await prisma.user.count({ where: { role: 'R_ADMIN' } });
    const pentesterCount = await prisma.user.count({ where: { role: 'PENTESTER' } });
    const clientCount = await prisma.user.count({ where: { role: 'CLIENT' } });
    const partnerCount = await prisma.user.count({ where: { role: 'PARTNER' } });

    console.log(`  Total Users: ${userCount}`);
    console.log(`  - ADMIN: ${adminCount}`);
    console.log(`  - R_ADMIN: ${radminCount}`);
    console.log(`  - PENTESTER: ${pentesterCount}`);
    console.log(`  - CLIENT: ${clientCount}`);
    console.log(`  - PARTNER: ${partnerCount}`);

    console.log('\n🎉 Seeding completed successfully!\n');

    console.log('📝 Test Credentials:');
    console.log('─────────────────────────────────────────────────────────');
    console.log('ADMIN (OTP Login):');
    console.log('  Email: developerrana0509@gmail.com');
    console.log('  Phone: +919876543210');
    console.log('  Note: Use OTP sent to email for login');
    console.log('');
    console.log('R_ADMIN (OAuth Login):');
    console.log('  Email: nilesh.mankape@rivedix.com');
    console.log('  Note: Use Google OAuth with @rivedix.com email');
    console.log('');
    console.log('PENTESTER (OAuth Login):');
    console.log('  Email: pentester1@rivedix.com');
    console.log('  Note: Use Google OAuth with @rivedix.com email');
    console.log('');
    console.log('CLIENT (OTP Login):');
    console.log('  Email: yograjhukumdar0@gmail.com');
    console.log('  Phone: +919876543215');
    console.log('  Note: Use OTP sent to email for login');
    console.log('');
    console.log('PARTNER (OTP Login):');
    console.log('  Email: partner1@example.com');
    console.log('  Phone: +919876543218');
    console.log('  Note: Use OTP sent to email for login');
    console.log('─────────────────────────────────────────────────────────');
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });