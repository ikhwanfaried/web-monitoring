import React, { useState, useEffect } from 'react';

const AddUserPage = () => {
  console.log('AddUserPage component loaded - Sites dropdown should be visible');
  
  const [form, setForm] = useState({
    username: '',
    password: '',
    Nama: '',
    NRP: '',
    Email: '',
    siteid: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [sites, setSites] = useState([]);
  const [sitesLoading, setSitesLoading] = useState(true);

  // Fetch site data
  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      setSitesLoading(true);
      console.log('Fetching sites from API...');
      const response = await fetch('/api/site?page=1&per_page=1000'); // Get all sites
      if (response.ok) {
        const result = await response.json();
        console.log('Sites data received:', result);
        setSites(result.data || []); // Extract data from paginated response
        console.log('Sites set to state:', result.data || []);
      } else {
        console.error('Failed to fetch sites');
      }
    } catch (error) {
      console.error('Error fetching sites:', error);
    } finally {
      setSitesLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setSuccess(true);
        setForm({ username: '', password: '', Nama: '', NRP: '', Email: '', siteid: '' });
      } else {
        const data = await res.json();
        setError(data.message || 'Gagal menambah user');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    }
    setLoading(false);
  };

  const handleBackToDashboard = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-slate-800">
      {/* Fixed Sidebar */}
      <aside className="group fixed left-0 top-0 h-screen w-16 hover:w-80 bg-cyan-900/90 backdrop-blur border-r border-cyan-500 text-white flex flex-col transition-all duration-300 ease-in-out z-50">
        <div className="p-4 group-hover:p-6">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-cyan-400 group-hover:text-3xl transition-all duration-300">S</h1>
            <span className="ml-2 text-xl font-bold text-cyan-400 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-150">IMTELOG</span>
          </div>
        </div>
        
        {/* Menu Navigation */}
        <nav className="flex-1 px-2 group-hover:px-6 transition-all duration-300">
          <div className="space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊', href: '/' },
              { id: 'gudang', label: 'Gudang', icon: '🏢', href: '/' },
              { id: 'transaksi', label: 'Transaksi', icon: '💳', href: '/' },
              { id: 'add-user', label: 'Tambah User', icon: '👤', href: '/add-user' }
            ].map(menu => (
              <button
                key={menu.id}
                onClick={() => window.location.href = menu.href}
                className={`w-full flex items-center space-x-3 px-2 group-hover:px-4 py-3 rounded-lg transition-all duration-300 text-left relative ${
                  menu.id === 'add-user'
                    ? 'bg-cyan-500 text-white'
                    : 'text-cyan-300 hover:bg-cyan-800/50 hover:text-cyan-100'
                }`}
                title={menu.label}
              >
                <span className="text-xl min-w-[24px] flex justify-center">{menu.icon}</span>
                <span className="font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 delay-150 whitespace-nowrap">
                  {menu.label}
                </span>
              </button>
            ))}
          </div>
        </nav>
        
        {/* Back to Dashboard button */}
        <div className="p-2 group-hover:p-6 border-t border-cyan-500 transition-all duration-300">
          <button
            onClick={handleBackToDashboard}
            className="w-full bg-cyan-500 hover:bg-cyan-400 px-2 group-hover:px-4 py-2 rounded transition-all duration-300 flex items-center justify-center group-hover:justify-start space-x-2"
            title="Back to Dashboard"
          >
            <span className="text-sm">🏠</span>
            <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 delay-150 text-sm font-medium">
              Dashboard
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-16 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
            <h2 className="text-3xl font-bold mb-8 text-blue-700 text-center">Tambah User Baru</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <input 
                    type="text" 
                    name="username" 
                    value={form.username} 
                    onChange={handleChange} 
                    required 
                    className="w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors" 
                    placeholder="Masukkan username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input 
                    type="password" 
                    name="password" 
                    value={form.password} 
                    onChange={handleChange} 
                    required 
                    className="w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors" 
                    placeholder="Masukkan password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama</label>
                  <input 
                    type="text" 
                    name="Nama" 
                    value={form.Nama} 
                    onChange={handleChange} 
                    required 
                    className="w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors" 
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">NRP</label>
                  <input 
                    type="text" 
                    name="NRP" 
                    value={form.NRP} 
                    onChange={handleChange} 
                    required 
                    className="w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors" 
                    placeholder="Masukkan NRP"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input 
                    type="email" 
                    name="Email" 
                    value={form.Email} 
                    onChange={handleChange} 
                    required 
                    className="w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors" 
                    placeholder="Masukkan email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Site</label>
                  {sitesLoading ? (
                    <div className="w-full px-4 py-3 rounded-md border-gray-300 shadow-sm bg-gray-50 text-gray-500">
                      Memuat data site...
                    </div>
                  ) : (
                    <select
                      name="siteid"
                      value={form.siteid}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors bg-white"
                    >
                      <option value="">Pilih Site</option>
                      {sites.map((site) => (
                        <option key={site.id} value={site.id}>
                          {site.siteid}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
              
              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full py-3 px-6 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 disabled:bg-blue-400 transition-colors duration-200 text-lg"
                >
                  {loading ? 'Menyimpan...' : 'Tambah User'}
                </button>
              </div>
              
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-green-400 text-xl">✅</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        User berhasil ditambahkan!
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-red-400 text-xl">❌</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUserPage;
