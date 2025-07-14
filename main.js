document.addEventListener('DOMContentLoaded', () => {
        // --- DOM Elements ---
        const authSection = document.getElementById('auth-section');
        const loginFormContainer = document.getElementById('login-form-container');
        const registerFormContainer = document.getElementById('register-form-container');
        const dashboardSection = document.getElementById('dashboard-section');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const loginError = document.getElementById('login-error');
        const registerError = document.getElementById('register-error');
        const logoutButton = document.getElementById('logout-button');
        const showRegisterLink = document.getElementById('show-register-link');
        const showLoginLink = document.getElementById('show-login-link');
        let salesChart;
        let isInitialized = false;

        // --- MOCK DATABASE (Replaces Google Sheets API for immediate functionality) ---
        const mockDatabase = {
            Users: [
                { name: "Admin User", email: "admin@aura.com", password: "123" }
            ],
            Products: [
                { name: 'Glow Dew Moisturizer', price: '45.00', stock: '150' },
                { name: 'Vitamin C Serum', price: '32.50', stock: '80' },
                { name: 'Hydrating Cleanser', price: '25.00', stock: '200' },
                { name: 'Night Repair Cream', price: '55.00', stock: '0' },
                { name: 'Rosewater Face Mist', price: '18.00', stock: '300' },
            ],
            Orders: [
                { order_id: '#AURA-001', customer_name: 'Jane Cooper', total: '78.00', status: 'Paid', date: '2024-07-12' },
                { order_id: '#AURA-002', customer_name: 'John Smith', total: '25.50', status: 'Pending', date: '2024-07-11' },
                { order_id: '#AURA-003', customer_name: 'Emily White', total: '120.00', status: 'Paid', date: '2024-06-25' },
            ],
            Customers: [
                 { name: 'Jane Cooper', email: 'jane.c@example.com', join_date: '2024-01-15' },
                 { name: 'John Smith', email: 'john.s@example.com', join_date: '2024-02-20' },
                 { name: 'Emily White', email: 'emily.w@example.com', join_date: '2024-03-10' },
            ]
        };

        // --- AUTH LOGIC ---
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginFormContainer.classList.add('hidden');
            registerFormContainer.classList.remove('hidden');
        });

        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            registerFormContainer.classList.add('hidden');
            loginFormContainer.classList.remove('hidden');
        });

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            loginError.classList.add('hidden');
            const email = e.target.email.value;
            const password = e.target.password.value;
            const button = e.target.querySelector('button[type="submit"]');
            
            showLoader(button, true);

            // Simulate network delay
            setTimeout(() => {
                let userToLogin = null;

                // Allow login without credentials for guest access
                if (email === '' && password === '') {
                    userToLogin = { name: "Guest User" };
                } else {
                    userToLogin = mockDatabase.Users.find(user => user.email.toLowerCase() === email.toLowerCase());
                    if (!userToLogin || userToLogin.password !== password) {
                        userToLogin = null; // Invalid credentials
                    }
                }

                if (userToLogin) {
                    authSection.classList.add('hidden');
                    dashboardSection.classList.remove('hidden');
                    initializeApp(userToLogin);
                } else {
                    loginError.textContent = 'Invalid email or password.';
                    loginError.classList.remove('hidden');
                }
                showLoader(button, false);
            }, 500);
        });

        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            registerError.classList.add('hidden');
            const email = e.target.email.value;
            const button = e.target.querySelector('button[type="submit"]');

            showLoader(button, true);

            // Simulate network delay
            setTimeout(() => {
                if (mockDatabase.Users.find(user => user.email.toLowerCase() === email.toLowerCase())) {
                    registerError.textContent = 'This email is already registered.';
                    registerError.classList.remove('hidden');
                } else {
                    const newUser = {
                        name: e.target.name.value,
                        email: email,
                        password: e.target.password.value,
                    };
                    mockDatabase.Users.push(newUser);
                    alert('Registration successful! Please log in.');
                    showLoginLink.click();
                    registerForm.reset();
                }
                showLoader(button, false);
            }, 500);
        });

        logoutButton.addEventListener('click', () => {
            if (window.confirm('Are you sure you want to log out?')) {
                dashboardSection.classList.add('hidden');
                authSection.classList.remove('hidden');
                
                // Reset both forms and error messages
                loginForm.reset();
                registerForm.reset();
                loginError.classList.add('hidden');
                registerError.classList.add('hidden');

                // Ensure login form is the one showing
                loginFormContainer.classList.remove('hidden');
                registerFormContainer.classList.add('hidden');
                
                if(salesChart) {
                    salesChart.destroy();
                    salesChart = null;
                }
                isInitialized = false; // Reset initialization flag
            }
        });

        function showLoader(button, show) {
            const btnText = button.querySelector('.btn-text');
            const loader = button.querySelector('.loader');
            if (show) {
                btnText.classList.add('hidden');
                loader.classList.remove('hidden');
                button.disabled = true;
            } else {
                btnText.classList.remove('hidden');
                loader.classList.add('hidden');
                button.disabled = false;
            }
        }

        // --- Dashboard Initialization ---
        function initializeApp(loggedInUser) {
            if (isInitialized) return; // Prevent re-initialization
            isInitialized = true;

            document.getElementById('admin-name').textContent = loggedInUser.name;
            
            const sidebarLinks = document.querySelectorAll('.sidebar-link');
            const pages = document.querySelectorAll('.page');
            sidebarLinks.forEach(link => {
                link.addEventListener('click', () => {
                    const pageId = link.getAttribute('data-page');
                    if (!pageId) return;
                    sidebarLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                    pages.forEach(page => {
                        if (page) {
                           page.id === `${pageId}-page` ? page.classList.remove('hidden') : page.classList.add('hidden');
                        }
                    });
                });
            });

            function updateDateTime() {
                const dateElement = document.getElementById('current-date');
                const timeElement = document.getElementById('current-time');
                if (!dateElement || !timeElement) return;
                const now = new Date();
                dateElement.textContent = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                timeElement.textContent = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
            }
            updateDateTime();
            setInterval(updateDateTime, 60000);
            
            function renderProducts(products) {
                 const container = document.getElementById('products-table-container');
                 if (!container) return;
                 if (!products || products.length === 0) {
                    container.innerHTML = `<p class="text-center text-gray-500 py-8">No products found.</p>`;
                    return;
                 }
                 const table = `
                    <table class="w-full text-left">
                        <thead><tr class="bg-gray-50 border-b"><th class="p-3 text-sm font-semibold tracking-wide">Product Name</th><th class="p-3 text-sm font-semibold tracking-wide text-right">Price</th><th class="p-3 text-sm font-semibold tracking-wide text-right">Stock</th><th class="p-3 text-sm font-semibold tracking-wide text-center">Status</th></tr></thead>
                        <tbody>
                            ${products.map(p => `
                                <tr class="border-b hover:bg-gray-50"><td class="p-3 text-sm text-gray-700 font-medium">${p.name}</td><td class="p-3 text-sm text-gray-700 text-right">$${parseFloat(p.price).toFixed(2)}</td><td class="p-3 text-sm text-gray-700 text-right">${p.stock}</td><td class="p-3 text-sm text-center"><span class="px-2 py-1 text-xs font-medium rounded-full ${parseInt(p.stock) > 0 ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}">${parseInt(p.stock) > 0 ? 'In Stock' : 'Out of Stock'}</span></td></tr>
                            `).join('')}
                        </tbody>
                    </table>`;
                container.innerHTML = table;
            }

            function renderOrders(orders) {
                const container = document.getElementById('orders-table-container');
                if (!container) return;
                if (!orders || orders.length === 0) {
                    container.innerHTML = `<p class="text-center text-gray-500 py-8">No orders to display.</p>`;
                    return;
                }
                const statusColors = {'Paid': 'bg-green-200 text-green-800','Pending': 'bg-yellow-200 text-yellow-800','Cancelled': 'bg-red-200 text-red-800'};
                const table = `
                    <table class="w-full text-left">
                        <thead><tr class="bg-gray-50 border-b"><th class="p-3 text-sm font-semibold tracking-wide">Order ID</th><th class="p-3 text-sm font-semibold tracking-wide">Customer</th><th class="p-3 text-sm font-semibold tracking-wide text-right">Total</th><th class="p-3 text-sm font-semibold tracking-wide text-center">Status</th><th class="p-3 text-sm font-semibold tracking-wide">Date</th></tr></thead>
                        <tbody>
                            ${orders.map(o => `
                                <tr class="border-b hover:bg-gray-50"><td class="p-3 text-sm text-gray-700 font-medium">${o.order_id}</td><td class="p-3 text-sm text-gray-700">${o.customer_name}</td><td class="p-3 text-sm font-medium text-gray-900 text-right">$${parseFloat(o.total).toFixed(2)}</td><td class="p-3 text-sm text-center"><span class="px-2 py-1 text-xs font-medium rounded-full ${statusColors[o.status] || 'bg-gray-200 text-gray-800'}">${o.status}</span></td><td class="p-3 text-sm text-gray-700">${o.date}</td></tr>
                            `).join('')}
                        </tbody>
                    </table>`;
                container.innerHTML = table;
            }

            function renderCustomers(customers) {
                const container = document.getElementById('customers-table-container');
                if (!container) return;
                if (!customers || customers.length === 0) {
                    container.innerHTML = `<p class="text-center text-gray-500 py-8">No customers to display.</p>`;
                    return;
                }
                const table = `
                    <table class="w-full text-left">
                         <thead><tr class="bg-gray-50 border-b"><th class="p-3 text-sm font-semibold tracking-wide">Customer Name</th><th class="p-3 text-sm font-semibold tracking-wide">Email</th><th class="p-3 text-sm font-semibold tracking-wide">Join Date</th></tr></thead>
                        <tbody>
                            ${customers.map(c => `
                                 <tr class="border-b hover:bg-gray-50"><td class="p-3 text-sm text-gray-700 font-medium">${c.name}</td><td class="p-3 text-sm text-gray-700">${c.email}</td><td class="p-3 text-sm text-gray-700">${c.join_date}</td></tr>
                            `).join('')}
                        </tbody>
                    </table>`;
                container.innerHTML = table;
            }

            function setupDashboard(orders, customers, products) {
                if(salesChart) {
                    salesChart.destroy();
                }

                if (orders) {
                    const paidOrders = orders.filter(order => order.status === 'Paid');
                    const totalRevenue = paidOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);
                    document.getElementById('total-revenue').textContent = `$${totalRevenue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                    document.getElementById('total-orders').textContent = orders.length;
                }
                if (customers) {
                    document.getElementById('total-customers').textContent = customers.length;
                }
                if (products) {
                    const inStock = products.reduce((sum, p) => sum + parseInt(p.stock, 10), 0);
                    document.getElementById('products-in-stock').textContent = inStock;
                }
            }
            
            const modal = document.getElementById('product-modal');
            const addProductBtn = document.getElementById('add-product-btn');
            const cancelBtn = document.getElementById('cancel-btn');
            const productForm = document.getElementById('product-form');

            addProductBtn.addEventListener('click', () => modal.classList.remove('hidden'));
            cancelBtn.addEventListener('click', () => modal.classList.add('hidden'));
            
            productForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const newProduct = {
                    name: e.target.name.value,
                    price: e.target.price.value,
                    stock: e.target.stock.value,
                };
                
                mockDatabase.Products.push(newProduct);
                renderProducts(mockDatabase.Products);
                setupDashboard(mockDatabase.Orders, mockDatabase.Customers, mockDatabase.Products);

                alert('Product added!');
                productForm.reset();
                modal.classList.add('hidden');
            });

            function loadInitialData() {
                renderProducts(mockDatabase.Products);
                renderOrders(mockDatabase.Orders);
                renderCustomers(mockDatabase.Customers);
                setupDashboard(mockDatabase.Orders, mockDatabase.Customers, mockDatabase.Products);
            }
            
            loadInitialData();
        }
    });
