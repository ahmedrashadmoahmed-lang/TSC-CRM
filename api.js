// frontend/js/api.js - المحدث
class MuhasebyProAPI {
  constructor() {
    // في ملف api.js، غير هذا السطر:
// للبحث عن منفذ متاح تلقائياً
// في ملف api.js
// في ملف api.js، غير هذا السطر:
// في ملف frontend/js/api.js تأكد من:
this.baseURL = 'http://localhost:5003/api';  // يجب أن يكون 5003

// أو استخدام دالة للعثور على منفذ متاح
function findAvailablePort(startPort) {
  return new Promise((resolve) => {
    const server = require('http').createServer();
    server.listen(startPort, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    server.on('error', () => resolve(findAvailablePort(startPort + 1)));
  });
}

// استخدامها
findAvailablePort(5002).then(port => {
  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
});
    this.token = localStorage.getItem('muhasebypro_token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('muhasebypro_token', token);
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async request(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const config = {
        headers: this.getHeaders(),
        ...options
      };

      const response = await fetch(url, config);
      
      if (response.status === 401) {
        this.handleUnauthorized();
        return null;
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'حدث خطأ في الاتصال');
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  handleUnauthorized() {
    localStorage.removeItem('muhasebypro_token');
    localStorage.removeItem('muhasebypro_user');
    window.location.href = '/login.html';
  }

  // اختبار الاتصال بالخادم
  async healthCheck() {
    return this.request('/health');
  }

  // المصادقة
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async login(credentials) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    
    if (data && data.token) {
      this.setToken(data.token);
      localStorage.setItem('muhasebypro_user', JSON.stringify(data.user));
    }
    
    return data;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // العملاء
  async getCustomers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/customers?${queryString}`);
  }

  async createCustomer(customerData) {
    return this.request('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData)
    });
  }

  async updateCustomer(id, customerData) {
    return this.request(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customerData)
    });
  }

  async deleteCustomer(id) {
    return this.request(`/customers/${id}`, {
      method: 'DELETE'
    });
  }

  // المنتجات
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/products?${queryString}`);
  }

  async createProduct(productData) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  }

  async updateProduct(id, productData) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  }

  // الفواتير
  async getInvoices(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/invoices?${queryString}`);
  }

  async createInvoice(invoiceData) {
    return this.request('/invoices', {
      method: 'POST',
      body: JSON.stringify(invoiceData)
    });
  }

  async payInvoice(id, paymentData) {
    return this.request(`/invoices/${id}/pay`, {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  }

  // التقارير
  async getDashboardOverview() {
    return this.request('/reports/dashboard');
  }

  async getSalesReport(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/reports/sales?${queryString}`);
  }
}

// إنشاء instance عام للـ API
window.muhasebyProAPI = new MuhasebyProAPI();