// Complete JavaScript functionality for the Tailwind Estimator

let settings = {};
let lineItemCounter = 0;
let productCategories = [];
let productSort = { column: 'name', direction: 'asc' };
let editingProductId = null;
let allProducts = [];
let currentPage = 1;
const itemsPerPage = 20;
// Note: allPackages, packageCategories, editingPackageId, currentPackagePage, packagesPerPage, packageSort, packageLineItemCounter
// are declared in packages.js to avoid conflicts

// Global confirmation modal functions
let confirmationCallback = null;

function showConfirmation(message, callback) {
    document.getElementById('confirmationMessage').textContent = message;
    confirmationCallback = callback;
    document.getElementById('confirmationModal').classList.remove('hidden');
}

function closeConfirmationModal() {
    document.getElementById('confirmationModal').classList.add('hidden');
    confirmationCallback = null;
}

function confirmAction() {
    if (confirmationCallback) {
        confirmationCallback();
    }
    closeConfirmationModal();
}

// Global input modal functions
let inputModalCallback = null;
let inputModalValues = {};

function showInputModal(title, fields, callback) {
    document.getElementById('inputModalTitle').textContent = title;
    inputModalCallback = callback;
    inputModalValues = {};
    
    // Create form fields dynamically
    const content = document.getElementById('inputModalContent');
    content.innerHTML = '';
    
    fields.forEach((field, index) => {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'mb-4';
        
        const label = document.createElement('label');
        label.className = 'block text-sm font-medium text-gray-700 mb-2';
        label.textContent = field.label;
        
        const input = document.createElement('input');
        input.type = field.type || 'text';
        input.id = `inputModal_${field.name}`;
        input.value = field.value || '';
        input.placeholder = field.placeholder || '';
        input.className = 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-udora-500 focus:border-transparent';
        
        if (field.required) {
            input.required = true;
        }
        
        fieldDiv.appendChild(label);
        fieldDiv.appendChild(input);
        
        if (field.hint) {
            const hint = document.createElement('small');
            hint.className = 'text-gray-500 text-xs mt-1 block';
            hint.textContent = field.hint;
            fieldDiv.appendChild(hint);
        }
        
        content.appendChild(fieldDiv);
        
        // Focus on first input
        if (index === 0) {
            setTimeout(() => input.focus(), 100);
        }
    });
    
    document.getElementById('inputModal').classList.remove('hidden');
}

function closeInputModal() {
    document.getElementById('inputModal').classList.add('hidden');
    inputModalCallback = null;
    inputModalValues = {};
}

function confirmInputAction() {
    // Collect all input values
    const inputs = document.querySelectorAll('#inputModalContent input');
    const values = {};
    let allValid = true;
    
    inputs.forEach(input => {
        const fieldName = input.id.replace('inputModal_', '');
        values[fieldName] = input.value.trim();
        
        // Check required fields
        if (input.required && !input.value.trim()) {
            allValid = false;
            input.focus();
        }
    });
    
    if (!allValid) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    if (inputModalCallback) {
        inputModalCallback(values);
    }
    closeInputModal();
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => container.removeChild(toast), 500);
  }, 3000);
}

// Global variables for current user
let currentUser = null;
let userDropdownOpen = false;

// Authentication
function showLoginForm() {
  document.getElementById('loginTab').classList.add('bg-white', 'text-udora-600', 'shadow-sm');
  document.getElementById('loginTab').classList.remove('text-gray-500');
  document.getElementById('registerTab').classList.remove('bg-white', 'text-udora-600', 'shadow-sm');
  document.getElementById('registerTab').classList.add('text-gray-500');
  
  document.getElementById('loginForm').classList.remove('hidden');
  document.getElementById('registerForm').classList.add('hidden');
  
  hideAuthMessages();
}

function showRegisterForm() {
  document.getElementById('registerTab').classList.add('bg-white', 'text-udora-600', 'shadow-sm');
  document.getElementById('registerTab').classList.remove('text-gray-500');
  document.getElementById('loginTab').classList.remove('bg-white', 'text-udora-600', 'shadow-sm');
  document.getElementById('loginTab').classList.add('text-gray-500');
  
  document.getElementById('registerForm').classList.remove('hidden');
  document.getElementById('loginForm').classList.add('hidden');
  
  hideAuthMessages();
}

function hideAuthMessages() {
  document.getElementById('authError').classList.add('hidden');
  document.getElementById('authSuccess').classList.add('hidden');
}

function showAuthError(message) {
  document.getElementById('authError').textContent = message;
  document.getElementById('authError').classList.remove('hidden');
  document.getElementById('authSuccess').classList.add('hidden');
}

function showAuthSuccess(message) {
  document.getElementById('authSuccess').textContent = message;
  document.getElementById('authSuccess').classList.remove('hidden');
  document.getElementById('authError').classList.add('hidden');
}

async function login() {
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  
  if (!username || !password) {
    showAuthError('Username and password are required');
    return;
  }

  console.log('Attempting login...');

  try {
    const response = await fetch('api.php?action=login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    console.log('Response status:', response.status);
    const result = await response.json();
    console.log('Response data:', result);

    if (result.success && result.user) {
      currentUser = result.user;
      document.getElementById('loginScreen').classList.add('hidden');
      document.getElementById('mainApp').classList.remove('hidden');
      updateUserDisplay();
      loadSettings();
      loadEstimateHistory();
      showToast(`Welcome back, ${currentUser.first_name || currentUser.username}!`);
    } else {
      showAuthError(result.error || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    showAuthError('Connection error. Please try again.');
  }
}

async function register() {
  const username = document.getElementById('registerUsername').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('registerConfirmPassword').value;
  const firstName = document.getElementById('registerFirstName').value.trim();
  const lastName = document.getElementById('registerLastName').value.trim();
  
  // Validation
  if (!username || !email || !password) {
    showAuthError('Username, email, and password are required');
    return;
  }
  
  if (password !== confirmPassword) {
    showAuthError('Passwords do not match');
    return;
  }
  
  if (password.length < 6) {
    showAuthError('Password must be at least 6 characters long');
    return;
  }

  console.log('Attempting registration...');

  try {
    const response = await fetch('api.php?action=register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username, 
        email, 
        password, 
        first_name: firstName, 
        last_name: lastName 
      })
    });

    const result = await response.json();
    console.log('Registration response:', result);

    if (result.success && result.user) {
      currentUser = result.user;
      document.getElementById('loginScreen').classList.add('hidden');
      document.getElementById('mainApp').classList.remove('hidden');
      updateUserDisplay();
      loadSettings();
      loadEstimateHistory();
      showToast(`Welcome to Udora Safety Estimator, ${currentUser.first_name || currentUser.username}!`);
    } else {
      showAuthError(result.error || 'Registration failed');
    }
  } catch (error) {
    console.error('Registration error:', error);
    showAuthError('Connection error. Please try again.');
  }
}

async function checkAuth() {
  try {
    const response = await fetch('api.php?action=check_auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const result = await response.json();
    
    if (result.authenticated && result.user) {
      currentUser = result.user;
      document.getElementById('loginScreen').classList.add('hidden');
      document.getElementById('mainApp').classList.remove('hidden');
      updateUserDisplay();
      loadSettings();
      loadEstimateHistory();
      return true;
    } else {
      document.getElementById('loginScreen').classList.remove('hidden');
      document.getElementById('mainApp').classList.add('hidden');
      return false;
    }
  } catch (error) {
    console.error('Auth check error:', error);
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
    return false;
  }
}

async function logout() {
  try {
    await fetch('api.php?action=logout');
    currentUser = null;
    location.reload();
  } catch (error) {
    console.error('Logout error:', error);
    location.reload();
  }
}

// Navigation
function showSection(section) {
  console.log('Switching to section:', section);
  try {
    // Hide all sections
    document
      .querySelectorAll('.section')
      .forEach((s) => s.classList.remove('active'));
    
    // Remove active state from all navigation links (both desktop and mobile)
    document
      .querySelectorAll('.nav-link')
      .forEach((link) => {
        link.classList.remove('active');
        link.classList.remove('border-udora-500');
        link.classList.add('border-transparent');
        if (link.classList.contains('text-udora-600')) {
          link.classList.remove('text-udora-600');
          link.classList.add('text-gray-500');
        }
      });
    
    document
      .querySelectorAll('.mobile-nav-link')
      .forEach((link) => {
        link.classList.remove('active');
        link.classList.remove('border-udora-500', 'bg-udora-50', 'text-udora-700');
        link.classList.add('border-transparent', 'text-gray-600');
      });

    // Show selected section
    const sectionElement = document.getElementById(section + 'Section');
    if (sectionElement) {
      sectionElement.classList.add('active');
      console.log('Section activated:', section);
    } else {
      console.error('Section element not found for section:', section);
    }

    // Activate corresponding navigation links
    const desktopNavLink = document.querySelector(
      `.nav-link[onclick="showSection('${section}')"]`
    );
    if (desktopNavLink) {
      desktopNavLink.classList.add('active');
      desktopNavLink.classList.remove('border-transparent', 'text-gray-500');
      desktopNavLink.classList.add('border-udora-500', 'text-udora-600');
      console.log('Desktop nav link activated for:', section);
    }

    const mobileNavLink = document.querySelector(
      `.mobile-nav-link[onclick*="showSection('${section}')"]`
    );
    if (mobileNavLink) {
      mobileNavLink.classList.add('active');
      mobileNavLink.classList.remove('border-transparent', 'text-gray-600');
      mobileNavLink.classList.add('border-udora-500', 'bg-udora-50', 'text-udora-700');
      console.log('Mobile nav link activated for:', section);
    }

    // Load section-specific data
    if (section === 'history') {
      loadEstimateHistory();
    } else if (section === 'products') {
      loadProductsServices();
    } else if (section === 'packages') {
      // loadPackages() is handled by packages.js via updateShowSectionForPackages()
    } else if (section === 'admin') {
      loadUsersForAdmin();
    } else if (section === 'settings') {
      loadProductCategories().then(() => renderProductCategoryList());
      loadPackageCategories().then(() => renderPackageCategoryList());
    }
  } catch (error) {
    console.error('Error within showSection:', error);
    alert('Error showing section: ' + section);
  }
}

// Mobile menu functions
function toggleMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  const button = document.getElementById('mobile-menu-button');
  
  if (mobileMenu.classList.contains('show')) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
}

function openMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  const button = document.getElementById('mobile-menu-button');
  
  mobileMenu.classList.add('show');
  button.setAttribute('aria-expanded', 'true');
}

function closeMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  const button = document.getElementById('mobile-menu-button');
  
  mobileMenu.classList.remove('show');
  button.setAttribute('aria-expanded', 'false');
}

// Settings
async function loadSettings() {
  try {
    const response = await fetch('api.php?action=get_settings');
    settings = await response.json();

    // Populate settings form
    Object.keys(settings).forEach((key) => {
      const element = document.getElementById(
        key.replace(/_([a-z])/g, (g) => g[1].toUpperCase())
      );
      if (element) {
        element.value = settings[key];
      }
    });

    // Update dynamic elements
    updateDynamicContent(settings);
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

async function saveSettings() {
  const settingsData = {};
  const inputs = document.querySelectorAll(
    '#settingsSection input, #settingsSection textarea'
  );

  inputs.forEach((input) => {
    const key = input.id.replace(/([A-Z])/g, '_$1').toLowerCase();
    settingsData[key] = input.value;
  });

  try {
    const response = await fetch('api.php?action=update_settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settingsData),
    });

    if (response.ok) {
      showToast('Settings saved successfully!');
      settings = { ...settings, ...settingsData };
      updateDynamicContent(settings);
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    showToast('Error saving settings', 'error');
  }
}

function updateDynamicContent(settings) {
  // Update tax rate display
  document.getElementById('taxRateDisplay').textContent =
    settings.tax_rate || '13';

  // Update sales commission display
  const salesCommissionRate = settings.sales_rep_commission || '0';
  document.getElementById('salesCommissionDisplay').textContent =
    salesCommissionRate;
  document.getElementById('salesCommissionRateDisplay').textContent =
    salesCommissionRate;

  // Update company name in header and page title
  const companyName = settings.company_name || 'Udora Safety';
  const currentYear = new Date().getFullYear();

  // Update page title
  document.getElementById(
    'pageTitle'
  ).textContent = `${companyName} - Estimate Generator`;

  // Update header title
  document.getElementById(
    'headerTitle'
  ).textContent = `${companyName} - Estimate Generator`;

  // Update footer
  updateFooter(companyName);
}

// Footer update function
function updateFooter(companyName = 'Udora Safety') {
  const currentYear = new Date().getFullYear();
  
  // Update company name in footer
  const footerCompanyElement = document.getElementById('footerCompanyName');
  if (footerCompanyElement) {
    footerCompanyElement.textContent = companyName;
  }
  
  // Update year in footer
  const footerYearElement = document.getElementById('footerYear');
  if (footerYearElement) {
    footerYearElement.textContent = currentYear;
  }
  
  // Update version number (you can fetch this dynamically if needed)
  updateVersionNumber();
}

// Version number update function
function updateVersionNumber() {
  const versionElement = document.getElementById('appVersion');
  if (versionElement) {
    // You can either hardcode this or fetch it dynamically from package.json or API
    const currentVersion = 'v1.2.2';
    versionElement.textContent = currentVersion;
  }
}

// Line Items
function addLineItem() {
  const container = document.getElementById('lineItemsList');
  const itemId = `lineItem${lineItemCounter++}`;

  const lineItem = document.createElement('div');
  lineItem.className = 'line-item';
  lineItem.id = itemId;
  lineItem.innerHTML = `
          <input type="text" placeholder="Description" onchange="calculateTotals()" class="w-full px-2 py-1 border border-gray-300 rounded text-sm">
          <input type="number" min="1" value="1" onchange="calculateTotals()" class="w-full px-2 py-1 border border-gray-300 rounded text-sm">
          <input type="number" step="0.01" min="0" placeholder="0.00" onchange="calculateTotals()" class="w-full px-2 py-1 border border-gray-300 rounded text-sm">
          <select onchange="updateMarkup('${itemId}'); calculateTotals()" class="w-full px-2 py-1 border border-gray-300 rounded text-sm">
              <option value="hardware">Hardware</option>
              <option value="parts_materials">Parts/Materials</option>
              <option value="labor">Labor</option>
          </select>
          <input type="number" step="0.01" min="0" readonly class="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100">
          <span class="line-total text-sm font-semibold">$0.00</span>
          <button type="button" onclick="removeLineItem('${itemId}')" class="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded">Remove</button>
      `;

  container.appendChild(lineItem);
  updateMarkup(itemId);
}

function removeLineItem(itemId) {
  document.getElementById(itemId).remove();
  calculateTotals();
}

function updateMarkup(itemId) {
  const lineItem = document.getElementById(itemId);
  const category = lineItem.querySelector('select').value;
  const inputs = lineItem.querySelectorAll('input');
  const markupInput = inputs[3]; // The 4th input is the markup percentage field

  let markupPercent = 0;
  switch (category) {
    case 'hardware':
      markupPercent = parseFloat(settings.hardware_markup || 25);
      break;
    case 'parts_materials':
      markupPercent = parseFloat(settings.parts_materials_markup || 30);
      break;
    case 'labor':
      markupPercent = parseFloat(settings.labor_markup || 0);
      break;
  }

  if (markupInput) {
    markupInput.value = markupPercent;
  }
}

function calculateTotals() {
  let subtotal = 0;

  document
    .querySelectorAll('.line-item:not(.line-item-header)')
    .forEach((item) => {
      const inputs = item.querySelectorAll('input');
      const quantity = parseFloat(inputs[1].value || 0);
      const unitCost = parseFloat(inputs[2].value || 0);
      const markupPercent = parseFloat(inputs[3].value || 0);

      const lineTotal = quantity * unitCost * (1 + markupPercent / 100);
      item.querySelector(
        '.line-total'
      ).textContent = `$${lineTotal.toFixed(2)}`;
      subtotal += lineTotal;
    });

  const taxRate = parseFloat(settings.tax_rate || 13) / 100;
  const taxAmount = subtotal * taxRate;

  let salesCommissionAmount = 0;
  if (document.getElementById('applySalesCommission').checked) {
    const salesCommissionRate =
      parseFloat(settings.sales_rep_commission || 0) / 100;
    salesCommissionAmount = subtotal * salesCommissionRate;
    document.getElementById('salesCommissionRow').classList.remove('hidden');
    document.getElementById(
      'salesCommissionAmount'
    ).textContent = `$${salesCommissionAmount.toFixed(2)}`;
  } else {
    document.getElementById('salesCommissionRow').classList.add('hidden');
  }

  const total = subtotal + taxAmount + salesCommissionAmount;

  document.getElementById(
    'subtotalAmount'
  ).textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById(
    'taxAmount'
  ).textContent = `$${taxAmount.toFixed(2)}`;
  document.getElementById('totalAmount').textContent = `$${total.toFixed(
    2
  )}`;
}

// Save Estimate
async function saveEstimate() {
  const lineItems = [];
  document
    .querySelectorAll('.line-item:not(.line-item-header)')
    .forEach((item) => {
      const inputs = item.querySelectorAll('input');
      const select = item.querySelector('select');

      lineItems.push({
        description: inputs[0].value,
        quantity: parseInt(inputs[1].value || 0),
        unit_cost: parseFloat(inputs[2].value || 0),
        category: select.value,
        markup_percent: parseFloat(inputs[3].value || 0),
        line_total: parseFloat(
          item.querySelector('.line-total').textContent.replace('$', '')
        ),
      });
    });

  const estimateData = {
    client_name: document.getElementById('clientName').value,
    client_email: document.getElementById('clientEmail').value,
    client_phone: document.getElementById('clientPhone').value,
    project_address: document.getElementById('projectAddress').value,
    project_type: document.getElementById('projectType').value,
    system_types: [], // Empty array since system types are now in notes
    line_items: lineItems,
    subtotal: parseFloat(
      document
        .getElementById('subtotalAmount')
        .textContent.replace('$', '')
    ),
    tax_amount: parseFloat(
      document.getElementById('taxAmount').textContent.replace('$', '')
    ),
    total_amount: parseFloat(
      document.getElementById('totalAmount').textContent.replace('$', '')
    ),
    notes: document.getElementById('estimateNotes').value,
    status: document.getElementById('estimateStatus').value,
  };

  if (!estimateData.client_name) {
    alert('Please enter a client name');
    return;
  }

  if (lineItems.length === 0) {
    alert('Please add at least one line item');
    return;
  }

  try {
    const response = await fetch('api.php?action=save_estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(estimateData),
    });

    const result = await response.json();
    if (result.success) {
      showToast(`Estimate ${result.estimate_number} saved successfully!`);
      clearEstimateForm();
      loadEstimateHistory();
    } else {
      showToast(
        'Error saving estimate: ' + (result.error || 'Unknown error'),
        'error'
      );
    }
  } catch (error) {
    console.error('Error saving estimate:', error);
    showToast('Error saving estimate', 'error');
  }
}

function clearEstimateForm() {
  document.getElementById('clientName').value = '';
  document.getElementById('clientEmail').value = '';
  document.getElementById('clientPhone').value = '';
  document.getElementById('projectAddress').value = '';
  document.getElementById('projectType').value = 'residential';
  document.getElementById('estimateNotes').value = '';
  document.getElementById('estimateStatus').value = 'draft';
  document.getElementById('lineItemsList').innerHTML = '';
  calculateTotals();
}

// Preview Functions
function previewEstimate() {
  const lineItems = [];
  document
    .querySelectorAll('.line-item:not(.line-item-header)')
    .forEach((item) => {
      const inputs = item.querySelectorAll('input');
      const select = item.querySelector('select');

      if (inputs[0].value) {
        lineItems.push({
          description: inputs[0].value,
          quantity: parseInt(inputs[1].value || 0),
          unit_cost: parseFloat(inputs[2].value || 0),
          category: select.value,
          markup_percent: parseFloat(inputs[3].value || 0),
          line_total: parseFloat(
            item.querySelector('.line-total').textContent.replace('$', '')
          ),
        });
      }
    });

  const estimateData = {
    estimate_number: 'PREVIEW',
    client_name:
      document.getElementById('clientName').value || 'Sample Client',
    client_email: document.getElementById('clientEmail').value,
    client_phone: document.getElementById('clientPhone').value,
    project_address: document.getElementById('projectAddress').value,
    project_type: document.getElementById('projectType').value,
    system_types: [], // Empty array since system types are now in notes
    line_items: lineItems,
    subtotal: parseFloat(
      document
        .getElementById('subtotalAmount')
        .textContent.replace('$', '')
    ),
    tax_amount: parseFloat(
      document.getElementById('taxAmount').textContent.replace('$', '')
    ),
    total_amount: parseFloat(
      document.getElementById('totalAmount').textContent.replace('$', '')
    ),
  };

  generateEstimatePreview(estimateData);
  document.getElementById('previewModal').classList.remove('hidden');
}

function generateEstimatePreview(estimate) {
  const systemTypeLabels = {
    cctv: 'CCTV/Security Cameras',
    alarm: 'Alarm Systems',
    access: 'Access Control',
    cabling: 'Structured Cabling',
  };

  const content = `
          <div class="estimate-preview">
              <div class="company-header">
                  <h1>${settings.company_name || 'Udora Safety'}</h1>
                  <p>${settings.company_phone || '416 853 2603'} | ${
    settings.company_email || 'info@udorasafety.com'
  }</p>
                  <h2>ESTIMATE</h2>
              </div>

              <div class="estimate-info">
                  <div>
                      <h3>Bill To:</h3>
                      <p><strong>${estimate.client_name}</strong></p>
                      ${
                        estimate.client_email
                          ? `<p>${estimate.client_email}</p>`
                          : ''
                      }
                      ${
                        estimate.client_phone
                          ? `<p>${estimate.client_phone}</p>`
                          : ''
                      }
                      ${
                        estimate.project_address
                          ? `<p>${estimate.project_address}</p>`
                          : ''
                      }
                  </div>
                  <div>
                      <h3>Estimate Details:</h3>
                      <p><strong>Estimate #:</strong> ${
                        estimate.estimate_number
                      }</p>
                      <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                      <p><strong>Project Type:</strong> ${
                        estimate.project_type
                      }</p>
      ${
        estimate.system_types && estimate.system_types.length > 0
          ? `<p><strong>Systems:</strong> ${estimate.system_types
              .map((type) => systemTypeLabels[type] || type)
              .join(', ')}</p>`
          : ''
      }
  </div>
</div>

<table style="width: 100%; border-collapse: collapse; margin: 2rem 0;">
                  <thead>
                      <tr style="background: #f8f9fa;">
                          <th style="padding: 0.75rem; border: 1px solid #ddd; text-align: left;">Description</th>
                          <th style="padding: 0.75rem; border: 1px solid #ddd; text-align: center;">Qty</th>
                          <th style="padding: 0.75rem; border: 1px solid #ddd; text-align: right;">Unit Cost</th>
                          <th style="padding: 0.75rem; border: 1px solid #ddd; text-align: right;">Total</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${estimate.line_items
                        .map(
                          (item) => `
                          <tr>
                              <td style="padding: 0.75rem; border: 1px solid #ddd;">${
                                item.description
                              }</td>
                              <td style="padding: 0.75rem; border: 1px solid #ddd; text-align: center;">${
                                item.quantity
                              }</td>
                              <td style="padding: 0.75rem; border: 1px solid #ddd; text-align: right;">${parseFloat(
                                item.unit_cost
                              ).toFixed(2)}</td>
                              <td style="padding: 0.75rem; border: 1px solid #ddd; text-align: right;">${parseFloat(
                                item.line_total
                              ).toFixed(2)}</td>
                          </tr>
                      `
                        )
                        .join('')}
                  </tbody>
              </table>

              <div style="text-align: right; margin: 2rem 0;">
                  <div style="display: inline-block; text-align: left;">
                      <div style="margin-bottom: 0.5rem;">
                          <span style="display: inline-block; width: 120px;">Subtotal:</span>
                          <span style="font-weight: bold;">${parseFloat(
                            estimate.subtotal
                          ).toFixed(2)}</span>
                      </div>
                      <div style="margin-bottom: 0.5rem;">
                          <span style="display: inline-block; width: 120px;">Tax (${
                            settings.tax_rate || 13
                          }%):</span>
                          <span style="font-weight: bold;">${parseFloat(
                            estimate.tax_amount
                          ).toFixed(2)}</span>
                      </div>
                      <div style="border-top: 2px solid #1e3c72; padding-top: 0.5rem; font-size: 1.2rem;">
                          <span style="display: inline-block; width: 120px;">Total:</span>
                          <span style="font-weight: bold;">${parseFloat(
                            estimate.total_amount
                          ).toFixed(2)}</span>
                      </div>
                  </div>
              </div>

              <div style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #ddd;">
                  <h3>Terms & Conditions</h3>
                  <p><strong>Payment Terms:</strong> ${
                    settings.payment_terms || 'Net 30 days'
                  }</p>
                  <p><strong>Warranty:</strong> ${
                    settings.warranty_terms ||
                    '1 year parts and labor warranty'
                  }</p>
                  <p style="margin-top: 1rem; font-size: 0.9rem; color: #666;">
                      This estimate is valid for 30 days from the date issued. All work will be completed according to industry standards and local building codes.
                  </p>
              </div>

              <div style="margin-top: 2rem; text-align: center;">
                  <button onclick="printEstimate()" class="bg-udora-600 hover:bg-udora-700 text-white font-medium py-2 px-4 rounded-lg mr-4">Print Estimate</button>
                  <button onclick="closePreview()" class="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg">Close</button>
              </div>
          </div>
      `;

  document.getElementById('previewContent').innerHTML = content;
}

function closePreview() {
  document.getElementById('previewModal').classList.add('hidden');
}

function printEstimate() {
  const printContent =
    document.getElementById('previewContent').innerHTML;
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
          <html>
              <head>
                  <title>Estimate</title>
                  <style>
                      body { font-family: Arial, sans-serif; margin: 20px; }
                      .company-header { text-align: center; border-bottom: 2px solid #1e3c72; padding-bottom: 1rem; margin-bottom: 2rem; }
                      .estimate-info { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem; }
                      table { width: 100%; border-collapse: collapse; }
                      th, td { border: 1px solid #ddd; padding: 8px; }
                      th { background: #f8f9fa; }
                      button { display: none; }
                  </style>
              </head>
              <body>${printContent}</body>
          </html>
      `);
  printWindow.document.close();
  printWindow.print();
}

// Estimate History
async function loadEstimateHistory() {
  try {
    const response = await fetch('api.php?action=get_estimates');
    const estimates = await response.json();

    const container = document.getElementById('estimateHistory');
    container.innerHTML = `
              <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                      <tr style="background: #f8f9fa;">
                          <th style="padding: 1rem; border: 1px solid #ddd; text-align: left;">Estimate #</th>
                          <th style="padding: 1rem; border: 1px solid #ddd; text-align: left;">Client</th>
                          <th style="padding: 1rem; border: 1px solid #ddd; text-align: left;">Project Type</th>
                          <th style="padding: 1rem; border: 1px solid #ddd; text-align: left;">Status</th>
                          <th style="padding: 1rem; border: 1px solid #ddd; text-align: left;">Total</th>
                          <th style="padding: 1rem; border: 1px solid #ddd; text-align: left;">Date</th>
                          <th style="padding: 1rem; border: 1px solid #ddd; text-align: left;">Action</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${estimates
                        .map(
                          (est) => `
                          <tr>
                              <td style="padding: 1rem; border: 1px solid #ddd;">${
                                est.estimate_number
                              }</td>
                              <td style="padding: 1rem; border: 1px solid #ddd;">${
                                est.client_name
                              }</td>
                              <td style="padding: 1rem; border: 1px solid #ddd;">${
                                est.project_type
                              }</td>
                              <td style="padding: 1rem; border: 1px solid #ddd;">
                                  <select class="status-badge status-${
                                    est.status
                                  }" onchange="updateEstimateStatus(${
                            est.id
                          }, this.value)">
                                      <option value="draft" ${
                                        est.status === 'draft'
                                          ? 'selected'
                                          : ''
                                      }>Draft</option>
                                      <option value="sent" ${
                                        est.status === 'sent'
                                          ? 'selected'
                                          : ''
                                      }>Sent</option>
                                      <option value="approved" ${
                                        est.status === 'approved'
                                          ? 'selected'
                                          : ''
                                      }>Approved</option>
                                  </select>
                              </td>
                              <td style="padding: 1rem; border: 1px solid #ddd;">$${parseFloat(
                                est.total_amount
                              ).toFixed(2)}</td>
                              <td style="padding: 1rem; border: 1px solid #ddd;">${new Date(
                                est.created_at
                              ).toLocaleDateString()}</td>
                              <td style="padding: 1rem; border: 1px solid #ddd;">
                                  <button onclick="viewEstimate(${
                                    est.id
                                  })" class="bg-udora-600 hover:bg-udora-700 text-white text-xs px-2 py-1 rounded mr-1">View</button>
                                  <button onclick="editEstimate(${
                                    est.id
                                  })" class="bg-gray-600 hover:bg-gray-700 text-white text-xs px-2 py-1 rounded mr-1">Edit</button>
                                  <button onclick="deleteEstimate(${
                                    est.id
                                  })" class="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded">Delete</button>
                              </td>
                          </tr>
                      `
                        )
                        .join('')}
                  </tbody>
          </table>
      `;
  } catch (error) {
    console.error('Error loading estimate history:', error);
  }
}

// Estimate History Functions
async function viewEstimate(id) {
  try {
    const response = await fetch(`api.php?action=get_estimate&id=${id}`);
    const estimate = await response.json();
    
    if (estimate) {
      // Generate preview using existing preview function
      generateEstimatePreview(estimate);
      document.getElementById('previewModal').classList.remove('hidden');
    } else {
      showToast('Error loading estimate', 'error');
    }
  } catch (error) {
    console.error('Error viewing estimate:', error);
    showToast('Error loading estimate', 'error');
  }
}

async function editEstimate(id) {
  try {
    const response = await fetch(`api.php?action=get_estimate&id=${id}`);
    const estimate = await response.json();
    
    if (estimate) {
      // Switch to estimate section
      showSection('estimate');
      
      // Populate the form with estimate data
      document.getElementById('clientName').value = estimate.client_name || '';
      document.getElementById('clientEmail').value = estimate.client_email || '';
      document.getElementById('clientPhone').value = estimate.client_phone || '';
      document.getElementById('projectAddress').value = estimate.project_address || '';
      document.getElementById('projectType').value = estimate.project_type || 'residential';
      document.getElementById('estimateNotes').value = estimate.notes || '';
      document.getElementById('estimateStatus').value = estimate.status || 'draft';
      
      // Clear existing line items
      document.getElementById('lineItemsList').innerHTML = '';
      
      // Add line items
      if (estimate.line_items && estimate.line_items.length > 0) {
        estimate.line_items.forEach(item => {
          addLineItem();
          const lineItems = document.querySelectorAll('.line-item:not(.line-item-header)');
          const lastItem = lineItems[lineItems.length - 1];
          const inputs = lastItem.querySelectorAll('input');
          const select = lastItem.querySelector('select');
          
          inputs[0].value = item.description || '';
          inputs[1].value = item.quantity || 1;
          inputs[2].value = item.unit_cost || 0;
          inputs[3].value = item.markup_percent || 0;
          select.value = item.category || 'hardware';
          
          // Trigger calculation  
          calculateTotals();
        });
      }
      
      // Calculate totals
      calculateTotals();
      
      // Store the estimate ID for updating instead of creating new
      window.editingEstimateId = id;
      
      // Change button text to indicate editing
      const saveButton = document.querySelector('button[onclick="saveEstimate()"]');
      if (saveButton) {
        saveButton.textContent = 'Update Estimate';
        saveButton.onclick = () => updateEstimate(id);
      }
      
      showToast('Estimate loaded for editing');
    } else {
      showToast('Error loading estimate', 'error');
    }
  } catch (error) {
    console.error('Error loading estimate for edit:', error);
    showToast('Error loading estimate', 'error');
  }
}

async function updateEstimate(id) {
  const lineItems = [];
  document
    .querySelectorAll('.line-item:not(.line-item-header)')
    .forEach((item) => {
      const inputs = item.querySelectorAll('input');
      const select = item.querySelector('select');

      lineItems.push({
        description: inputs[0].value,
        quantity: parseInt(inputs[1].value || 0),
        unit_cost: parseFloat(inputs[2].value || 0),
        category: select.value,
        markup_percent: parseFloat(inputs[3].value || 0),
        line_total: parseFloat(
          item.querySelector('.line-total').textContent.replace('$', '')
        ),
      });
    });

  const estimateData = {
    id: id,
    client_name: document.getElementById('clientName').value,
    client_email: document.getElementById('clientEmail').value,
    client_phone: document.getElementById('clientPhone').value,
    project_address: document.getElementById('projectAddress').value,
    project_type: document.getElementById('projectType').value,
    system_types: [], // Empty array since system types are now in notes
    line_items: lineItems,
    subtotal: parseFloat(
      document
        .getElementById('subtotalAmount')
        .textContent.replace('$', '')
    ),
    tax_amount: parseFloat(
      document.getElementById('taxAmount').textContent.replace('$', '')
    ),
    total_amount: parseFloat(
      document.getElementById('totalAmount').textContent.replace('$', '')
    ),
    notes: document.getElementById('estimateNotes').value,
    status: document.getElementById('estimateStatus').value,
  };

  if (!estimateData.client_name) {
    alert('Please enter a client name');
    return;
  }

  if (lineItems.length === 0) {
    alert('Please add at least one line item');
    return;
  }

  try {
    const response = await fetch('api.php?action=update_estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(estimateData),
    });

    const result = await response.json();
    if (result.success) {
      showToast('Estimate updated successfully!');
      clearEstimateForm();
      
      // Reset button back to save mode
      const saveButton = document.querySelector('button[onclick*="updateEstimate"]');
      if (saveButton) {
        saveButton.textContent = 'Save Estimate';
        saveButton.onclick = saveEstimate;
      }
      
      // Clear editing state
      delete window.editingEstimateId;
      
      // Refresh history and go back to history section
      loadEstimateHistory();
      showSection('history');
    } else {
      showToast(
        'Error updating estimate: ' + (result.error || 'Unknown error'),
        'error'
      );
    }
  } catch (error) {
    console.error('Error updating estimate:', error);
    showToast('Error updating estimate', 'error');
  }
}

async function deleteEstimate(id) {
  if (!confirm('Are you sure you want to delete this estimate? This action cannot be undone.')) {
    return;
  }
  
  try {
    const response = await fetch(`api.php?action=delete_estimate&id=${id}`, {
      method: 'POST'
    });
    const result = await response.json();
    
    if (result.success) {
      showToast('Estimate deleted successfully');
      loadEstimateHistory(); // Refresh the list
    } else {
      showToast('Error deleting estimate: ' + (result.error || 'Unknown error'), 'error');
    }
  } catch (error) {
    console.error('Error deleting estimate:', error);
    showToast('Error deleting estimate', 'error');
  }
}

async function updateEstimateStatus(id, status) {
  try {
    const response = await fetch('api.php?action=update_estimate_status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: id, status: status })
    });
    
    const result = await response.json();
    
    if (result.success) {
      showToast(`Estimate status updated to ${status}`);
      // The status will already be updated in the dropdown, so no need to reload
    } else {
      showToast('Error updating status: ' + (result.error || 'Unknown error'), 'error');
      // Reload to reset the dropdown to original state
      loadEstimateHistory();
    }
  } catch (error) {
    console.error('Error updating estimate status:', error);
    showToast('Error updating status', 'error');
    // Reload to reset the dropdown to original state
    loadEstimateHistory();
  }
}

// Product functions
async function loadProductsServices() {
  try {
    const response = await fetch('api.php?action=get_products_services');
    allProducts = await response.json();
    await loadProductCategories();
    filterProducts();
  } catch (error) {
    console.error('Error loading products:', error);
    showToast('Error loading products', 'error');
  }
}

function filterProducts() {
  const searchTerm = document.getElementById('productSearchInput')?.value.toLowerCase() || '';
  const categoryFilter = document.getElementById('categoryFilter')?.value || '';
  
  let filtered = allProducts.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.sku.toLowerCase().includes(searchTerm);
    
    const matchesCategory = !categoryFilter || 
      (product.category && product.category.toLowerCase() === categoryFilter.toLowerCase());
    
    return matchesSearch && matchesCategory;
  });

  // Sort products
  filtered.sort((a, b) => {
    const aVal = a[productSort.column] || '';
    const bVal = b[productSort.column] || '';
    
    if (typeof aVal === 'string') {
      return productSort.direction === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    } else {
      return productSort.direction === 'asc' 
        ? aVal - bVal
        : bVal - aVal;
    }
  });

  renderProducts(filtered);
}

function clearFilters() {
  document.getElementById('productSearchInput').value = '';
  document.getElementById('categoryFilter').value = '';
  filterProducts();
}

function renderProducts(products) {
  const container = document.getElementById('productsList');
  
  // Update record count display
  updateProductCount(products.length);
  
  if (!products.length) {
    container.innerHTML = '<div class="text-center py-8 text-gray-500">No products found</div>';
    return;
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = products.slice(startIndex, endIndex);

  container.innerHTML = `
    <table class="w-full border-collapse border border-gray-300">
      <thead>
        <tr class="bg-gray-50">
          <th class="border border-gray-300 px-4 py-3 text-left">
            <input type="checkbox" id="selectAllProducts" onchange="toggleSelectAllProducts()" class="rounded">
          </th>
          <th class="border border-gray-300 px-4 py-3 text-left cursor-pointer" onclick="sortProducts('sku')">
            SKU
            ${productSort.column === 'sku' ? (productSort.direction === 'asc' ? '↑' : '↓') : ''}
          </th>
          <th class="border border-gray-300 px-4 py-3 text-left cursor-pointer" onclick="sortProducts('name')">
            Name
            ${productSort.column === 'name' ? (productSort.direction === 'asc' ? '↑' : '↓') : ''}
          </th>
          <th class="border border-gray-300 px-4 py-3 text-left cursor-pointer" onclick="sortProducts('category')">
            Category
          </th>
          <th class="border border-gray-300 px-4 py-3 text-left cursor-pointer" onclick="sortProducts('unit_cost')">
            Unit Cost
            ${productSort.column === 'unit_cost' ? (productSort.direction === 'asc' ? '↑' : '↓') : ''}
          </th>
          <th class="border border-gray-300 px-4 py-3 text-left">
            Description
          </th>
          <th class="border border-gray-300 px-4 py-3 text-center">
            Action
          </th>
        </tr>
      </thead>
      <tbody>
        ${paginatedProducts.map(product => `
          <tr class="hover:bg-gray-50">
            <td class="border border-gray-300 px-4 py-3">
              <input type="checkbox" class="product-checkbox rounded" value="${product.id}" onchange="updateBulkDeleteButton()">
            </td>
            <td class="border border-gray-300 px-4 py-3 font-mono text-sm">
              ${product.sku}
            </td>
            <td class="border border-gray-300 px-4 py-3 font-medium">
              ${product.name}
            </td>
            <td class="border border-gray-300 px-4 py-3">
              ${product.category || 'Uncategorized'}
            </td>
            <td class="border border-gray-300 px-4 py-3 font-mono">
              $${parseFloat(product.unit_cost || 0).toFixed(2)}
            </td>
            <td class="border border-gray-300 px-4 py-3">
              <div class="description-cell">
                <span class="short-desc">${truncateText(product.description || '', 50)}</span>
                <span class="full-desc hidden">${product.description || ''}</span>
                ${(product.description || '').length > 50 ? 
                  '<button onclick="toggleDescription(this)" class="text-udora-600 hover:text-udora-800 text-xs ml-2">Show More</button>' : 
                  ''
                }
              </div>
            </td>
            <td class="border border-gray-300 px-4 py-3">
              <div class="flex flex-col space-y-1">
                <div class="flex space-x-1">
                  <button onclick="editProduct(${product.id})" 
                          class="bg-gray-600 hover:bg-gray-700 text-white text-xs px-2 py-1 rounded">
                    Edit
                  </button>
                  <button onclick="deleteProduct(${product.id})" 
                          class="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded">
                    Delete
                  </button>
                </div>
                <button onclick="useInEstimate(${product.id})" 
                        class="bg-udora-600 hover:bg-udora-700 text-white text-xs px-2 py-1 rounded w-full">
                  Use in Estimate
                </button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  // Update pagination
  updateProductPagination(products.length);
}

function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

function toggleDescription(button) {
  const cell = button.parentElement;
  const shortDesc = cell.querySelector('.short-desc');
  const fullDesc = cell.querySelector('.full-desc');
  
  if (fullDesc.classList.contains('hidden')) {
    shortDesc.classList.add('hidden');
    fullDesc.classList.remove('hidden');
    button.textContent = 'Show Less';
  } else {
    shortDesc.classList.remove('hidden');
    fullDesc.classList.add('hidden');
    button.textContent = 'Show More';
  }
}

function toggleSelectAllProducts() {
  const selectAll = document.getElementById('selectAllProducts');
  const checkboxes = document.querySelectorAll('.product-checkbox');
  
  checkboxes.forEach(checkbox => {
    checkbox.checked = selectAll.checked;
  });
  
  updateBulkDeleteButton();
}

function updateBulkDeleteButton() {
  const checkboxes = document.querySelectorAll('.product-checkbox:checked');
  const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
  
  if (checkboxes.length > 0) {
    bulkDeleteBtn.classList.remove('hidden');
  } else {
    bulkDeleteBtn.classList.add('hidden');
  }
}

function deleteSelectedProducts() {
  const checkboxes = document.querySelectorAll('.product-checkbox:checked');
  const selectedIds = Array.from(checkboxes).map(cb => cb.value);
  
  if (selectedIds.length === 0) {
    showToast('No products selected', 'error');
    return;
  }
  
  if (!confirm(`Are you sure you want to delete ${selectedIds.length} product(s)?`)) {
    return;
  }
  
  // Delete each selected product
  Promise.all(selectedIds.map(id => deleteProductById(id)))
    .then(() => {
      showToast(`Successfully deleted ${selectedIds.length} product(s)!`);
      loadProductsServices();
    })
    .catch(error => {
      console.error('Error deleting products:', error);
      showToast('Error deleting some products', 'error');
    });
}

async function deleteProductById(id) {
  const response = await fetch(`api.php?action=delete_product&id=${id}`, {
    method: 'DELETE'
  });
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Unknown error');
  }
  return result;
}

function getCategoryName(categoryId) {
  const category = productCategories.find(cat => cat.id == categoryId);
  return category ? category.name : 'Uncategorized';
}

function updateProductPagination(totalProducts) {
  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  const paginationContainer = document.getElementById('productPagination');
  
  if (totalPages <= 1) {
    paginationContainer.innerHTML = '';
    return;
  }

  let paginationHTML = '<div class="flex justify-center items-center space-x-2 mt-6">';
  
  // Previous button
  paginationHTML += `
    <button onclick="changeProductPage(${currentPage - 1})" 
            ${currentPage === 1 ? 'disabled' : ''}
            class="px-3 py-1 border rounded ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'}">Previous</button>
  `;
  
  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === currentPage) {
      paginationHTML += `<button class="px-3 py-1 bg-udora-600 text-white rounded">${i}</button>`;
    } else {
      paginationHTML += `<button onclick="changeProductPage(${i})" class="px-3 py-1 border bg-white text-gray-700 rounded hover:bg-gray-50">${i}</button>`;
    }
  }
  
  // Next button
  paginationHTML += `
    <button onclick="changeProductPage(${currentPage + 1})" 
            ${currentPage === totalPages ? 'disabled' : ''}
            class="px-3 py-1 border rounded ${currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'}">Next</button>
  `;
  
  paginationHTML += '</div>';
  paginationContainer.innerHTML = paginationHTML;
}

function changeProductPage(page) {
  const totalPages = Math.ceil(allProducts.length / itemsPerPage);
  if (page >= 1 && page <= totalPages) {
    currentPage = page;
    filterProducts();
  }
}

function sortProducts(column) {
  if (productSort.column === column) {
    productSort.direction = productSort.direction === 'asc' ? 'desc' : 'asc';
  } else {
    productSort.column = column;
    productSort.direction = 'asc';
  }
  filterProducts();
}

// Update product count display
function updateProductCount(filteredCount) {
  const countDisplay = document.getElementById('productCount');
  if (!countDisplay) return;
  
  const searchTerm = document.getElementById('productSearchInput')?.value || '';
  const categoryFilter = document.getElementById('categoryFilter')?.value || '';
  
  let countText = `Showing ${filteredCount} of ${allProducts.length} products`;
  
  // Add filter information
  const activeFilters = [];
  if (searchTerm.trim()) {
    activeFilters.push(`search: "${searchTerm}"`);
  }
  if (categoryFilter) {
    activeFilters.push(`category: ${categoryFilter}`);
  }
  
  if (activeFilters.length > 0) {
    countText += ` (filtered by ${activeFilters.join(', ')})`;
  }
  
  countDisplay.textContent = countText;
}

// Package functions
async function loadPackages() {
  try {
    const response = await fetch('api.php?action=get_packages');
    allPackages = await response.json();
    await loadPackageCategories();
    filterPackages();
  } catch (error) {
    console.error('Error loading packages:', error);
    showToast('Error loading packages', 'error');
  }
}

// Product CRUD operations
function showAddProductForm() {
  editingProductId = null;
  document.getElementById('productModalTitle').textContent = 'Add New Product';
  document.getElementById('productForm').reset();
  loadProductCategories(); // Ensure categories are loaded
  document.getElementById('productModal').classList.remove('hidden');
}

async function editProduct(id) {
  editingProductId = id;
  const product = allProducts.find(p => p.id === id);
  if (!product) return;

  document.getElementById('productModalTitle').textContent = 'Edit Product';
  document.getElementById('productName').value = product.name;
  document.getElementById('productSku').value = product.sku;
  document.getElementById('productDescription').value = product.description || '';
  document.getElementById('productCost').value = product.unit_cost;
  document.getElementById('productCategoryId').value = product.category || '';
  document.getElementById('productModal').classList.remove('hidden');
}

async function saveProduct() {
  const formData = {
    name: document.getElementById('productName').value,
    sku: document.getElementById('productSku').value,
    description: document.getElementById('productDescription').value,
    unit_cost: parseFloat(document.getElementById('productCost').value) || 0,
    category: document.getElementById('productCategoryId').value || null
  };

  if (!formData.name || !formData.sku) {
    showToast('Please fill in name and SKU', 'error');
    return;
  }

  try {
    const action = editingProductId ? 'update_product' : 'add_product';
    const url = `api.php?action=${action}${editingProductId ? `&id=${editingProductId}` : ''}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const result = await response.json();
    if (result.success) {
      showToast(`Product ${editingProductId ? 'updated' : 'added'} successfully!`);
      closeProductModal();
      loadProductsServices();
    } else {
      showToast('Error saving product: ' + (result.error || 'Unknown error'), 'error');
    }
  } catch (error) {
    console.error('Error saving product:', error);
    showToast('Error saving product', 'error');
  }
}

async function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;

  try {
    const response = await fetch(`api.php?action=delete_product&id=${id}`, {
      method: 'DELETE'
    });

    const result = await response.json();
    if (result.success) {
      showToast('Product deleted successfully!');
      loadProductsServices();
    } else {
      showToast('Error deleting product: ' + (result.error || 'Unknown error'), 'error');
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    showToast('Error deleting product', 'error');
  }
}

function closeProductModal() {
  document.getElementById('productModal').classList.add('hidden');
  editingProductId = null;
}

// Category management
async function loadProductCategories() {
  try {
    const response = await fetch('api.php?action=get_product_categories');
    productCategories = await response.json();
    
    // Extract unique categories from products for the filter dropdown
    const uniqueCategories = [...new Set(allProducts
      .map(product => product.category)
      .filter(category => category && category.trim() !== '')
    )].sort();
    
    // Update category dropdowns
    const filterSelect = document.getElementById('categoryFilter');
    const formSelect = document.getElementById('productCategoryId');
    
    if (filterSelect) {
      filterSelect.innerHTML = '<option value="">All Categories</option>' +
        uniqueCategories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
    }
    
    if (formSelect) {
      // For the product form, use the unique categories from products since the API might not return proper categories
      const categoryOptions = uniqueCategories.length > 0 
        ? uniqueCategories.map(cat => `<option value="${cat}">${cat}</option>`).join('')
        : '<option value="Hardware">Hardware</option><option value="Labor">Labor</option><option value="Parts/Materials">Parts/Materials</option><option value="Services">Services</option><option value="Installation">Installation</option>';
      
      formSelect.innerHTML = '<option value="">Select Category</option>' + categoryOptions;
    }
  } catch (error) {
    console.error('Error loading product categories:', error);
    // Fallback to default categories if API fails
    const formSelect = document.getElementById('productCategoryId');
    if (formSelect) {
      formSelect.innerHTML = `
        <option value="">Select Category</option>
        <option value="Hardware">Hardware</option>
        <option value="Labor">Labor</option>
        <option value="Parts/Materials">Parts/Materials</option>
        <option value="Services">Services</option>
        <option value="Installation">Installation</option>
      `;
    }
  }
}

async function loadPackageCategories() {
  try {
    const response = await fetch('api.php?action=get_package_categories');
    packageCategories = await response.json();
    
    // Update category dropdowns if they exist
    const categorySelects = document.querySelectorAll('#packageCategoryId, #packageCategoryFilter');
    categorySelects.forEach(select => {
      if (select) {
        const currentValue = select.value;
        select.innerHTML = '<option value="">Select Category</option>';
        packageCategories.forEach(category => {
          select.innerHTML += `<option value="${category.name || category.id}">${category.label || category.name}</option>`;
        });
        select.value = currentValue;
      }
    });
  } catch (error) {
    console.error('Error loading package categories:', error);
  }
}

// Category Management Functions
async function addCategory() {
  const categoryName = document.getElementById('newCategoryName').value.trim();
  const categoryLabel = document.getElementById('newCategoryLabel').value.trim();
  
  if (!categoryName || !categoryLabel) {
    showToast('Please enter both category ID and display name', 'error');
    return;
  }
  
  // Validate category name format
  if (!/^[a-z_]+$/.test(categoryName)) {
    showToast('Category ID must contain only lowercase letters and underscores', 'error');
    return;
  }
  
  try {
    const response = await fetch('api.php?action=add_product_category', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: categoryName,
        label: categoryLabel
      })
    });
    
    const result = await response.json();
    if (result.success) {
      showToast('Product category added successfully!');
      document.getElementById('newCategoryName').value = '';
      document.getElementById('newCategoryLabel').value = '';
      renderProductCategoryList();
      loadProductCategories(); // Refresh dropdowns
    } else {
      showToast('Error adding category: ' + (result.error || 'Unknown error'), 'error');
    }
  } catch (error) {
    console.error('Error adding category:', error);
    showToast('Error adding category', 'error');
  }
}

async function addPackageCategory() {
  const categoryName = document.getElementById('newPackageCategoryName').value.trim();
  const categoryLabel = document.getElementById('newPackageCategoryLabel').value.trim();
  
  if (!categoryName || !categoryLabel) {
    showToast('Please enter both category ID and display name', 'error');
    return;
  }
  
  // Validate category name format
  if (!/^[a-z_]+$/.test(categoryName)) {
    showToast('Category ID must contain only lowercase letters and underscores', 'error');
    return;
  }
  
  try {
    const response = await fetch('api.php?action=add_package_category', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: categoryName,
        label: categoryLabel
      })
    });
    
    const result = await response.json();
    if (result.success) {
      showToast('Package category added successfully!');
      document.getElementById('newPackageCategoryName').value = '';
      document.getElementById('newPackageCategoryLabel').value = '';
      renderPackageCategoryList();
      loadPackageCategories(); // Refresh dropdowns
    } else {
      showToast('Error adding package category: ' + (result.error || 'Unknown error'), 'error');
    }
  } catch (error) {
    console.error('Error adding package category:', error);
    showToast('Error adding package category', 'error');
  }
}

async function editCategory(id, name, label, type = 'product') {
  const fields = [
    {
      name: 'name',
      label: 'Category ID',
      value: name,
      placeholder: 'e.g., access_control',
      hint: 'Only lowercase letters and underscores allowed',
      required: true
    },
    {
      name: 'label', 
      label: 'Display Name',
      value: label,
      placeholder: 'e.g., Access Control Systems',
      required: true
    }
  ];
  
  showInputModal(`Edit ${type === 'product' ? 'Product' : 'Package'} Category`, fields, async (values) => {
    const newName = values.name;
    const newLabel = values.label;
    
    // Validate category name format
    if (!/^[a-z_]+$/.test(newName)) {
      showToast('Category ID must contain only lowercase letters and underscores', 'error');
      return;
    }
    
    try {
      const action = type === 'product' ? 'update_product_category' : 'update_package_category';
      const response = await fetch(`api.php?action=${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: id,
          name: newName,
          label: newLabel
        })
      });
      
      const result = await response.json();
      if (result.success) {
        showToast(`${type === 'product' ? 'Product' : 'Package'} category updated successfully!`);
        if (type === 'product') {
          renderProductCategoryList();
          loadProductCategories();
        } else {
          renderPackageCategoryList();
          loadPackageCategories();
        }
      } else {
        showToast(`Error updating category: ${result.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      showToast('Error updating category', 'error');
    }
  });
}

async function deleteCategory(id, name, type = 'product') {
  showConfirmation(`Are you sure you want to delete the category "${name}"? This action cannot be undone.`, async () => {
    try {
      const action = type === 'product' ? 'delete_product_category' : 'delete_package_category';
      const response = await fetch(`api.php?action=${action}&id=${id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      if (result.success) {
        showToast(`${type === 'product' ? 'Product' : 'Package'} category deleted successfully!`);
        if (type === 'product') {
          renderProductCategoryList();
          loadProductCategories();
        } else {
          renderPackageCategoryList();
          loadPackageCategories();
        }
      } else {
        showToast(`Error deleting category: ${result.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      showToast('Error deleting category', 'error');
    }
  });
}

// Render category management lists
function renderProductCategoryList() {
  const container = document.getElementById('categoryList');
  if (!container) return;
  
  if (!productCategories.length) {
    container.innerHTML = '<p class="text-gray-500 text-sm">No product categories found.</p>';
    return;
  }
  
  const tableHTML = `
    <table class="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
      <thead>
        <tr class="bg-gray-50">
          <th class="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Category ID</th>
          <th class="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Display Name</th>
          <th class="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700">Actions</th>
        </tr>
      </thead>
      <tbody>
        ${productCategories.map(category => `
          <tr class="hover:bg-gray-50">
            <td class="border border-gray-300 px-4 py-3 text-sm font-mono">${category.name || category.id}</td>
            <td class="border border-gray-300 px-4 py-3 text-sm">${category.label || category.name}</td>
            <td class="border border-gray-300 px-4 py-3 text-center">
              <div class="flex justify-center space-x-2">
                <button onclick="editCategory('${category.id}', '${category.name}', '${category.label}', 'product')" class="bg-gray-600 hover:bg-gray-700 text-white text-xs px-3 py-1 rounded transition-colors duration-200">Edit</button>
                <button onclick="deleteCategory('${category.id}', '${category.label}', 'product')" class="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded transition-colors duration-200">Delete</button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  
  container.innerHTML = tableHTML;
}

function renderPackageCategoryList() {
  const container = document.getElementById('packageCategoryList');
  if (!container) return;
  
  if (!packageCategories.length) {
    container.innerHTML = '<p class="text-gray-500 text-sm">No package categories found.</p>';
    return;
  }
  
  const tableHTML = `
    <table class="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
      <thead>
        <tr class="bg-gray-50">
          <th class="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Category ID</th>
          <th class="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Display Name</th>
          <th class="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700">Actions</th>
        </tr>
      </thead>
      <tbody>
        ${packageCategories.map(category => `
          <tr class="hover:bg-gray-50">
            <td class="border border-gray-300 px-4 py-3 text-sm font-mono">${category.name || category.id}</td>
            <td class="border border-gray-300 px-4 py-3 text-sm">${category.label || category.name}</td>
            <td class="border border-gray-300 px-4 py-3 text-center">
              <div class="flex justify-center space-x-2">
                <button onclick="editCategory('${category.id}', '${category.name}', '${category.label}', 'package')" class="bg-gray-600 hover:bg-gray-700 text-white text-xs px-3 py-1 rounded transition-colors duration-200">Edit</button>
                <button onclick="deleteCategory('${category.id}', '${category.label}', 'package')" class="bg-red-600 hover:bg-red-700 text-white text-xs px-1 rounded transition-colors duration-200">Delete</button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  
  container.innerHTML = tableHTML;
}

// Export functions
async function exportEstimatesCSV() {
  try {
    const response = await fetch('api.php?action=get_detailed_estimates');
    const estimates = await response.json();
    
    if (!estimates.length) {
      showToast('No estimates to export', 'error');
      return;
    }

    const csvHeaders = [
      'Estimate Number', 'Client Name', 'Client Email', 'Client Phone', 'Project Address',
      'Project Type', 'Status', 'Subtotal', 'Tax Amount', 'Total Amount', 
      'Notes', 'Created Date', 'Line Items'
    ];
    const csvData = [csvHeaders];

    estimates.forEach(estimate => {
      // Format line items as a string
      let lineItemsText = '';
      if (estimate.line_items && estimate.line_items.length > 0) {
        lineItemsText = estimate.line_items.map(item => 
          `"${item.description}" (Qty: ${item.quantity}, Cost: $${parseFloat(item.unit_cost).toFixed(2)}, Category: ${item.category}, Markup: ${item.markup_percent}%, Total: $${parseFloat(item.line_total).toFixed(2)})`
        ).join('; ');
      }

      csvData.push([
        estimate.estimate_number || '',
        estimate.client_name || '',
        estimate.client_email || '',
        estimate.client_phone || '',
        estimate.project_address || '',
        estimate.project_type || 'residential',
        estimate.status || 'draft',
        parseFloat(estimate.subtotal || 0).toFixed(2),
        parseFloat(estimate.tax_amount || 0).toFixed(2),
        parseFloat(estimate.total_amount || 0).toFixed(2),
        estimate.notes || '',
        estimate.created_at || '',
        lineItemsText
      ]);
    });

    const csvContent = csvData.map(row => 
      row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `estimates_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast(`Successfully exported ${estimates.length} estimates!`);
  } catch (error) {
    console.error('Error exporting estimates:', error);
    showToast('Error exporting estimates', 'error');
  }
}

function exportProductsCSV() {
  if (!allProducts.length) {
    showToast('No products to export', 'error');
    return;
  }

  const csvHeaders = ['Name', 'SKU', 'Description', 'Unit Cost', 'Category', 'Created At'];
  const csvData = [csvHeaders];

  allProducts.forEach(product => {
    csvData.push([
      product.name || '',
      product.sku || '',
      product.description || '',
      product.unit_cost || '0.00',
      product.category || 'Uncategorized',
      product.created_at || ''
    ]);
  });

  const csvContent = csvData.map(row => 
    row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
  ).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `products_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showToast('Products exported successfully!');
}

function exportPackagesCSV() {
  // This function is implemented in packages.js
  if (typeof window.exportPackagesCSV === 'function') {
    return window.exportPackagesCSV();
  }
  
  // Fallback implementation if packages.js is not loaded
  showToast('Package export functionality not available', 'error');
}

// Import functions
function showEstimateImportForm() {
  document.getElementById('estimateImportModal').classList.remove('hidden');
}

function closeEstimateImportModal() {
  document.getElementById('estimateImportModal').classList.add('hidden');
  document.getElementById('estimateImportFile').value = '';
}

async function importEstimates() {
  const fileInput = document.getElementById('estimateImportFile');
  const file = fileInput.files[0];
  
  if (!file) {
    showToast('Please select a CSV file', 'error');
    return;
  }

  if (!file.name.toLowerCase().endsWith('.csv')) {
    showToast('Please select a CSV file', 'error');
    return;
  }

  try {
    const text = await file.text();
    const lines = text.trim().split('\n');
    
    if (lines.length < 2) {
      showToast('CSV file must have at least a header row and one data row', 'error');
      return;
    }

    // Parse CSV headers
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
    
    // Check for required columns
    const requiredColumns = ['client name', 'total amount'];
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    
    if (missingColumns.length > 0) {
      showToast(`Missing required columns: ${missingColumns.join(', ')}`, 'error');
      return;
    }

    // Parse data rows
    const estimates = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
      
      if (values.length !== headers.length) {
        showToast(`Row ${i + 1}: Column count mismatch`, 'error');
        return;
      }
      
      const estimate = {};
      headers.forEach((header, index) => {
        estimate[header] = values[index];
      });
      
      // Map to expected format
      const formattedEstimate = {
        client_name: estimate['client name'] || '',
        client_email: estimate['client email'] || '',
        client_phone: estimate['client phone'] || '',
        project_address: estimate['project address'] || '',
        project_type: estimate['project type'] || 'residential',
        status: estimate['status'] || 'draft',
        subtotal: parseFloat(estimate['subtotal'] || estimate['total amount'] || 0),
        tax_amount: parseFloat(estimate['tax amount'] || 0),
        total_amount: parseFloat(estimate['total amount'] || 0),
        notes: estimate['notes'] || ''
      };
      
      // Validate required fields
      if (!formattedEstimate.client_name || formattedEstimate.total_amount <= 0) {
        showToast(`Row ${i + 1}: Client name and valid total amount are required`, 'error');
        return;
      }
      
      estimates.push(formattedEstimate);
    }

    if (estimates.length === 0) {
      showToast('No valid estimates found in CSV', 'error');
      return;
    }

    // Send to API
    const response = await fetch('api.php?action=import_estimates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estimates: estimates })
    });

    const result = await response.json();
    if (result.success) {
      showToast(`Successfully imported ${result.imported} estimates!`);
      closeEstimateImportModal();
      loadEstimateHistory();
    } else {
      showToast('Import failed: ' + (result.error || 'Unknown error'), 'error');
      if (result.errors && result.errors.length > 0) {
        console.log('Import errors:', result.errors);
      }
    }
  } catch (error) {
    console.error('Error importing estimates:', error);
    showToast('Error parsing CSV file', 'error');
  }
}

function showImportForm() {
  document.getElementById('productImportModal').classList.remove('hidden');
}

function closeImportModal() {
  document.getElementById('productImportModal').classList.add('hidden');
  document.getElementById('productImportFile').value = '';
}

async function importProducts() {
  const fileInput = document.getElementById('productImportFile');
  const file = fileInput.files[0];
  
  if (!file) {
    showToast('Please select a CSV file', 'error');
    return;
  }

  if (!file.name.toLowerCase().endsWith('.csv')) {
    showToast('Please select a CSV file', 'error');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('action', 'import_products');

  try {
    const response = await fetch('api.php', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    if (result.success) {
      showToast(`Successfully imported ${result.count} products!`);
      closeImportModal();
      loadProductsServices();
    } else {
      showToast('Import failed: ' + (result.error || 'Unknown error'), 'error');
    }
  } catch (error) {
    console.error('Error importing products:', error);
    showToast('Error importing products', 'error');
  }
}

function showPackageImportForm() {
  // This function is implemented in packages.js
  if (typeof window.showPackageImportForm === 'function') {
    return window.showPackageImportForm();
  }
  
  // Fallback implementation if packages.js is not loaded
  showToast('Package import functionality not available', 'error');
}

// Use in Estimate functionality
function useInEstimate(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) {
    showToast('Product not found', 'error');
    return;
  }

  // Switch to estimate section
  showSection('estimate');

  // Add a slight delay to ensure the section loads before adding the line item
  setTimeout(() => {
    // Add a new line item with product data
    const container = document.getElementById('lineItemsList');
    const itemId = `lineItem${lineItemCounter++}`;

    const lineItem = document.createElement('div');
    lineItem.className = 'line-item';
    lineItem.id = itemId;
    lineItem.innerHTML = `
      <input type="text" placeholder="Description" onchange="calculateTotals()" class="w-full px-2 py-1 border border-gray-300 rounded text-sm" value="${product.name}">
      <input type="number" min="1" value="1" onchange="calculateTotals()" class="w-full px-2 py-1 border border-gray-300 rounded text-sm">
      <input type="number" step="0.01" min="0" placeholder="0.00" onchange="calculateTotals()" class="w-full px-2 py-1 border border-gray-300 rounded text-sm" value="${parseFloat(product.unit_cost || 0).toFixed(2)}">
      <select onchange="updateMarkup('${itemId}'); calculateTotals()" class="w-full px-2 py-1 border border-gray-300 rounded text-sm">
        <option value="hardware" ${getCategoryType(product.category_id) === 'hardware' ? 'selected' : ''}>Hardware</option>
        <option value="parts_materials" ${getCategoryType(product.category_id) === 'parts_materials' ? 'selected' : ''}>Parts/Materials</option>
        <option value="labor" ${getCategoryType(product.category_id) === 'labor' ? 'selected' : ''}>Labor</option>
      </select>
      <input type="number" step="0.01" min="0" readonly class="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100">
      <span class="line-total text-sm font-semibold">$0.00</span>
      <button type="button" onclick="removeLineItem('${itemId}')" class="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded">Remove</button>
    `;

    container.appendChild(lineItem);
    updateMarkup(itemId);
    calculateTotals();

    // Show success message
    showToast(`${product.name} added to estimate`);
  }, 100);
}

// Helper function to determine category type based on product category
function getCategoryType(categoryId) {
  const category = productCategories.find(cat => cat.id == categoryId);
  if (!category) return 'hardware';
  
  const categoryName = category.name.toLowerCase();
  
  if (categoryName.includes('labor') || categoryName.includes('service')) {
    return 'labor';
  } else if (categoryName.includes('hardware') || categoryName.includes('equipment') || categoryName.includes('device')) {
    return 'hardware';
  } else {
    return 'parts_materials';
  }
}

// User Profile Dropdown Functions
function toggleUserDropdown() {
  const dropdown = document.getElementById('userDropdown');
  userDropdownOpen = !userDropdownOpen;
  
  if (userDropdownOpen) {
    dropdown.classList.remove('hidden');
    // Close dropdown when clicking outside
    document.addEventListener('click', closeUserDropdownOnOutsideClick);
  } else {
    dropdown.classList.add('hidden');
    document.removeEventListener('click', closeUserDropdownOnOutsideClick);
  }
}

function closeUserDropdown() {
  const dropdown = document.getElementById('userDropdown');
  dropdown.classList.add('hidden');
  userDropdownOpen = false;
  document.removeEventListener('click', closeUserDropdownOnOutsideClick);
}

function closeUserDropdownOnOutsideClick(event) {
  const dropdown = document.getElementById('userDropdown');
  const button = document.getElementById('user-menu-button');
  
  if (!dropdown.contains(event.target) && !button.contains(event.target)) {
    closeUserDropdown();
  }
}

// User Profile Functions
function showUserProfile() {
  if (!currentUser) {
    showToast('User data not available', 'error');
    return;
  }
  
  // Populate profile form with current user data
  document.getElementById('profileFirstName').value = currentUser.first_name || '';
  document.getElementById('profileLastName').value = currentUser.last_name || '';
  document.getElementById('profileUsername').value = currentUser.username || '';
  document.getElementById('profileEmail').value = currentUser.email || '';
  
  // Clear password fields
  document.getElementById('currentPassword').value = '';
  document.getElementById('newPassword').value = '';
  document.getElementById('confirmNewPassword').value = '';
  
  // Show modal
  document.getElementById('userProfileModal').classList.remove('hidden');
}

function closeUserProfileModal() {
  document.getElementById('userProfileModal').classList.add('hidden');
}

async function saveUserProfile() {
  const firstName = document.getElementById('profileFirstName').value.trim();
  const lastName = document.getElementById('profileLastName').value.trim();
  const email = document.getElementById('profileEmail').value.trim();
  
  if (!email) {
    showToast('Email is required', 'error');
    return;
  }
  
  // Show loading state
  const btn = document.getElementById('updateProfileBtn');
  const btnText = document.getElementById('updateProfileBtnText');
  const btnSpinner = document.getElementById('updateProfileBtnSpinner');
  
  btn.disabled = true;
  btn.classList.add('opacity-75', 'cursor-not-allowed');
  btnText.textContent = 'Updating...';
  btnSpinner.classList.remove('hidden');
  
  try {
    const response = await fetch('api.php?action=update_profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email: email
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Update current user data
      currentUser.first_name = firstName;
      currentUser.last_name = lastName;
      currentUser.email = email;
      
      // Update user initials display
      updateUserDisplay();
      
      showToast('Profile updated successfully!');
      
      // Brief success state
      btnText.textContent = 'Updated!';
      setTimeout(() => {
        btnText.textContent = 'Update Profile';
      }, 1500);
    } else {
      showToast('Error updating profile: ' + (result.error || 'Unknown error'), 'error');
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    showToast('Error updating profile', 'error');
  } finally {
    // Reset button state
    btn.disabled = false;
    btn.classList.remove('opacity-75', 'cursor-not-allowed');
    btnSpinner.classList.add('hidden');
    if (btnText.textContent === 'Updating...') {
      btnText.textContent = 'Update Profile';
    }
  }
}

async function changeUserPassword() {
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmNewPassword = document.getElementById('confirmNewPassword').value;
  
  if (!currentPassword || !newPassword || !confirmNewPassword) {
    showToast('All password fields are required', 'error');
    return;
  }
  
  if (newPassword !== confirmNewPassword) {
    showToast('New passwords do not match', 'error');
    return;
  }
  
  if (newPassword.length < 6) {
    showToast('New password must be at least 6 characters long', 'error');
    return;
  }
  
  // Show loading state
  const btn = document.getElementById('changePasswordBtn');
  const btnText = document.getElementById('changePasswordBtnText');
  const btnSpinner = document.getElementById('changePasswordBtnSpinner');
  
  btn.disabled = true;
  btn.classList.add('opacity-75', 'cursor-not-allowed');
  btnText.textContent = 'Changing...';
  btnSpinner.classList.remove('hidden');
  
  try {
    const response = await fetch('api.php?action=change_password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Clear password fields
      document.getElementById('currentPassword').value = '';
      document.getElementById('newPassword').value = '';
      document.getElementById('confirmNewPassword').value = '';
      
      showToast('Password changed successfully!');
      
      // Brief success state
      btnText.textContent = 'Changed!';
      setTimeout(() => {
        btnText.textContent = 'Change Password';
      }, 1500);
    } else {
      showToast('Error changing password: ' + (result.error || 'Unknown error'), 'error');
    }
  } catch (error) {
    console.error('Error changing password:', error);
    showToast('Error changing password', 'error');
  } finally {
    // Reset button state
    btn.disabled = false;
    btn.classList.remove('opacity-75', 'cursor-not-allowed');
    btnSpinner.classList.add('hidden');
    if (btnText.textContent === 'Changing...') {
      btnText.textContent = 'Change Password';
    }
  }
}

// Update user display in header
function updateUserDisplay() {
  // With the new person icon design, no dynamic updates are needed
  // The profile icon is now a static SVG person icon
  // Show/hide admin navigation based on user admin status
  if (currentUser && currentUser.is_admin) {
    const adminDropdownLink = document.getElementById('adminDropdownLink');
    const adminMobileLink = document.getElementById('adminMobileLink');
    if (adminDropdownLink) adminDropdownLink.classList.remove('hidden');
    if (adminMobileLink) adminMobileLink.classList.remove('hidden');
  } else {
    const adminDropdownLink = document.getElementById('adminDropdownLink');
    const adminMobileLink = document.getElementById('adminMobileLink');
    if (adminDropdownLink) adminDropdownLink.classList.add('hidden');
    if (adminMobileLink) adminMobileLink.classList.add('hidden');
  }
  console.log('User display updated for:', currentUser?.username || 'Unknown user');
}

// Initialize
document.addEventListener('DOMContentLoaded', function () {
  // Check authentication status first
  checkAuth().then(isAuthenticated => {
    if (isAuthenticated) {
      // Add initial line item after a short delay to ensure settings are available
      setTimeout(() => {
        addLineItem();
      }, 100);
    }
  });

  // Initialize footer with default values
  updateFooter();

  // Enter key handlers for login forms
  const loginUsernameInput = document.getElementById('loginUsername');
  const loginPasswordInput = document.getElementById('loginPassword');
  
  if (loginUsernameInput) {
    loginUsernameInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        loginPasswordInput.focus();
      }
    });
  }
  
  if (loginPasswordInput) {
    loginPasswordInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        login();
      }
    });
  }
  
  // Enter key handlers for registration form
  const registerInputs = [
    'registerFirstName', 'registerLastName', 'registerUsername',
    'registerEmail', 'registerPassword', 'registerConfirmPassword'
  ];
  
  registerInputs.forEach((inputId, index) => {
    const input = document.getElementById(inputId);
    if (input) {
      input.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
          if (index === registerInputs.length - 1) {
            // Last input, trigger registration
            register();
          } else {
            // Move to next input
            const nextInput = document.getElementById(registerInputs[index + 1]);
            if (nextInput) nextInput.focus();
          }
        }
      });
    }
  });
});

// Admin User Management Functions
async function loadUsersForAdmin() {
  if (!currentUser || !currentUser.is_admin) {
    showToast('Access denied: Admin privileges required', 'error');
    showSection('estimate');
    return;
  }

  try {
    const response = await fetch('api.php?action=get_all_users');
    const result = await response.json();
    
    if (result.success && result.users) {
      renderUsersTable(result.users);
    } else {
      showToast('Error loading users: ' + (result.error || 'Unknown error'), 'error');
    }
  } catch (error) {
    console.error('Error loading users:', error);
    showToast('Error loading users', 'error');
  }
}

function renderUsersTable(users) {
  const container = document.getElementById('usersList');
  
  if (!users.length) {
    container.innerHTML = '<div class="text-center py-8 text-gray-500">No users found</div>';
    return;
  }

  const tableHTML = `
    <table class="w-full border-collapse border border-gray-300">
      <thead>
        <tr class="bg-gray-50">
          <th class="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">ID</th>
          <th class="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Username</th>
          <th class="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
          <th class="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
          <th class="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Role</th>
          <th class="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
          <th class="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Last Login</th>
          <th class="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700">Actions</th>
        </tr>
      </thead>
      <tbody>
        ${users.map(user => `
          <tr class="hover:bg-gray-50">
            <td class="border border-gray-300 px-4 py-3 text-sm font-mono">${user.id}</td>
            <td class="border border-gray-300 px-4 py-3 text-sm font-medium">${user.username}</td>
            <td class="border border-gray-300 px-4 py-3 text-sm">${(user.first_name || '') + ' ' + (user.last_name || '').trim() || 'N/A'}</td>
            <td class="border border-gray-300 px-4 py-3 text-sm">${user.email || 'N/A'}</td>
            <td class="border border-gray-300 px-4 py-3 text-sm">
              <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                user.is_admin ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
              }">
                ${user.is_admin ? 'Admin' : 'User'}
              </span>
            </td>
            <td class="border border-gray-300 px-4 py-3 text-sm">
              <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }">
                ${user.is_active ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td class="border border-gray-300 px-4 py-3 text-sm text-gray-500">
              ${user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
            </td>
            <td class="border border-gray-300 px-4 py-3 text-center">
              <div class="flex justify-center space-x-2">
                ${user.is_active ? `
                  <button onclick="deactivateUser(${user.id}, '${user.username}')" 
                          class="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded transition-colors duration-200"
                          ${user.id === currentUser.id ? 'disabled title="Cannot deactivate yourself"' : ''}>
                    Deactivate
                  </button>
                ` : `
                  <button onclick="activateUser(${user.id}, '${user.username}')" 
                          class="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded transition-colors duration-200">
                    Activate
                  </button>
                `}
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  container.innerHTML = tableHTML;
}

async function deactivateUser(userId, username) {
  if (userId === currentUser.id) {
    showToast('You cannot deactivate yourself', 'error');
    return;
  }

  showConfirmation(
    `Are you sure you want to deactivate user "${username}"? They will no longer be able to log in.`,
    async () => {
      try {
        const response = await fetch('api.php?action=deactivate_user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId })
        });

        const result = await response.json();
        if (result.success) {
          showToast(`User "${username}" has been deactivated`);
          loadUsersForAdmin(); // Refresh the user list
        } else {
          showToast('Error deactivating user: ' + (result.error || 'Unknown error'), 'error');
        }
      } catch (error) {
        console.error('Error deactivating user:', error);
        showToast('Error deactivating user', 'error');
      }
    }
  );
}

async function activateUser(userId, username) {
  try {
    const response = await fetch('api.php?action=activate_user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId })
    });

    const result = await response.json();
    if (result.success) {
      showToast(`User "${username}" has been activated`);
      loadUsersForAdmin(); // Refresh the user list
    } else {
      showToast('Error activating user: ' + (result.error || 'Unknown error'), 'error');
    }
  } catch (error) {
    console.error('Error activating user:', error);
    showToast('Error activating user', 'error');
  }
}
