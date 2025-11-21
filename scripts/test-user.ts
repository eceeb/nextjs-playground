import './init-db.js';
import { createUser, verifyUserPassword } from '../src/lib/user';

async function run() {
  const username = 'tester';
  const email = 'tester@example.com';
  const password = 'SecretPassword123';
  try {
    const user = await createUser(username, email, password);
    console.log('User created:', { id: user.id, username: user.username, email: user.email });
    const verified = await verifyUserPassword(email, password);
    console.log('Password verified:', !!verified);
  } catch (e:any) {
    console.error('Error:', e.message);
  }
}

run();
