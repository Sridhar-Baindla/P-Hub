import bcrypt from 'bcryptjs';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../phub.db');

async function fix() {
    const password = 'Sridhar@5121';
    const email = 'sridharshetty282002@gmail.com';
    const hash = await bcrypt.hash(password, 10);
    console.log('Password:', password);
    console.log('Hash:', hash);
    
    const isMatch = await bcrypt.compare(password, hash);
    console.log('Verification Match:', isMatch);

    if (isMatch) {
        const db = new sqlite3.Database(dbPath);
        db.run('UPDATE warehouseAdmins SET password = ? WHERE email = ?', [hash, email], (err) => {
            if (err) console.error(err);
            else console.log('Database updated successfully');
            db.close();
        });
    } else {
        console.error('Verification failed! Not updating database.');
    }
}

fix();
