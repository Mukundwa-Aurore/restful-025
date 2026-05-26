import bcrypt from 'bcryptjs';

const password = 'password123';
const saltRounds = 10;

const hash = bcrypt.hashSync(password, saltRounds);
console.log('Password hash for "password123":');
console.log(hash);
