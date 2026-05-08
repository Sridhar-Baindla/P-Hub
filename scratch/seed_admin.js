import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../phub.db');
const db = new sqlite3.Database(dbPath);

const seedAdmin = async () => {
  const hashedPassword = await bcrypt.hash('AdminPassword123!', 10);
  db.run("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", 
    ['System Admin', 'admin@phub.com', hashedPassword, 'admin'], 
    (err) => {
      if (err) console.error(err.message);
      else console.log('Admin user seeded: admin@phub.com / AdminPassword123!');
      db.close();
    }
  );
};

seedAdmin();
