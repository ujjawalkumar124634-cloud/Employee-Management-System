const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://ujjawalxrajput_db_user:v4TuLAL53j72OvtT@cluster0.vnlszo9.mongodb.net/';

mongoose.set('strictQuery', true);

const jsonTransform = {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
};

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'client' }
});
UserSchema.set('toJSON', jsonTransform);

const ProductSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  stock: Number
});
ProductSchema.set('toJSON', jsonTransform);

const EmployeeSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  department: String
});
EmployeeSchema.set('toJSON', jsonTransform);

const User = mongoose.model('User', UserSchema);
const Product = mongoose.model('Product', ProductSchema);
const Employee = mongoose.model('Employee', EmployeeSchema);

const seedDatabase = async () => {
  // Clean up any old users without email
  await User.deleteMany({ email: { $exists: false } });
  
  const adminCount = await User.countDocuments({ role: 'admin' });
  if (adminCount === 0) {
    await User.create({ email: 'admin@empmanage.com', password: 'admin123', role: 'admin' });
    console.log('Created default admin user (admin@empmanage.com/admin123)');
  }

  await User.updateMany({ email: /admin/i }, { $set: { role: 'admin' } });

  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    await Product.create([
      { name: 'Ergonomic Chair', description: 'Comfortable office chair', price: 199.99, stock: 50 },
      { name: 'Mechanical Keyboard', description: 'RGB Cherry MX Blue', price: 120.00, stock: 30 },
      { name: 'HD Monitor', description: '27 inch 4K display', price: 350.00, stock: 20 }
    ]);
    console.log('Seeded sample products');
  }

  const employeeCount = await Employee.countDocuments();
  if (employeeCount === 0) {
    await Employee.create([
      { name: 'Ujjawal Kumar', email: 'ujjawal@example.com', role: 'Senior Frontend Engineer', department: 'Engineering' },
      { name: 'Sarah Chen', email: 'sarah@example.com', role: 'Product Designer', department: 'Design' }
    ]);
    console.log('Seeded sample employees');
  }
};

const connectToDb = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      family: 4
    });
    console.log('Connected to MongoDB Atlas successfully.');
    
    // Drop old username index if it exists
    try {
      await User.collection.dropIndex('username_1');
      console.log('Dropped old username index.');
    } catch (e) {
      // Index might not exist, that's fine
    }
    
    await seedDatabase();
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
    throw err;
  }
};

module.exports = {
  User,
  Product,
  Employee,
  connectToDb
};
