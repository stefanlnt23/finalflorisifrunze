import { storage } from '../server/storage';
import { hashPassword } from '../server/auth';
import { connectToMongoDB } from '../server/mongodb';
import * as readline from 'readline';

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to prompt user for input
function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Helper function to prompt for password (hidden input)
function askPassword(question: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(question);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    
    let password = '';
    
    const onData = (char: string) => {
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004': // Ctrl+D
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdin.removeListener('data', onData);
          console.log(''); // New line
          resolve(password);
          break;
        case '\u0003': // Ctrl+C
          process.exit(1);
          break;
        case '\u007f': // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write('\b \b');
          }
          break;
        default:
          password += char;
          process.stdout.write('*');
          break;
      }
    };
    
    process.stdin.on('data', onData);
  });
}

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password strength
function isValidPassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/(?=.*\d)/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  return { valid: true };
}

async function createAdminUser() {
  try {
    console.log('🔐 Admin User Creation Tool');
    console.log('============================\n');
    
    console.log('Connecting to MongoDB...');
    await connectToMongoDB();
    console.log('✅ Connected to database\n');
    
    // Get admin email
    let email: string;
    while (true) {
      email = await askQuestion('Enter admin email: ');
      
      if (!email) {
        console.log('❌ Email cannot be empty. Please try again.\n');
        continue;
      }
      
      if (!isValidEmail(email)) {
        console.log('❌ Invalid email format. Please try again.\n');
        continue;
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        console.log(`❌ User with email ${email} already exists. Please use a different email.\n`);
        continue;
      }
      
      break;
    }
    
    // Get admin name
    const name = await askQuestion('Enter admin name (or press Enter for default): ') || 'Admin User';
    
    // Get admin password
    let password: string;
    while (true) {
      password = await askPassword('Enter admin password: ');
      
      if (!password) {
        console.log('❌ Password cannot be empty. Please try again.\n');
        continue;
      }
      
      const passwordValidation = isValidPassword(password);
      if (!passwordValidation.valid) {
        console.log(`❌ ${passwordValidation.message}. Please try again.\n`);
        continue;
      }
      
      const confirmPassword = await askPassword('Confirm admin password: ');
      
      if (password !== confirmPassword) {
        console.log('❌ Passwords do not match. Please try again.\n');
        continue;
      }
      
      break;
    }
    
    console.log('\n🔄 Creating admin user...');
    
    // Hash the password
    const hashedPassword = await hashPassword(password);
    
    // Create admin user
    const adminUser = {
      name,
      email,
      username: `admin_${Date.now()}`,
      password: hashedPassword,
      role: 'admin' as const,
    };
    
    await storage.createUser(adminUser);
    
    console.log('\n✅ Admin user created successfully!');
    console.log('====================================');
    console.log(`📧 Email: ${email}`);
    console.log(`👤 Name: ${name}`);
    console.log(`🔑 Password: [Hidden for security]`);
    console.log('\n🚀 You can now login at: http://localhost:5000/admin/login');
    
  } catch (error) {
    console.error('\n❌ Error creating admin user:', error);
  } finally {
    rl.close();
    process.exit(0);
  }
}

createAdminUser();
