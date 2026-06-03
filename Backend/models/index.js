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

export const User = mongoose.model('User', userSchema);
export const Medicine = mongoose.model('Medicine', medicineSchema);
export const Cart = mongoose.model('Cart', cartSchema);
export const Order = mongoose.model('Order', orderSchema);
export const Session = mongoose.model('Session', sessionSchema);
export const Prescription = mongoose.model('Prescription', prescriptionSchema);
export const Notification = mongoose.model('Notification', notificationSchema);
export const WarehouseAdmin = mongoose.model('WarehouseAdmin', warehouseAdminSchema);
export const Stock = mongoose.model('Stock', stockSchema);
