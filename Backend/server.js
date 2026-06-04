import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import * as models from './models/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'phub_secure_secret_key_2026';

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Debug Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method === 'POST') {
    console.log('Body:', req.body);
  }
  next();
});

import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!mongoUri) {
  const mongoServer = await MongoMemoryServer.create();
  mongoUri = mongoServer.getUri();
  console.log("No MONGO_URI provided. Started in-memory MongoDB at " + mongoUri);
}

// Box Number Generator Helper
const generateBoxNumber = async (medicineName) => {
  if (!medicineName) return 'A1';
  const firstLetter = medicineName.charAt(0).toUpperCase();
  const letter = /^[A-Z]$/.test(firstLetter) ? firstLetter : 'A';
  
  const meds = await models.Medicine.find({ boxNumber: new RegExp(`^${letter}`) });
  let maxNum = 0;
  for (const m of meds) {
    if (m.boxNumber) {
      const numPart = parseInt(m.boxNumber.substring(1));
      if (!isNaN(numPart) && numPart > maxNum) {
        maxNum = numPart;
      }
    }
  }
  return `${letter}${maxNum + 1}`;
};

try {
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    maxPoolSize: 50,
    family: 4 // Use IPv4, skip trying IPv6 which causes timeouts on some networks
  });
  console.log("MongoDB Connected");
  
  try {
    const count = await models.User.countDocuments();
    if (count === 0 && fs.existsSync(path.resolve(__dirname, '../Database/db.json'))) {
      const dbData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../Database/db.json'), 'utf8'));
      if (dbData.users) {
        for (const u of dbData.users) {
          const hashedPassword = await bcrypt.hash(u.password, 10);
          await models.User.create({ name: u.name, email: u.email, password: hashedPassword, role: u.role || 'user' });
        }
      }
      if (dbData.warehouseAdmins) {
        for (const admin of dbData.warehouseAdmins) {
          const hashedPassword = await bcrypt.hash(admin.password, 10);
          await models.WarehouseAdmin.create({ name: admin.name, email: admin.email, password: hashedPassword, location: admin.location });
        }
      }
      console.log("Seeded database from db.json");
    }
    
    // Auto-backfill box numbers for existing medicines that lack one
    const unboxedMedicines = await models.Medicine.find({ $or: [{ boxNumber: { $exists: false } }, { boxNumber: null }] });
    if (unboxedMedicines.length > 0) {
      for (const med of unboxedMedicines) {
        med.boxNumber = await generateBoxNumber(med.name);
        await med.save();
      }
      console.log(`Backfilled box numbers for ${unboxedMedicines.length} existing medicines.`);
    }
  } catch(e) { console.error("Seeding error:", e); }
} catch (err) {
  console.error("MongoDB Connection Error:", err);
  process.exit(1);
}

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token.' });
    req.user = user;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Admin role required.' });
  }
};

const isWarehouseOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'warehouse_manager')) {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Authorized role required.' });
  }
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new models.User({ name, email, password: hashedPassword, role: role || 'user' });
    await user.save();
    
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '365d' });
    res.json({ token, user: { id: user._id, name, email, role: user.role } });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'Email already exists.' });
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await models.User.findOne({ email });
    if (user) {
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) return res.status(400).json({ error: 'Invalid email or password.' });
      
      const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '365d' });
      return res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    }

    let admin = await models.WarehouseAdmin.findOne({ email });
    if (admin) {
      const validPassword = await bcrypt.compare(password, admin.password);
      if (!validPassword) return res.status(400).json({ error: 'Invalid email or password.' });
      
      const role = 'warehouse_manager';
      const token = jwt.sign({ id: admin._id, email: admin.email, role }, JWT_SECRET, { expiresIn: '365d' });
      
      return res.json({ token, user: { id: admin._id, name: admin.name, email: admin.email, role, location: admin.location } });
    }

    return res.status(400).json({ error: 'Invalid email or password.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Stock Routes
app.get('/api/stock', async (req, res) => {
  try {
    const { location } = req.query;
    let query = {};
    if (location) query.location = location;
    
    const stocks = await models.Stock.find(query).populate('medicineId');
    const rows = stocks.map(s => {
      const m = s.medicineId;
      return {
        id: s._id,
        medicineId: m ? m._id : null,
        location: s.location,
        quantity: s.quantity,
        name: m?.name,
        image: m?.image,
        manufacturer: m?.manufacturer,
        category: m?.category,
        price: m?.price,
        discountedPrice: m?.discountedPrice,
        description: m?.description,
        expiryDate: m?.expiryDate,
        boxNumber: m?.boxNumber
      };
    });
    res.json(rows);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/stock', authenticateToken, isWarehouseOrAdmin, async (req, res) => {
  try {
    const stock = new models.Stock(req.body);
    await stock.save();
    res.json({ id: stock._id, ...req.body });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/stock/:id', authenticateToken, isWarehouseOrAdmin, async (req, res) => {
  try {
    await models.Stock.findByIdAndUpdate(req.params.id, { quantity: req.body.quantity });
    res.json({ success: true });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Medicine Routes (Public)
app.get('/api/medicines', async (req, res) => {
  try {
    const { name, category, q } = req.query;
    let filter = {};
    
    if (name || q) {
      const searchTerm = name || q;
      filter.$or = [
        { name: new RegExp(searchTerm, 'i') },
        { description: new RegExp(searchTerm, 'i') }
      ];
    }
    
    if (category && category !== 'All') {
      filter.category = category;
    }
    
    const medicines = await models.Medicine.find(filter).sort({ _id: -1 });
    const medIds = medicines.map(m => m._id);
    
    const stocks = await models.Stock.aggregate([
      { $match: { medicineId: { $in: medIds } } },
      { $group: { _id: "$medicineId", totalStock: { $sum: "$quantity" } } }
    ]);
    
    const stockMap = {};
    stocks.forEach(s => { stockMap[s._id.toString()] = s.totalStock; });
    
    const rows = medicines.map(m => ({
      ...m.toObject(),
      id: m._id,
      totalStock: stockMap[m._id.toString()] || 0
    }));
    
    res.json(rows);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/medicines/:id', async (req, res) => {
  try {
    const med = await models.Medicine.findById(req.params.id);
    if (!med) return res.status(404).json({error: "Not found"});
    res.json({ ...med.toObject(), id: med._id });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Medicine Routes
app.post('/api/medicines', authenticateToken, isAdmin, async (req, res) => {
  try {
    const boxNumber = await generateBoxNumber(req.body.name);
    const med = new models.Medicine({ ...req.body, boxNumber });
    await med.save();
    res.json({ id: med._id, ...req.body, boxNumber });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/medicines/:id', authenticateToken, isWarehouseOrAdmin, async (req, res) => {
  try {
    const { salt, id, ...updateData } = req.body;
    if (Object.keys(updateData).length === 0) return res.json({ success: true, message: 'No fields to update' });
    await models.Medicine.findByIdAndUpdate(req.params.id, updateData);
    res.json({ success: true });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Unified Admin Inventory Route
app.post('/api/admin/add-inventory', authenticateToken, isWarehouseOrAdmin, async (req, res) => {
  try {
    const { medicineId, name, description, manufacturer, price, discountedPrice, expiryDate, category, image, quantity, location } = req.body;
    
    let med;
    if (medicineId) {
      med = await models.Medicine.findById(medicineId);
    } else if (name) {
      med = await models.Medicine.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } });
    }
    
    if (med) {
      if (description) med.description = description;
      if (manufacturer) med.manufacturer = manufacturer;
      if (price !== undefined) med.price = price;
      if (discountedPrice !== undefined) med.discountedPrice = discountedPrice;
      if (expiryDate) med.expiryDate = expiryDate;
      if (category) med.category = category;
      if (image) med.image = image;
      await med.save();
    } else {
      const boxNumber = await generateBoxNumber(name);
      med = new models.Medicine({ name, description, manufacturer, price, discountedPrice, expiryDate, category, image, inStock: true, boxNumber });
      await med.save();
    }
    
    let stock = await models.Stock.findOne({ medicineId: med._id, location });
    if (stock) {
      stock.quantity += (quantity || 0);
      await stock.save();
    } else {
      stock = new models.Stock({ medicineId: med._id, location, quantity: quantity || 0 });
      await stock.save();
    }
    
    res.json({ success: true, medicineId: med._id, stockId: stock._id, message: 'Inventory created successfully' });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/medicines/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    await models.Medicine.findByIdAndDelete(req.params.id);
    await models.Stock.deleteMany({ medicineId: req.params.id });
    res.json({ success: true });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected Cart Routes
app.get('/api/cart', authenticateToken, async (req, res) => {
  try {
    const expand = req.query._expand;
    if (expand === 'medicine') {
      const cart = await models.Cart.find({ userId: req.user.id }).populate('medicineId');
      const transformed = cart.map(r => {
        const m = r.medicineId;
        return {
          id: r._id,
          userId: r.userId,
          medicineId: m ? m._id : null,
          quantity: r.quantity,
          medicine: m ? {
            id: m._id,
            name: m.name,
            price: m.price,
            discountedPrice: m.discountedPrice,
            image: m.image,
            expiryDate: m.expiryDate
          } : null
        };
      });
      return res.json(transformed);
    }
    const cart = await models.Cart.find({ userId: req.user.id });
    res.json(cart.map(c => ({ ...c.toObject(), id: c._id })));
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cart', authenticateToken, async (req, res) => {
  try {
    const { medicineId, quantity } = req.body;
    const userId = req.user.id;
    const cartItem = new models.Cart({ userId, medicineId, quantity });
    await cartItem.save();
    res.json({ id: cartItem._id, userId, medicineId, quantity });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/cart/:id', authenticateToken, async (req, res) => {
  try {
    const { quantity } = req.body;
    await models.Cart.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, { quantity });
    res.json({ success: true });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/cart/:id', authenticateToken, async (req, res) => {
  try {
    await models.Cart.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ success: true });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected Order Routes
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const isWarehouse = req.user.role === 'warehouse_manager';
    let filter = {};
    if (!isAdmin && !isWarehouse) filter.userId = req.user.id;
    const orders = await models.Order.find(filter).sort({ _id: -1 });
    res.json(orders.map(o => ({ ...o.toObject(), id: o._id })));
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Statistics Route
app.get('/api/admin/stats', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Access denied" });
    
    const totalSalesAggr = await models.Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }]);
    const totalSales = totalSalesAggr.length > 0 ? totalSalesAggr[0].total : 0;
    
    const activeOrders = await models.Order.countDocuments();
    const totalPatients = await models.User.countDocuments({ role: 'user' });
    const pendingRx = await models.Prescription.countDocuments({ status: 'pending' });
    
    res.json({ totalSales, activeOrders, totalPatients, pendingRx });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Warehouse Dashboard Stats
app.get('/api/warehouse/dashboard-stats', authenticateToken, isWarehouseOrAdmin, async (req, res) => {
  try {
    const { range } = req.query;
    const location = req.user.location;
    
    const now = new Date();
    let startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    
    if (range === 'Yesterday') {
      startDate.setDate(startDate.getDate() - 1);
      endDate.setDate(endDate.getDate() - 1);
    } else if (range === 'This Week') {
      const day = startDate.getDay();
      const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
      startDate.setDate(diff);
    } else if (range === 'This Month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const startIso = startDate.toISOString();
    const endIso = endDate.toISOString();

    const salesAggr = await models.Invoice.aggregate([
      { $match: { location: location, createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: null, total: { $sum: "$netPayable" } } }
    ]);
    const totalSales = salesAggr.length > 0 ? salesAggr[0].total : 0;
    
    const prescriptionsCount = await models.Prescription.countDocuments({ 
      uploadedAt: { $gte: startIso, $lte: endIso } 
    });

    const lowStockCount = await models.Stock.countDocuments({ location, quantity: { $lt: 10 } });
    
    const newPatients = await models.Customer.countDocuments({ 
      createdAt: { $gte: startDate, $lte: endDate } 
    });

    const hourlyRevenueAggr = await models.Invoice.aggregate([
      { $match: { location: location, createdAt: { $gte: startDate, $lte: endDate } } },
      { 
        $group: { 
          _id: { $hour: "$createdAt" }, 
          total: { $sum: "$netPayable" } 
        } 
      },
      { $sort: { "_id": 1 } }
    ]);
    
    const hourlyRevenue = Array(24).fill(0);
    hourlyRevenueAggr.forEach(item => {
      hourlyRevenue[item._id] = item.total;
    });

    const alerts = [];
    if (lowStockCount > 0) {
      alerts.push({ text: `${lowStockCount} products running low in stock`, type: "error" });
    }
    const pendingPo = await models.PurchaseOrder.countDocuments({ status: "Pending" });
    if (pendingPo > 0) {
      alerts.push({ text: `${pendingPo} pending purchase orders require review`, type: "warning" });
    }
    
    if (alerts.length === 0) {
      alerts.push({ text: "All systems operating normally.", type: "success" });
    }

    res.json({
      totalSales,
      prescriptionsCount,
      lowStockCount,
      newPatients,
      hourlyRevenue,
      alerts
    });
    
  } catch(err) {
    console.error("Dashboard Stats Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Warehouse Dashboard Export Report
app.get('/api/warehouse/export-report', authenticateToken, isWarehouseOrAdmin, async (req, res) => {
  try {
    const { range } = req.query;
    const location = req.user.location;
    
    const now = new Date();
    let startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    
    if (range === 'Yesterday') {
      startDate.setDate(startDate.getDate() - 1);
      endDate.setDate(endDate.getDate() - 1);
    } else if (range === 'This Week') {
      const day = startDate.getDay();
      const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
      startDate.setDate(diff);
    } else if (range === 'This Month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const invoices = await models.Invoice.find({ 
      location: location, 
      createdAt: { $gte: startDate, $lte: endDate } 
    }).sort({ createdAt: -1 });

    // Generate CSV
    let csv = 'Invoice No,Date,Customer,Payment Mode,Subtotal,Discount,GST,Net Payable\n';
    invoices.forEach(inv => {
      const date = new Date(inv.createdAt).toLocaleString();
      const customer = `"${inv.customerName || 'Walk-in'}"`; 
      csv += `${inv.invoiceNo},"${date}",${customer},${inv.paymentMode},${inv.subtotal},${inv.totalDiscount},${inv.totalGst},${inv.netPayable}\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment(`Warehouse_Report_${range.replace(/\s+/g, '_')}.csv`);
    return res.send(csv);
  } catch(err) {
    console.error("Export Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress, contactNumber, paymentMethod, paymentStatus, transactionId: providedTxnId } = req.body;
    const userId = req.user.id;
    const orderDate = new Date().toISOString();
    const transactionId = providedTxnId || ('TXN' + Math.random().toString(36).substring(2, 10).toUpperCase());
    
    const status = (paymentStatus === 'Paid' || paymentMethod === 'COD') ? 'Confirmed' : 'Pending';

    if (items && Array.isArray(items)) {
      for (const item of items) {
        if (item.medicineId && item.quantity) {
          const stock = await models.Stock.findOne({ medicineId: item.medicineId }).sort({ quantity: -1 });
          if (stock) {
            stock.quantity = Math.max(0, stock.quantity - item.quantity);
            await stock.save();
          }
        }
      }
    }

    const order = new models.Order({ userId, items, totalAmount, shippingAddress, contactNumber, paymentMethod, paymentStatus, status, orderDate, transactionId });
    await order.save();
    
    // Trigger real-time dashboard update
    try { io.emit('dashboard_update'); } catch(e) {}
    
    res.json({ id: order._id, transactionId, status });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/orders/:id/status', authenticateToken, async (req, res) => {
  try {
    const { deliveryStatus } = req.body;
    if (!deliveryStatus) return res.status(400).json({ error: "deliveryStatus is required" });

    const order = await models.Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    order.deliveryStatus = deliveryStatus;
    await order.save();
    
    const notif = new models.Notification({ 
      userId: order.userId, 
      message: `Your order #${req.params.id} is now: ${deliveryStatus}.`, 
      createdAt: new Date().toISOString() 
    });
    await notif.save();
    
    res.json({ message: "Status updated successfully", deliveryStatus });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders/:id/approve', authenticateToken, async (req, res) => {
  try {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const order = await models.Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    order.otp = otp;
    order.deliveryStatus = 'Approved';
    await order.save();
    
    const notif = new models.Notification({ 
      userId: order.userId, 
      message: `Your order #${req.params.id} has been approved. Your delivery OTP is: ${otp}. Please share this with the delivery partner.`, 
      createdAt: new Date().toISOString() 
    });
    await notif.save();
    
    res.json({ success: true, message: "Order approved and OTP sent to customer." });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders/:id/verify-otp', authenticateToken, async (req, res) => {
  try {
    const { otp, skipOTP } = req.body;
    const isAuthorized = req.user.role === 'warehouse_manager' || req.user.role === 'admin';

    const order = await models.Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    
    if (order.otp === otp || (skipOTP && isAuthorized)) {
      order.deliveryStatus = 'Delivered';
      await order.save();
      res.json({ success: true });
    } else {
      res.status(400).json({ error: "Invalid OTP" });
    }
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Prescription Routes
app.get('/api/prescriptions', async (req, res) => {
  try {
    const rows = await models.Prescription.find().sort({ _id: -1 });
    res.json(rows.map(r => ({ ...r.toObject(), id: r._id })));
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/prescriptions', async (req, res) => {
  try {
    const { userId, customerName, phone, address, fileName } = req.body;
    const uploadedAt = new Date().toISOString();
    const rx = new models.Prescription({ userId, customerName, phone, address, fileName, uploadedAt });
    await rx.save();
    res.json({ id: rx._id, ...req.body, uploadedAt });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Notifications Routes
app.get('/api/notifications', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId required" });
    
    const rows = await models.Notification.find({ userId }).sort({ _id: -1 });
    res.json(rows.map(r => ({ ...r.toObject(), id: r._id })));
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/notifications/:id', async (req, res) => {
  try {
    const { read } = req.body;
    await models.Notification.findByIdAndUpdate(req.params.id, { read: read ? true : false });
    res.json({ success: true });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Warehouse Admin Routes
app.get('/api/warehouseAdmins', async (req, res) => {
  try {
    const rows = await models.WarehouseAdmin.find();
    res.json(rows.map(r => ({ ...r.toObject(), id: r._id })));
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/warehouseAdmins', async (req, res) => {
  try {
    const { name, email, password, location } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new models.WarehouseAdmin({ name, email, password: hashedPassword, location });
    await admin.save();
    res.json({ id: admin._id, name, email, location });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/warehouseAdmins/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    await models.WarehouseAdmin.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Warehouse Auth
app.post('/api/auth/warehouse/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await models.WarehouseAdmin.findOne({ email });
    if (!admin) return res.status(400).json({ error: "Warehouse access denied: Incorrect email" });

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) return res.status(400).json({ error: "Warehouse access denied: Incorrect password" });

    const token = jwt.sign({ id: admin._id, email: admin.email, role: 'warehouse_manager' }, JWT_SECRET, { expiresIn: '365d' });
    res.json({ token, admin: { id: admin._id, name: admin.name, email: admin.email, location: admin.location, role: 'warehouse_manager' } });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Phase 2: Supply Chain Routes
app.get('/api/distributors', authenticateToken, isWarehouseOrAdmin, async (req, res) => {
  try {
    const rows = await models.Distributor.find().sort({ createdAt: -1 });
    res.json(rows.map(r => ({ ...r.toObject(), id: r._id })));
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/distributors', authenticateToken, isWarehouseOrAdmin, async (req, res) => {
  try {
    const distributor = new models.Distributor(req.body);
    await distributor.save();
    res.json({ id: distributor._id, ...distributor.toObject() });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/distributors/:id/settle', authenticateToken, isWarehouseOrAdmin, async (req, res) => {
  try {
    const { amount } = req.body;
    const distributor = await models.Distributor.findById(req.params.id);
    if (distributor) {
      distributor.outstanding = Math.max(0, distributor.outstanding - amount);
      distributor.lastPayment = new Date().toISOString().split('T')[0];
      await distributor.save();
      res.json({ success: true, outstanding: distributor.outstanding });
    } else {
      res.status(404).json({ error: "Distributor not found" });
    }
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/purchases', authenticateToken, isWarehouseOrAdmin, async (req, res) => {
  try {
    const rows = await models.PurchaseOrder.find().sort({ createdAt: -1 });
    res.json(rows.map(r => ({ ...r.toObject(), id: r._id })));
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/purchases', authenticateToken, isWarehouseOrAdmin, async (req, res) => {
  try {
    const { supplierName, items, totalAmount, invoiceFile } = req.body;
    const poNumber = 'PO-' + Math.floor(100000 + Math.random() * 900000);
    const po = new models.PurchaseOrder({ poNumber, supplierName, items, totalAmount, invoiceFile, status: 'Verified' });
    await po.save();
    
    // Add to stock
    if (items && Array.isArray(items)) {
      for (const item of items) {
        if (item.medicineId && item.qty) {
          const stock = await models.Stock.findOne({ medicineId: item.medicineId, location: req.user.location });
          if (stock) {
            stock.quantity += item.qty;
            await stock.save();
          } else {
            const newStock = new models.Stock({ medicineId: item.medicineId, location: req.user.location, quantity: item.qty });
            await newStock.save();
          }
        }
      }
    }

    // Update Distributor Payable
    const distributor = await models.Distributor.findOne({ name: supplierName });
    if (distributor) {
      distributor.outstanding += totalAmount;
      await distributor.save();
    }

    // Phase 3: Accounting - Log Purchase Expense
    const journalEntry = new models.JournalEntry({
      date: new Date().toISOString().split('T')[0],
      ref: poNumber,
      accountHead: 'Purchases (Stock)',
      type: 'Debit',
      amount: totalAmount,
      category: 'Expense'
    });
    await journalEntry.save();

    // Emit live events for real-time dashboard and inventory sync across POS and Customer views
    try { 
      io.emit('inventory_update'); 
      io.emit('dashboard_update'); 
    } catch(e) {}

    res.json({ success: true, po: po._id });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// POS Sales Checkout
app.post('/api/sales/checkout', authenticateToken, isWarehouseOrAdmin, async (req, res) => {
  try {
    const { invoiceNo, customerName, customerPhone, items, subtotal, totalGst, totalDiscount, netPayable, paymentMode } = req.body;
    
    // Deduct stock
    if (items && Array.isArray(items)) {
      for (const item of items) {
        if (item.medicineId && item.qty) {
          const stock = await models.Stock.findOne({ medicineId: item.medicineId, location: req.user.location }).sort({ quantity: -1 });
          if (stock) {
            stock.quantity = Math.max(0, stock.quantity - item.qty);
            await stock.save();
          }
        }
      }
    }

    const invoice = new models.Invoice({
      invoiceNo, customerName, customerPhone, items, subtotal, totalGst, totalDiscount, netPayable, paymentMode, location: req.user.location
    });
    await invoice.save();
    
    // Phase 3: CRM Update
    if (customerPhone && customerPhone.trim() !== '') {
      let customer = await models.Customer.findOne({ phone: customerPhone });
      if (!customer) {
        customer = new models.Customer({ phone: customerPhone, name: customerName, totalVisits: 1, totalSpent: netPayable, loyaltyPoints: Math.floor(netPayable * 0.05), lastVisit: new Date().toISOString().split('T')[0] });
      } else {
        customer.totalVisits += 1;
        customer.totalSpent += netPayable;
        customer.loyaltyPoints += Math.floor(netPayable * 0.05);
        customer.lastVisit = new Date().toISOString().split('T')[0];
        if (customerName && customerName !== 'Guest Customer') customer.name = customerName;
      }
      await customer.save();
    }

    // Phase 3: Accounting - Log Sales Income
    const head = paymentMode === 'Cash' ? 'Cash Sales (POS)' : (paymentMode === 'Credit' ? 'Credit Sales' : 'UPI/Card Sales');
    const journalEntry = new models.JournalEntry({
      date: new Date().toISOString().split('T')[0],
      ref: invoiceNo,
      accountHead: head,
      type: 'Credit',
      amount: netPayable,
      category: 'Income'
    });
    await journalEntry.save();

    // Trigger real-time dashboard update
    try { io.emit('dashboard_update'); } catch(e) {}

    res.json({ success: true, invoice: invoice._id });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Phase 3: CRM and Accounting Routes
app.get('/api/customers', authenticateToken, isWarehouseOrAdmin, async (req, res) => {
  try {
    const rows = await models.Customer.find().sort({ lastVisit: -1 });
    res.json(rows.map(r => ({ ...r.toObject(), id: r._id })));
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/journal', authenticateToken, isWarehouseOrAdmin, async (req, res) => {
  try {
    const rows = await models.JournalEntry.find().sort({ createdAt: -1 });
    res.json(rows.map(r => ({ ...r.toObject(), id: r._id })));
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/journal', authenticateToken, isWarehouseOrAdmin, async (req, res) => {
  try {
    const entry = new models.JournalEntry(req.body);
    await entry.save();
    res.json({ id: entry._id, ...entry.toObject() });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Payment Verification Simulation
app.post('/api/payments/verify', authenticateToken, (req, res) => {
  const { amount, method } = req.body;
  setTimeout(() => {
    const success = Math.random() > 0.05; 
    if (success) {
      const gatewayToken = jwt.sign({ amount, status: 'success' }, JWT_SECRET, { expiresIn: '5m' });
      res.json({ success: true, gatewayToken });
    } else {
      res.status(402).json({ success: false, error: 'Payment declined by gateway.' });
    }
  }, 2000);
});

// Generalized Warehouse Data Routes for dynamic modules
app.get('/api/warehouse-data/:moduleName', authenticateToken, isWarehouseOrAdmin, async (req, res) => {
  try {
    const { moduleName } = req.params;
    const { location } = req.query; // optional filtering by location
    
    let query = { moduleName };
    if (location) query.location = location;
    
    const rows = await models.WarehouseData.find(query).sort({ createdAt: -1 });
    res.json(rows.map(r => ({ ...r.toObject(), id: r._id })));
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/warehouse-data/:moduleName', authenticateToken, isWarehouseOrAdmin, async (req, res) => {
  try {
    const { moduleName } = req.params;
    const { data, location } = req.body;
    
    const newRecord = new models.WarehouseData({
      moduleName,
      data,
      location: location || req.user.location
    });
    
    await newRecord.save();
    res.json({ id: newRecord._id, ...newRecord.toObject() });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/warehouse-data/:moduleName/:id', authenticateToken, isWarehouseOrAdmin, async (req, res) => {
  try {
    const { data } = req.body;
    const updated = await models.WarehouseData.findByIdAndUpdate(
      req.params.id, 
      { data, updatedAt: Date.now() }, 
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Record not found" });
    res.json({ id: updated._id, ...updated.toObject() });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/warehouse-data/:moduleName/:id', authenticateToken, isWarehouseOrAdmin, async (req, res) => {
  try {
    const deleted = await models.WarehouseData.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Record not found" });
    res.json({ success: true });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Session Management
app.get('/api/sessions', async (req, res) => {
  try {
    const { userId, deviceId } = req.query;
    let query = { userId };
    if (deviceId) query.deviceId = deviceId;
    
    const rows = await models.Session.find(query);
    res.json(rows.map(r => ({ ...r.toObject(), id: r._id })));
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/sessions', async (req, res) => {
  try {
    const { userId, deviceId, lastActive } = req.body;
    const session = new models.Session({ userId, deviceId, lastActive });
    await session.save();
    res.json({ id: session._id });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/sessions/:id', async (req, res) => {
  try {
    await models.Session.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Explicit API 404 Handler
app.use((req, res, next) => {
  const apiPrefixes = ['/api'];
  if (apiPrefixes.some(prefix => req.url.startsWith(prefix))) {
    return res.status(404).json({ error: `API endpoint not found or method not allowed: ${req.method} ${req.url}` });
  }
  next();
});

// Serve static files in production
const distPath = path.resolve(__dirname, '../Frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.log("No dist folder found. Static files will not be served.");
}

// Endpoint for mobile phone to trigger payment success
app.post('/api/payments/simulate-webhook', (req, res) => {
  const { txnId, status } = req.body;
  if (!txnId) return res.status(400).json({ error: "txnId required" });
  
  io.to(`payment_${txnId}`).emit('payment_status', { txnId, status });
  res.json({ success: true });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  socket.on('join_payment_room', (txnId) => {
    socket.join(`payment_${txnId}`);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Professional Secure Server running at http://0.0.0.0:${PORT}`);
});
