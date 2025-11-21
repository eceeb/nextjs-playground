import './init-db.js';
import { createUser, verifyUserPassword } from '../src/lib/user';

async function run() {
  const username = 'tester';
  const email = 'tester@example.com';
  const password = 'GeheimesPasswort123';
  try {
    const user = await createUser(username, email, password);
    console.log('User angelegt:', { id: user.id, username: user.username, email: user.email });
    const verified = await verifyUserPassword(email, password);
    console.log('Passwort verifiziert:', !!verified);
  } catch (e:any) {
    console.error('Fehler:', e.message);
  }
}

run();
