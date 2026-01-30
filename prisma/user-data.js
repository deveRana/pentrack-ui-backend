// prisma/user-data.js

/**
 * Dummy user data for seeding the database
 * Password for OTP users: Not applicable (OTP-based login)
 * OAuth users: Use Google OAuth to login
 */

const { UserRole, AccountStatus } = require('@prisma/client');

const users = [
    // ==========================================
    // ADMIN (Super Admin) - OTP Login
    // ==========================================
    {
        email: 'developerrana0509@gmail.com',
        firstName: 'Rana',
        lastName: 'Developer',
        phone: '+919876543210',
        role: UserRole.ADMIN,
        status: AccountStatus.ACTIVE,
        password: null, // OTP-based login
        companyEmail: null,
        companyDomain: null,
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
    },

    // ==========================================
    // R_ADMIN (Rivedix Admin) - OAuth Login
    // ==========================================
    {
        email: 'nilesh.mankape@rivedix.com',
        firstName: 'Akshay',
        lastName: 'Kondke',
        phone: '+919356560452',
        role: UserRole.R_ADMIN,
        status: AccountStatus.ACTIVE,
        password: null, // OAuth-based login
        companyEmail: 'nilesh.mankape@rivedix.com',
        companyDomain: 'rivedix.com',
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
    },
    {
        email: 'radmin2@rivedix.com',
        firstName: 'Second',
        lastName: 'RAdmin',
        phone: '+919876543212',
        role: UserRole.R_ADMIN,
        status: AccountStatus.ACTIVE,
        password: null,
        companyEmail: 'radmin2@rivedix.com',
        companyDomain: 'rivedix.com',
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
    },

    // ==========================================
    // PENTESTER - OAuth Login
    // ==========================================
    {
        email: 'pentester1@rivedix.com',
        firstName: 'John',
        lastName: 'Pentester',
        phone: '+919876543213',
        role: UserRole.PENTESTER,
        status: AccountStatus.ACTIVE,
        password: null, // OAuth-based login
        companyEmail: 'pentester1@rivedix.com',
        companyDomain: 'rivedix.com',
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
        pentesterProfile: {
            specialization: 'Web Application Security',
            location: 'Mumbai, India',
            bio: 'Experienced pentester specializing in web applications and APIs.',
        },
    },
    {
        email: 'pentester2@rivedix.com',
        firstName: 'Sarah',
        lastName: 'Security',
        phone: '+919876543214',
        role: UserRole.PENTESTER,
        status: AccountStatus.ACTIVE,
        password: null,
        companyEmail: 'pentester2@rivedix.com',
        companyDomain: 'rivedix.com',
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
        pentesterProfile: {
            specialization: 'Network Security',
            location: 'Pune, India',
            bio: 'Network security expert with 5+ years of experience.',
        },
    },

    // ==========================================
    // CLIENT - OTP Login
    // ==========================================
    {
        email: 'client1@example.com',
        firstName: 'Tech',
        lastName: 'Corp',
        phone: '+919876543215',
        role: UserRole.CLIENT,
        status: AccountStatus.ACTIVE,
        password: null, // OTP-based login
        companyEmail: null,
        companyDomain: null,
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
        clientProfile: {
            clientId: 'CLI-001',
            companyName: 'TechCorp India',
            industry: 'Technology',
            address: '123 Tech Park, Bangalore, Karnataka 560001',
            pointOfContact: 'Rajesh Kumar',
            pointOfContactEmail: 'rajesh@techcorp.com',
            pointOfContactPhone: '+919876543215',
            website: 'https://techcorp.com',
            hasPartner: false,
            userType: 'client',
            totalProjects: 5,
            activeProjects: 2,
        },
    },
    {
        email: 'client2@example.com',
        firstName: 'Finance',
        lastName: 'Solutions',
        phone: '+919876543216',
        role: UserRole.CLIENT,
        status: AccountStatus.ACTIVE,
        password: null,
        companyEmail: null,
        companyDomain: null,
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
        clientProfile: {
            clientId: 'CLI-002',
            companyName: 'Finance Solutions Ltd',
            industry: 'Finance',
            address: '456 Business Bay, Mumbai, Maharashtra 400001',
            pointOfContact: 'Priya Sharma',
            pointOfContactEmail: 'priya@financesolutions.com',
            pointOfContactPhone: '+919876543216',
            website: 'https://financesolutions.com',
            hasPartner: true,
            userType: 'client',
            totalProjects: 3,
            activeProjects: 1,
        },
    },
    {
        email: 'client3@example.com',
        firstName: 'Healthcare',
        lastName: 'Systems',
        phone: '+919876543217',
        role: UserRole.CLIENT,
        status: AccountStatus.ACTIVE,
        password: null,
        companyEmail: null,
        companyDomain: null,
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
        clientProfile: {
            clientId: 'CLI-003',
            companyName: 'Healthcare Systems Inc',
            industry: 'Healthcare',
            address: '789 Medical District, Delhi 110001',
            pointOfContact: 'Dr. Amit Patel',
            pointOfContactEmail: 'amit@healthcaresystems.com',
            pointOfContactPhone: '+919876543217',
            website: 'https://healthcaresystems.com',
            hasPartner: false,
            userType: 'client',
            totalProjects: 8,
            activeProjects: 3,
        },
    },

    // ==========================================
    // PARTNER - OTP Login
    // ==========================================
    {
        email: 'partner1@example.com',
        firstName: 'Security',
        lastName: 'Partners',
        phone: '+919876543218',
        role: UserRole.PARTNER,
        status: AccountStatus.ACTIVE,
        password: null, // OTP-based login
        companyEmail: null,
        companyDomain: null,
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
        partnerProfile: {
            companyName: 'Security Partners Pvt Ltd',
            industry: 'Cybersecurity Consulting',
            address: '321 Cyber Hub, Hyderabad, Telangana 500001',
            pointOfContact: 'Vikram Singh',
            pointOfContactEmail: 'vikram@securitypartners.com',
            pointOfContactPhone: '+919876543218',
            website: 'https://securitypartners.com',
            userType: 'partner',
            totalProjects: 12,
            activeProjects: 4,
        },
    },
    {
        email: 'partner2@example.com',
        firstName: 'Digital',
        lastName: 'Shield',
        phone: '+919876543219',
        role: UserRole.PARTNER,
        status: AccountStatus.ACTIVE,
        password: null,
        companyEmail: null,
        companyDomain: null,
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
        partnerProfile: {
            companyName: 'Digital Shield Solutions',
            industry: 'IT Security',
            address: '654 InfoTech Park, Chennai, Tamil Nadu 600001',
            pointOfContact: 'Ananya Reddy',
            pointOfContactEmail: 'ananya@digitalshield.com',
            pointOfContactPhone: '+919876543219',
            website: 'https://digitalshield.com',
            userType: 'partner',
            totalProjects: 7,
            activeProjects: 2,
        },
    },

    // ==========================================
    // INACTIVE/PENDING Users (for testing)
    // ==========================================
    {
        email: 'pending@example.com',
        firstName: 'Pending',
        lastName: 'User',
        phone: '+919876543220',
        role: UserRole.CLIENT,
        status: AccountStatus.PENDING,
        password: null,
        companyEmail: null,
        companyDomain: null,
        isEmailVerified: false,
        emailVerifiedAt: null,
        clientProfile: {
            clientId: 'CLI-004',
            companyName: 'Pending Company',
            industry: 'Testing',
            address: 'Test Address',
            pointOfContact: 'Test Contact',
            pointOfContactEmail: 'test@pending.com',
            pointOfContactPhone: '+919876543220',
            website: null,
            hasPartner: false,
            userType: 'client',
            totalProjects: 0,
            activeProjects: 0,
        },
    },
    {
        email: 'inactive@example.com',
        firstName: 'Inactive',
        lastName: 'User',
        phone: '+919876543221',
        role: UserRole.CLIENT,
        status: AccountStatus.INACTIVE,
        password: null,
        companyEmail: null,
        companyDomain: null,
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
        clientProfile: {
            clientId: 'CLI-005',
            companyName: 'Inactive Company',
            industry: 'Testing',
            address: 'Test Address',
            pointOfContact: 'Test Contact',
            pointOfContactEmail: 'test@inactive.com',
            pointOfContactPhone: '+919876543221',
            website: null,
            hasPartner: false,
            userType: 'client',
            totalProjects: 0,
            activeProjects: 0,
        },
    },
];

module.exports = { users };