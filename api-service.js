// api-service.js - معدل للاتصال بالـBackend
class MuhasebyProAPI {
    constructor() {
        this.baseURL = 'http://localhost:5002/api';
        this.token = localStorage.getItem('muhaseby_token');
    }

    // طلب عام لجميع الـAPI calls
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { 'Authorization': `Bearer ${this.token}` })
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'خطأ في الاتصال بالخادم');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // المصادقة
    async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    // العملاء
    async getCustomers() {
        return this.request('/customers');
    }

    async createCustomer(customerData) {
        return this.request('/customers', {
            method: 'POST',
            body: JSON.stringify(customerData)
        });
    }

    // الفواتير
    async getInvoices() {
        return this.request('/invoices');
    }

    async createInvoice(invoiceData) {
        return this.request('/invoices', {
            method: 'POST',
            body: JSON.stringify(invoiceData)
        });
    }

    // المنتجات
    async getProducts() {
        return this.request('/products');
    }

    async createProduct(productData) {
        return this.request('/products', {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    }

    // التقارير
    async getReports() {
        return this.request('/reports');
    }
}

// إنشاء instance globally
window.muhasebyAPI = new MuhasebyProAPI();