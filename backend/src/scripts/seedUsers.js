const { db } = require('../config/firebase');
const User = require('../models/User');
const logger = require('../config/logger');

// Sample users data
const sampleUsers = [
  {
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    fullName: 'Jane Smith',
    email: 'jane.smith@example.com',
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    fullName: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    fullName: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    fullName: 'David Brown',
    email: 'david.brown@example.com',
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    fullName: 'Emily Davis',
    email: 'emily.davis@example.com',
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    fullName: 'Alex Thompson',
    email: 'alex.thompson@example.com',
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    fullName: 'Lisa Anderson',
    email: 'lisa.anderson@example.com',
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    fullName: 'Chris Martinez',
    email: 'chris.martinez@example.com',
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    fullName: 'Rachel Garcia',
    email: 'rachel.garcia@example.com',
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Function to seed users
const seedUsers = async () => {
  try {
    logger.info('Starting user seeding...');
    
    const createdUsers = [];
    
    for (const userData of sampleUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOneByEmail(userData.email);
        
        if (existingUser) {
          logger.info(`User ${userData.email} already exists, skipping...`);
          continue;
        }
        
        // Create new user
        const user = new User(userData);
        const savedUser = await user.save();
        
        createdUsers.push(savedUser);
        logger.info(`Created user: ${userData.email} (ID: ${savedUser.id})`);
        
      } catch (error) {
        logger.error(`Failed to create user ${userData.email}:`, error.message);
      }
    }
    
    logger.info(`User seeding completed! Created ${createdUsers.length} new users.`);
    
    // Log summary
    if (createdUsers.length > 0) {
      logger.info('Created users:');
      createdUsers.forEach(user => {
        logger.info(`- ${user.fullName} (${user.email})`);
      });
    }
    
    return createdUsers;
    
  } catch (error) {
    logger.error('Error during user seeding:', error);
    throw error;
  }
};

// Function to clear all users (use with caution)
const clearUsers = async () => {
  try {
    logger.warn('Clearing all users from database...');
    
    const usersRef = db.collection('users');
    const snapshot = await usersRef.get();
    
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    logger.info(`Cleared ${snapshot.docs.length} users from database.`);
    
  } catch (error) {
    logger.error('Error clearing users:', error);
    throw error;
  }
};

// Function to list all users
const listUsers = async () => {
  try {
    logger.info('Listing all users...');
    
    const usersRef = db.collection('users');
    const snapshot = await usersRef.get();
    
    if (snapshot.empty) {
      logger.info('No users found in database.');
      return [];
    }
    
    const users = [];
    snapshot.forEach(doc => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    logger.info(`Found ${users.length} users:`);
    users.forEach(user => {
      logger.info(`- ${user.fullName} (${user.email}) - ID: ${user.id}`);
    });
    
    return users;
    
  } catch (error) {
    logger.error('Error listing users:', error);
    throw error;
  }
};

// Main execution
const main = async () => {
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'seed':
        await seedUsers();
        break;
      case 'clear':
        await clearUsers();
        break;
      case 'list':
        await listUsers();
        break;
      default:
        logger.info('Usage: node seedUsers.js [seed|clear|list]');
        logger.info('  seed  - Add sample users to database');
        logger.info('  clear - Remove all users from database (use with caution)');
        logger.info('  list  - List all users in database');
        break;
    }
  } catch (error) {
    logger.error('Script execution failed:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  seedUsers,
  clearUsers,
  listUsers,
};
