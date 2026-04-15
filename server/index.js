const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { User, Product, Employee, connectToDb } = require('./db');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_123';

// Middleware to protect routes that require admin authentication
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== 'admin') {
      return res.status(403).json({ error: 'Operation requires admin privileges' });
    }
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

/* --- AUTHENTICATION --- */
app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ error: 'Email already exists' });

    const role = 'client'; // Always client for signup
    const newUser = await User.create({ email, password, role });
    const token = jwt.sign({ id: newUser._id, email, role }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ token, user: { id: newUser._id, email, role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* --- PRODUCTS --- */
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', authenticateAdmin, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', authenticateAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', authenticateAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* --- EMPLOYEES --- */
app.get('/api/employees', async (req, res) => {
  try {
    const employees = await Employee.find({});
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/employees', authenticateAdmin, async (req, res) => {
  try {
    const employee = await Employee.create(req.body);
    res.status(201).json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/employees/:id', authenticateAdmin, async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/employees/:id', authenticateAdmin, async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json({ message: 'Employee deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* --- USERS (Admin Only) --- */
app.get('/api/users', authenticateAdmin, async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users.map(u => ({ id: u._id, email: u.email, role: u.role })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', authenticateAdmin, async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Email, password, and role required' });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ error: 'Email already exists' });
    const newUser = await User.create({ email, password, role });
    res.status(201).json({ id: newUser._id, email: newUser.email, role: newUser.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id', authenticateAdmin, async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const updateData = {};
    if (email) updateData.email = email;
    if (password) updateData.password = password;
    if (role) updateData.role = role;
    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user._id, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
connectToDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(() => {
    console.error('Server startup aborted due to MongoDB connection error.');
    process.exit(1);
  });
