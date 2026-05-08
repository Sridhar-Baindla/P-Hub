import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('phub.db');
db.all("PRAGMA table_info(medicines)", (err, rows) => {
  console.log(rows);
  db.close();
});
