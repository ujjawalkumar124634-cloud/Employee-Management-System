import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Users, LayoutDashboard, Plus, Pencil, Trash2, ArrowLeft, 
  Shield, User, LogOut, Package, DollarSign, Settings
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || '';

const fetchJson = async (url, options = {}) => {
  const response = await fetch(`${API_BASE}${url}`, options);
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;
  if (!response.ok) {
    throw new Error(data?.error || `Server returned ${response.status}`);
  }
  return data;
};

/* =========================================
   REUSABLE UI COMPONENTS
========================================= */
const Footer = () => (
  <footer className="glass-panel" style={{ padding: '1rem', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)', zIndex: 10, position: 'relative' }}>
    <div style={{ display: 'flex', gap: '1rem' }}>
      <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</a>
      <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</a>
      <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Help Center</a>
    </div>
    <div>&copy; {new Date().getFullYear()} EmpManage Inc. All rights reserved.</div>
  </footer>
);

/* =========================================
   LOGIN / SIGNUP SLIDE
========================================= */
const LoginSlide = ({ onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isSignup ? '/api/signup' : '/api/login';

    try {
      const data = await fetchJson(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      onLogin(data.token, data.user);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', marginBottom: '2rem' }}
      >
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', background: 'linear-gradient(to right, #6366f1, #10b981)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
          EmpManage System
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
          {isSignup ? "Create a new account" : "Sign in to continue"}
        </p>
      </motion.div>

      <motion.form 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="glass-panel" 
        style={{ padding: '3rem', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        onSubmit={handleAuth}
      >
        {error && <div style={{ color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)', padding: '0.8rem', borderRadius: '8px', fontSize: '0.9rem' }}>{error}</div>}
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Email</label>
          <input className="input-field" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Password</label>
          <input className="input-field" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', padding: '0.8rem' }}>
          {isSignup ? "Sign Up" : "Login"}
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <span 
            style={{ color: 'var(--accent-hover)', cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => setIsSignup(!isSignup)}
          >
            {isSignup ? "Log In" : "Sign Up"}
          </span>
        </p>
      </motion.form>
    </div>
  );
};

/* =========================================
   PRODUCTS SLIDES
========================================= */
const ProductListSlide = ({ token, isAdmin, onAdd, onEdit }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const data = await fetchJson('/api/products');
      setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await fetchJson(`/api/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      fetchProducts();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem' }}>Product Catalog</h1>
        {isAdmin && <button className="btn btn-primary" onClick={onAdd}><Plus size={18} /> Add Product</button>}
      </div>
      
      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>
      ) : products.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>No products found.</div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem', alignContent: 'start', paddingRight: '0.5rem' }}>
          <AnimatePresence>
            {products.map(prod => (
              <motion.div key={prod.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.3rem' }}>{prod.name}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.8rem' }}>{prod.description}</p>
                  <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--accent-hover)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><DollarSign size={16}/> {prod.price.toFixed(2)}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Package size={16}/> Stock: {prod.stock}</span>
                  </div>
                </div>
                {isAdmin && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-glass)' }}>
                    <button className="btn" style={{ flex: 1, padding: '0.4rem' }} onClick={() => onEdit(prod)}><Pencil size={16} /> Edit</button>
                    <button className="btn" style={{ flex: 1, padding: '0.4rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={() => handleDelete(prod.id)}><Trash2 size={16} /> Delete</button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

const ProductFormSlide = ({ initialData, token, onSave, onCancel }) => {
  const [formData, setFormData] = useState(initialData || { name: '', description: '', price: '', stock: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEditing = !!initialData;
    const url = isEditing ? `/api/products/${initialData.id}` : '/api/products';
    const method = isEditing ? 'PUT' : 'POST';
    try {
      await fetchJson(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...formData, price: Number(formData.price), stock: Number(formData.stock) }) });
      onSave(); 
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="glass-panel page-card form-panel" style={{ padding: '2rem', height: '100%', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button className="btn" onClick={onCancel} style={{ padding: '0.5rem' }}><ArrowLeft size={20} /></button>
        <h1 style={{ fontSize: '1.8rem' }}>{initialData ? 'Edit Product' : 'Add New Product'}</h1>
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', flex: 1 }}>
        <div><label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Product Name</label><input className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>
        <div><label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Description</label><textarea className="input-field" style={{ minHeight: '100px', resize: 'vertical' }} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required /></div>
        <div style={{ display: 'flex', gap: '1rem' }}><div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Price ($)</label><input className="input-field" type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required /></div><div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Stock</label><input className="input-field" type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} required /></div></div>
        <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn btn-primary">{initialData ? 'Save Changes' : 'Create Product'}</button>
        </div>
      </form>
    </div>
  );
};

/* =========================================
   EMPLOYEES SLIDES
========================================= */
const EmployeeListSlide = ({ token, isAdmin, onAdd, onEdit }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async () => {
    try {
      const data = await fetchJson('/api/employees');
      setEmployees(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await fetchJson(`/api/employees/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      fetchEmployees();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem' }}>Employee Directory</h1>
        {isAdmin && <button className="btn btn-primary" onClick={onAdd}><Plus size={18} /> Add Employee</button>}
      </div>
      
      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>
      ) : employees.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>No employees found.</div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem', alignContent: 'start', paddingRight: '0.5rem' }}>
          <AnimatePresence>
            {employees.map(emp => (
              <motion.div key={emp.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', flexShrink: 0 }}>
                  {emp.name.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.name}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>{emp.role}</p>
                  <p style={{ color: 'var(--accent-hover)', fontSize: '0.8rem', marginBottom: '0.2rem' }}>{emp.department}</p>
                  <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Salary: ₹{emp.salary ?? '—'}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Days Worked: {emp.daysWorked ?? '—'}</span>
                  </div>
                </div>
                {isAdmin && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button className="btn" style={{ padding: '0.4rem', background: 'rgba(255,255,255,0.05)' }} onClick={() => onEdit(emp)} title="Edit"><Pencil size={16} /></button>
                    <button className="btn" style={{ padding: '0.4rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={() => handleDelete(emp.id)} title="Delete"><Trash2 size={16} /></button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

const EmployeeFormSlide = ({ initialData, token, onSave, onCancel }) => {
  const [formData, setFormData] = useState(initialData || { name: '', email: '', role: '', department: '', salary: '', daysWorked: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEditing = !!initialData;
    const url = isEditing ? `/api/employees/${initialData.id}` : '/api/employees';
    const method = isEditing ? 'PUT' : 'POST';
    try {
      await fetchJson(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({
        ...formData,
        salary: Number(formData.salary),
        daysWorked: Number(formData.daysWorked)
      }) });
      onSave(); 
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="glass-panel page-card form-panel" style={{ padding: '2rem', height: '100%', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button className="btn" onClick={onCancel} style={{ padding: '0.5rem' }}><ArrowLeft size={20} /></button>
        <h1 style={{ fontSize: '1.8rem' }}>{initialData ? 'Edit Employee' : 'Add New Employee'}</h1>
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', flex: 1 }}>
        <div><label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Full Name</label><input className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>
        <div><label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Email Address</label><input className="input-field" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required /></div>
        <div><label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Role</label><input className="input-field" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} required /></div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Department</label>
          <select className="input-field" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} style={{ background: '#1a1a1e' }} required>
            <option value="" disabled>Select Department</option>
            <option value="Engineering">Engineering</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
            <option value="HR">HR</option>
            <option value="Sales">Sales</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Salary</label>
            <input className="input-field" type="number" step="0.01" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} required />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Days Worked</label>
            <input className="input-field" type="number" value={formData.daysWorked} onChange={e => setFormData({...formData, daysWorked: e.target.value})} required />
          </div>
        </div>
        <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn btn-primary">{initialData ? 'Save Changes' : 'Create Employee'}</button>
        </div>
      </form>
    </div>
  );
};


/* =========================================
   USERS SLIDES (Admin Only)
========================================= */
const UserListSlide = ({ token, onAdd, onEdit }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const data = await fetchJson('/api/users', { headers: { Authorization: `Bearer ${token}` } });
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await fetchJson(`/api/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      fetchUsers();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem' }}>User Management</h1>
        <button className="btn btn-primary" onClick={onAdd}><Plus size={18} /> Add User</button>
      </div>
      
      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>
      ) : users.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>No users found.</div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem', alignContent: 'start', paddingRight: '0.5rem' }}>
          <AnimatePresence>
            {users.map(user => (
              <motion.div key={user.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.3rem' }}>{user.email}</h3>
                  <p style={{ color: 'var(--accent-hover)', fontSize: '0.9rem' }}>Role: {user.role}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-glass)' }}>
                  <button className="btn" style={{ flex: 1, padding: '0.4rem' }} onClick={() => onEdit(user)}><Pencil size={16} /> Edit</button>
                  <button className="btn" style={{ flex: 1, padding: '0.4rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={() => handleDelete(user.id)}><Trash2 size={16} /> Delete</button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

const UserFormSlide = ({ initialData, token, onSave, onCancel }) => {
  const [formData, setFormData] = useState(initialData || { email: '', password: '', role: 'client' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEditing = !!initialData;
    const url = isEditing ? `/api/users/${initialData.id}` : '/api/users';
    const method = isEditing ? 'PUT' : 'POST';
    try {
      await fetchJson(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(formData) });
      onSave(); 
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="glass-panel page-card form-panel" style={{ padding: '2rem', height: '100%', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button className="btn" onClick={onCancel} style={{ padding: '0.5rem' }}><ArrowLeft size={20} /></button>
        <h1 style={{ fontSize: '1.8rem' }}>{initialData ? 'Edit User' : 'Add New User'}</h1>
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', flex: 1 }}>
        <div><label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Email</label><input className="input-field" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required /></div>
        <div><label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Password</label><input className="input-field" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required={!initialData} /></div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Role</label>
          <select className="input-field" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} required>
            <option value="client">Client</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn btn-primary">{initialData ? 'Save Changes' : 'Create User'}</button>
        </div>
      </form>
    </div>
  );
};
const AdminDashboardSlide = () => {
  const [employeeCount, setEmployeeCount] = useState(0);
  const [recentHires, setRecentHires] = useState(0);

  useEffect(() => {
    fetchJson('/api/employees').then(data => {
      setEmployeeCount(data.length);
      setRecentHires(data.slice(-3).length);
    }).catch(console.error);
  }, []);

  return (
    <div className="glass-panel" style={{ padding: '2rem', height: '100%', width: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <p style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', fontWeight: '600' }}>Employee Management</p>
          <h1 style={{ fontSize: '2.5rem' }}>Team Control Center</h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '560px', marginTop: '0.5rem' }}>Track employees, review active teams, and manage hiring from a single clean dashboard.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Total Employees</p>
          <h2 style={{ fontSize: '2.5rem', margin: 0 }}>{employeeCount}</h2>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>New Hires (Last 3)</p>
          <h2 style={{ fontSize: '2.5rem', margin: 0 }}>{recentHires}</h2>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Portal status</p>
          <h2 style={{ fontSize: '2.5rem', margin: 0, color: 'var(--success)' }}>Online</h2>
        </div>
      </div>
    </div>
  );
};

const AdminAnalyticsSlide = () => (
  <div className="glass-panel" style={{ padding: '2rem', height: '100%', width: '100%', overflowY: 'auto' }}>
    <div style={{ marginBottom: '1.5rem' }}>
      <h1 style={{ fontSize: '2.2rem' }}>People Insights</h1>
      <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Team trends, employee activity, and hiring signals for your organization.</p>
    </div>
    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Active Employees</p>
        <h2 style={{ fontSize: '2rem', marginTop: '0.5rem' }}>24</h2>
      </div>
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>New Employees This Week</p>
        <h2 style={{ fontSize: '2rem', marginTop: '0.5rem' }}>3</h2>
      </div>
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Pending Approvals</p>
        <h2 style={{ fontSize: '2rem', marginTop: '0.5rem' }}>1</h2>
      </div>
    </div>
  </div>
);

const SettingsSlide = () => (
  <div className="glass-panel" style={{ padding: '2rem', height: '100%', width: '100%', overflowY: 'auto' }}>
    <h1 style={{ fontSize: '2rem', marginBottom: '1.25rem' }}>Settings</h1>
    <div style={{ display: 'grid', gap: '1rem' }}>
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '0.75rem' }}>Portal Preferences</h3>
        <p style={{ color: 'var(--text-secondary)' }}>Set your experience preferences and control admin notifications.</p>
      </div>
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '0.75rem' }}>Connection Status</h3>
        <p style={{ color: 'var(--text-secondary)' }}>Backend: connected</p>
      </div>
    </div>
  </div>
);

const ClientDashboardSlide = ({ user }) => (
  <div className="profile-grid">
    <div className="profile-welcome-card">
      <p className="eyebrow">Client Dashboard</p>
      <h2>Welcome back, {user?.email}</h2>
      <p className="profile-description">Your customized events, requests, and profile summary are visible here.</p>
    </div>

    <div className="stats-card">
      <div>
        <p className="eyebrow">Active Requests</p>
        <h3>2</h3>
      </div>
      <div>
        <p className="eyebrow">Portal Status</p>
        <h3 className="status-online">Online</h3>
      </div>
    </div>
  </div>
);

const ProfileSlide = () => {
  const profileFields = [
    { label: 'Legal Name', value: 'Ujjawal Kumar' },
    { label: 'Work Email', value: 'ujjawal@empmanage.com' },
    { label: 'Emergency Contact', value: 'Primary Contact - +1 555-0198' }
  ];

  return (
    <div className="profile-card">
      <div className="profile-detail-list">
        {profileFields.map((field) => (
          <div key={field.label} className="profile-item">
            <p className="profile-item-label">{field.label}</p>
            <p className="profile-item-value">{field.value}</p>
          </div>
        ))}
      </div>
      <button className="btn btn-primary profile-action">Request Information Update</button>
    </div>
  );
};

/* =========================================
   MAIN APP ORCHESTRATOR
========================================= */
export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [currentSlide, setCurrentSlide] = useState('dashboard');
  
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    const saved = window.localStorage.getItem('empmanage-auth');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.token && parsed?.user) {
          setToken(parsed.token);
          setUser(parsed.user);
        }
      } catch (error) {
        window.localStorage.removeItem('empmanage-auth');
      }
    }
  }, []);

  const handleLoginSuccess = (jwt, userData) => {
    setToken(jwt);
    setUser(userData);
    setCurrentSlide(userData.role === 'client' ? 'profile' : 'dashboard');
    window.localStorage.setItem('empmanage-auth', JSON.stringify({ token: jwt, user: userData }));
  };

  useEffect(() => {
    if (user) {
      setCurrentSlide(user.role === 'client' ? 'profile' : 'dashboard');
    }
  }, [user]);

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setCurrentSlide('dashboard');
    window.localStorage.removeItem('empmanage-auth');
  };

  /* ACTIONS */
  const handleAddProduct = () => { setEditingProduct(null); setCurrentSlide('productForm'); };
  const handleEditProduct = (prod) => { setEditingProduct(prod); setCurrentSlide('productForm'); };
  const handleAddEmployee = () => { setEditingEmployee(null); setCurrentSlide('employeeForm'); };
  const handleEditEmployee = (emp) => { setEditingEmployee(emp); setCurrentSlide('employeeForm'); };
  const handleAddUser = () => { setEditingUser(null); setCurrentSlide('userForm'); };
  const handleEditUser = (user) => { setEditingUser(user); setCurrentSlide('userForm'); };

  /* SLIDE CONFIGURATIONS */
  const adminSlides = [
    { id: 'dashboard', component: <AdminDashboardSlide />, icon: <LayoutDashboard size={20} />, label: 'Dashboard', showInNav: true, title: 'Team Dashboard' },
    { id: 'users', component: <UserListSlide token={token} onAdd={handleAddUser} onEdit={handleEditUser} />, icon: <Shield size={20} />, label: 'Users', showInNav: true, title: 'User Management' },
    { id: 'employees', component: <EmployeeListSlide token={token} isAdmin={true} onAdd={handleAddEmployee} onEdit={handleEditEmployee} />, icon: <Users size={20} />, label: 'Directory', showInNav: true, title: 'Employee Directory' },
    { id: 'analytics', component: <AdminAnalyticsSlide />, icon: <Package size={20} />, label: 'Insights', showInNav: true, title: 'People Insights' },
    { id: 'settings', component: <SettingsSlide />, icon: <Settings size={20} />, label: 'Settings', showInNav: true, title: 'Settings' },
    { id: 'employeeForm', component: <EmployeeFormSlide token={token} initialData={editingEmployee} onSave={() => setCurrentSlide('employees')} onCancel={() => setCurrentSlide('employees')} />, icon: null, label: 'Add Employee', showInNav: false, title: 'Add Employee' },
    { id: 'userForm', component: <UserFormSlide token={token} initialData={editingUser} onSave={() => setCurrentSlide('users')} onCancel={() => setCurrentSlide('users')} />, icon: null, label: 'Add User', showInNav: false, title: 'Add User' },
  ];

  const clientSlides = [
    { id: 'dashboard', component: <ClientDashboardSlide user={user} />, icon: <LayoutDashboard size={20} />, label: 'Dashboard', title: 'My Dashboard', showInNav: true },
    { id: 'profile', component: <ProfileSlide />, icon: <User size={20} />, label: 'My Profile', title: 'My Profile Details', showInNav: true },
  ];

  const activeSlidesArray = user?.role === 'admin' ? adminSlides : clientSlides;
  const navSlides = activeSlidesArray.filter(slide => slide.showInNav);
  const activeSlide = activeSlidesArray.find(slide => slide.id === currentSlide) || activeSlidesArray[0] || navSlides[0];

  return (
    <div style={{ width: '100vw', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          {!token ? (
            <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.5 }} style={{ position: 'absolute', inset: 0, zIndex: 100 }}>
              <LoginSlide onLogin={handleLoginSuccess} />
            </motion.div>
          ) : (
            <motion.div key="appLayout" initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.55 }} style={{ display: 'flex', height: '100%', width: '100%', padding: '1rem 1.25rem' }}>
              <aside className="glass-panel sidebar-panel">
                <div className="sidebar-top">
                  <div className="sidebar-title">
                    <span>{user?.role === 'admin' ? 'A' : 'C'}</span>
                    {user?.role === 'admin' ? 'Admin Portal' : 'Client Portal'}
                  </div>
                  <p className="sidebar-subtitle">Welcome back, {user.email}</p>
                </div>

                <nav className="sidebar-nav">
                  {navSlides.map((slide) => (
                    <button
                      key={slide.id}
                      onClick={() => setCurrentSlide(slide.id)}
                      className="sidebar-nav-button"
                      data-active={currentSlide === slide.id}
                    >
                      {slide.icon}
                      <span>{slide.label}</span>
                    </button>
                  ))}
                </nav>

                <div className="sidebar-footer">
                  <button onClick={handleLogout} className="sidebar-nav-button logout-button">
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              </aside>

              <main className="main-panel">
                <div className="content-card">
                  <div className="page-header">
                    <h1 className="page-title">{activeSlide.title || activeSlide.label}</h1>
                  </div>

                  <div className="page-body">
                    {activeSlide.component}
                  </div>
                </div>
              </main>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
