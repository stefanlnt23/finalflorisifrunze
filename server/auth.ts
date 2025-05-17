import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  try {
    // Check if stored password has the expected format
    if (!stored || !stored.includes('.')) {
      console.error('Invalid stored password format:', stored);
      return false;
    }

    const [hashed, salt] = stored.split('.');
    
    if (!hashed || !salt) {
      console.error('Missing hash or salt in stored password');
      return false;
    }

    const hashedBuf = Buffer.from(hashed, 'hex');
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    
    console.log('Comparing password buffers - lengths:', hashedBuf.length, suppliedBuf.length);
    
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
}