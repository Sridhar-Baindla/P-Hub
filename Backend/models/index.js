import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'user' }
});

const medicineSchema = new mongoose.Schema({
  name: String,
  description: String,
  manufacturer: String,
  price: Number,
  discountedPrice: Number,
  expiryDate: String,
  category: String,
  image: String,
  inStock: Boolean,
  boxNumber: String
});

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
  quantity: Number
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: Array,
  totalAmount: Number,
  shippingAddress: String,
  contactNumber: String,
  paymentMethod: String,
  paymentStatus: String,
  status: String,
  orderDate: String,
  transactionId: String,
  otp: String,
  deliveryStatus: String
});

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deviceId: String,
  lastActive: String
});

const prescriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerName: String,
  phone: String,
  address: String,
  fileName: String,
  uploadedAt: String,
  status: { type: String, default: 'pending' }
});

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: String,
  read: { type: Boolean, default: false },
  createdAt: String
});

const warehouseAdminSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  location: String
});

const stockSchema = new mongoose.Schema({
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
  location: String,
  quantity: Number
});

const warehouseDataSchema = new mongoose.Schema({
  moduleName: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  location: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const invoiceSchema = new mongoose.Schema({
  invoiceNo: { type: String, required: true, unique: true },
  customerName: String,
  customerPhone: String,
  items: Array,
  subtotal: Number,
  totalGst: Number,
  totalDiscount: Number,
  netPayable: Number,
  paymentMode: String,
  status: { type: String, default: 'Paid' },
  location: String,
  createdAt: { type: Date, default: Date.now }
});


const purchaseOrderSchema = new mongoose.Schema({
  poNumber: { type: String, required: true, unique: true },
  supplierName: String,
  items: Array,
  totalAmount: Number,
  invoiceFile: String,
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

const distributorSchema = new mongoose.Schema({
  name: String,
  gstin: String,
  phone: String,
  outstanding: { type: Number, default: 0 },
  creditLimit: { type: Number, default: 50000 },
  lastPayment: String,
  createdAt: { type: Date, default: Date.now }
});

const customerSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  name: String,
  totalVisits: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  loyaltyPoints: { type: Number, default: 0 },
  lastVisit: String,
  createdAt: { type: Date, default: Date.now }
});

const journalEntrySchema = new mongoose.Schema({
  date: String,
  ref: String,
  accountHead: String,
  type: String, // 'Debit' or 'Credit'
  amount: Number,
  category: String, // 'Income', 'Expense', 'Asset', 'Liability'
  createdAt: { type: Date, default: Date.now }
});


const storeSchema = new mongoose.Schema({
  name: String,
  type: String,
  status: String,
  staffCount: Number,
  location: String
});

const auditLogSchema = new mongoose.Schema({
  action: String,
  user: String,
  details: String,
  ip: String,
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', userSchema);
export const Medicine = mongoose.model('Medicine', medicineSchema);
export const Cart = mongoose.model('Cart', cartSchema);
export const Order = mongoose.model('Order', orderSchema);
export const Session = mongoose.model('Session', sessionSchema);
export const Prescription = mongoose.model('Prescription', prescriptionSchema);
export const Notification = mongoose.model('Notification', notificationSchema);
export const WarehouseAdmin = mongoose.model('WarehouseAdmin', warehouseAdminSchema);
export const Stock = mongoose.model('Stock', stockSchema);
export const WarehouseData = mongoose.model('WarehouseData', warehouseDataSchema);
export const Invoice = mongoose.model('Invoice', invoiceSchema);
export const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);
export const Distributor = mongoose.model('Distributor', distributorSchema);
export const Customer = mongoose.model('Customer', customerSchema);
export const JournalEntry = mongoose.model('JournalEntry', journalEntrySchema);
export const Store = mongoose.model('Store', storeSchema);
export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
