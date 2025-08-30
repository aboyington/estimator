// Complete JavaScript functionality for the Tailwind Estimator

let settings = {};
let lineItemCounter = 0;
let productCategories = [];
let productSort = { column: 'name', direction: 'asc' };
let editingProductId = null;
let allProducts = [];
let currentPage = 1;
const itemsPerPage = 20;
let allPackages = [];
let packageCategories = [];
let editingPackageId = null;
let currentPackagePage = 1;
const packagesPerPage = 10;
let packageSort = { column: 'name', direction: 'asc' };
let packageLineItemCounter = 0;

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

// Authentication
async function login() {
  const password = document.getElementById('passwordInput').value;
  console.log('Attempting login...');

  try {
    const response = await fetch('api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `action=login&password=${encodeURIComponent(password)}`,
    });

    console.log('Response status:', response.status);
    const result = await response.json();
    console.log('Response data:', result);

    if (result.success) {
      document.getElementById('loginScreen').classList.add('hidden');
      document.getElementById('mainApp').classList.remove('hidden');
      loadSettings();
      loadEstimateHistory();
    } else {
      document.getElementById('loginError').textContent =
        result.error || 'Login failed';
      document.getElementById('loginError').classList.remove('hidden');
    }
  } catch (error) {
    console.error('Login error:', error);
    document.getElementById('loginError').textContent =
      'Connection error';
    document.getElementById('loginError').classList.remove('hidden');
  }
}

async function logout() {
  await fetch('api.php?action=logout');
  location.reload();
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
      loadPackages();
    } else if (section === 'settings') {
      loadProductCategories();
      loadPackageCategories();
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

// Placeholder functions for remaining functionality
async function viewEstimate(id) {
  // Implementation here
}

async function editEstimate(id) {
  // Implementation here
}

async function deleteEstimate(id) {
  // Implementation here
}

async function updateEstimateStatus(id, status) {
  // Implementation here
}

// Product functions
async function loadProductsServices() {
  // Implementation here
}

// Package functions
async function loadPackages() {
  // Implementation here
}

// Category management
async function loadProductCategories() {
  // Implementation here
}

async function loadPackageCategories() {
  // Implementation here
}

async function addCategory() {
  // Implementation here
}

// Export functions
function exportEstimatesCSV() {
  // Implementation here
}

function exportProductsCSV() {
  // Implementation here
}

function exportPackagesCSV() {
  // Implementation here
}

// Import functions
function showEstimateImportForm() {
  // Implementation here
}

function showImportForm() {
  // Implementation here
}

function showPackageImportForm() {
  // Implementation here
}

// Initialize
document.addEventListener('DOMContentLoaded', function () {
  // Add initial line item after a short delay to ensure settings are available
  setTimeout(() => {
    addLineItem();
  }, 100);

  // Enter key for login
  document
    .getElementById('passwordInput')
    .addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        login();
      }
    });
});
