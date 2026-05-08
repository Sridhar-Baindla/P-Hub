import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../phub.db');
const db = new sqlite3.Database(dbPath);

console.log('Starting migration to remove salt column...');

db.serialize(() => {
  // 1. Rename existing table
  db.run("ALTER TABLE medicines RENAME TO medicines_old");

  // 2. Create new table without salt
  db.run(`CREATE TABLE medicines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    manufacturer TEXT,
    price REAL,
    discountedPrice REAL,
    expiryDate TEXT,
    category TEXT,
    image TEXT,
    inStock BOOLEAN
  )`);

  // 3. Copy data from old to new (excluding salt)
  db.run(`INSERT INTO medicines (id, name, description, manufacturer, price, discountedPrice, expiryDate, category, image, inStock)
          SELECT id, name, description, manufacturer, price, discountedPrice, expiryDate, category, image, inStock
          FROM medicines_old`);

  // 4. Drop old table
  db.run("DROP TABLE medicines_old", (err) => {
    if (err) {
      console.error('Migration failed:', err.message);
    } else {
      console.log('Migration successful! Salt column removed from database.');
    }
    db.close();
  });
});
