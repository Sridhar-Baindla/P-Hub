import fs from 'fs';
import path from 'path';

const content = `import express from 'express';
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
import * as models from './models/index.js';

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
  console.log(\`[\${new Date().toISOString()}] \${req.method} \${req.url}\`);
  if (req.method === 'POST') {
    console.log('Body:', req.body);
  }
  next();
});

mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/phub')
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Connection Error:", err));

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
        expiryDate: m?.expiryDate
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
    const med = new models.Medicine(req.body);
    await med.save();
    res.json({ id: med._id, ...req.body });
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
    const { name, description, manufacturer, price, discountedPrice, expiryDate, category, image, quantity, location } = req.body;
    
    const med = new models.Medicine({ name, description, manufacturer, price, discountedPrice, expiryDate, category, image, inStock: true });
    await med.save();
    
    const stock = new models.Stock({ medicineId: med._id, location, quantity: quantity || 0 });
    await stock.save();
    
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
      message: \`Your order #\${req.params.id} is now: \${deliveryStatus}.\`, 
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
      message: \`Your order #\${req.params.id} has been approved. Your delivery OTP is: \${otp}. Please share this with the delivery partner.\`, 
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
    return res.status(404).json({ error: \`API endpoint not found or method not allowed: \${req.method} \${req.url}\` });
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
  
  io.to(\`payment_\${txnId}\`).emit('payment_status', { txnId, status });
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
    socket.join(\`payment_\${txnId}\`);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(\`Professional Secure Server running at http://0.0.0.0:\${PORT}\`);
});
`;

fs.writeFileSync(path.resolve('./Backend/server.js'), content, 'utf8');
console.log('Successfully generated Backend/server.js');
