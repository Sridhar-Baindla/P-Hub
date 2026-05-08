import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('phub.db');

db.serialize(() => {
  db.run("INSERT INTO medicines (name, description, manufacturer, price, category, inStock) VALUES ('Test Medicine', 'Test Desc', 'Test Brand', 100, 'General', 1)", function(err) {
    if (err) return console.error(err);
    const medId = this.lastID;
    db.run("INSERT INTO stock (medicineId, location, quantity) VALUES (?, 'Mumbai Main', 50)", [medId], function(err) {
      if (err) return console.error(err);
      console.log('Successfully added medicine and stock');
      
      db.all("SELECT m.name, COALESCE(SUM(s.quantity), 0) as totalStock FROM medicines m LEFT JOIN stock s ON m.id = s.medicineId WHERE m.id = ? GROUP BY m.id", [medId], (err, rows) => {
        console.log('Customer side view:', rows);
        
        db.all("SELECT s.*, m.name FROM stock s JOIN medicines m ON s.medicineId = m.id WHERE s.medicineId = ?", [medId], (err, rows) => {
          console.log('Warehouse side view:', rows);
          db.close();
        });
      });
    });
  });
});
