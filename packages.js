// packages.js - Packages Management Functions for Estimator

// Global variables for packages (moved from tailwind-app.js to avoid conflicts)
let allPackages = [];
let packageCategories = [];
let editingPackageId = null;
let currentPackagePage = 1;
const packagesPerPage = 10;
let packageSort = { column: 'name', direction: 'asc' };

// ===== PACKAGES MANAGEMENT FUNCTIONS =====

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

async function loadPackageCategories() {
    try {
        const response = await fetch('api.php?action=get_package_categories');
        packageCategories = await response.json();
        console.log('Package categories loaded:', packageCategories);
        
        // Call both the filter population and the list rendering
        populatePackageCategoryFilters();
        
        // Check if renderPackageCategoryList function exists (from main HTML)
        if (typeof renderPackageCategoryList === 'function') {
            renderPackageCategoryList();
        }
    } catch (error) {
        console.error('Error loading package categories:', error);
    }
}

function populatePackageCategoryFilters() {
    const categoryFilter = document.getElementById('packageCategoryFilter');
    if (!categoryFilter) return;
    
    const currentVal = categoryFilter.value;
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    
    packageCategories.forEach((cat) => {
        categoryFilter.innerHTML += `<option value="${cat.name}">${cat.label}</option>`;
    });
    
    categoryFilter.value = currentVal;
}

function showAddPackageForm() {
    editingPackageId = null;
    document.getElementById('addPackageFormContainer').style.display = 'block';
    document.getElementById('addPackageFormTitle').textContent = 'Add New Package';
    
    const form = `
        <div class="form-row">
            <div class="form-group">
                <label>Package Name *</label>
                <input type="text" id="packageName" required placeholder="e.g., 4 Camera System Basic">
            </div>
            <div class="form-group">
                <label>Category</label>
                <select id="packageCategory">
                    ${packageCategories.map(c => `<option value="${c.name}">${c.label}</option>`).join('')}
                </select>
            </div>
        </div>
        <div class="form-group">
            <label>Description</label>
            <textarea id="packageDescription" rows="3" placeholder="Describe what's included in this package..."></textarea>
        </div>
        
        <div class="form-section">
            <h4 class="form-section-header">Package Line Items</h4>
            <div class="line-items">
                <div class="line-item line-item-header">
                    <div>Description</div>
                    <div>Qty</div>
                    <div>Unit Cost</div>
                    <div>Category</div>
                    <div>Markup %</div>
                    <div>Total</div>
                    <div>Action</div>
                </div>
                <div id="packageLineItemsList"></div>
                <button type="button" onclick="addPackageLineItem()" class="btn btn-secondary">
                    Add Line Item
                </button>
            </div>
        </div>
        
        <div style="margin-top: 1rem;">
            <button onclick="savePackage()" class="btn">Save Package</button>
            <button onclick="cancelAddPackage()" class="btn btn-secondary">Cancel</button>
        </div>
    `;
    
    document.getElementById('addPackageForm').innerHTML = form;
    
    // Add initial line item
    addPackageLineItem();
}

function cancelAddPackage() {
    editingPackageId = null;
    document.getElementById('addPackageFormContainer').style.display = 'none';
}

let packageLineItemCounter = 0;

function addPackageLineItem() {
    const container = document.getElementById('packageLineItemsList');
    const itemId = `packageLineItem${packageLineItemCounter++}`;
    
    const lineItem = document.createElement('div');
    lineItem.className = 'line-item';
    lineItem.id = itemId;
    lineItem.innerHTML = `
        <input type="text" placeholder="Description" onchange="calculatePackageTotals()">
        <input type="number" min="1" value="1" onchange="calculatePackageTotals()">
        <input type="number" step="0.01" min="0" placeholder="0.00" onchange="calculatePackageTotals()">
        <select onchange="updatePackageLineItemMarkup('${itemId}'); calculatePackageTotals()">
            <option value="hardware">Hardware</option>
            <option value="parts_materials">Parts/Materials</option>
            <option value="labor">Labor</option>
        </select>
        <input type="number" step="0.01" min="0" readonly>
        <span class="line-total">$0.00</span>
        <button type="button" onclick="removePackageLineItem('${itemId}')" class="btn btn-danger">Remove</button>
    `;
    
    container.appendChild(lineItem);
    updatePackageLineItemMarkup(itemId);
}

function removePackageLineItem(itemId) {
    document.getElementById(itemId).remove();
    calculatePackageTotals();
}

function updatePackageLineItemMarkup(itemId) {
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

function calculatePackageTotals() {
    let total = 0;
    
    document.querySelectorAll('#packageLineItemsList .line-item').forEach((item) => {
        const inputs = item.querySelectorAll('input');
        const quantity = parseFloat(inputs[1].value || 0);
        const unitCost = parseFloat(inputs[2].value || 0);
        const markupPercent = parseFloat(inputs[3].value || 0);
        
        const lineTotal = quantity * unitCost * (1 + markupPercent / 100);
        item.querySelector('.line-total').textContent = `$${lineTotal.toFixed(2)}`;
        total += lineTotal;
    });
    
    return total;
}

async function savePackage() {
    const name = document.getElementById('packageName').value.trim();
    const category = document.getElementById('packageCategory').value;
    const description = document.getElementById('packageDescription').value.trim();
    
    if (!name) {
        showToast('Please enter a package name', 'error');
        return;
    }
    
    const lineItems = [];
    document.querySelectorAll('#packageLineItemsList .line-item').forEach((item, index) => {
        const inputs = item.querySelectorAll('input');
        const select = item.querySelector('select');
        
        if (inputs[0].value.trim()) {
            lineItems.push({
                description: inputs[0].value,
                quantity: parseInt(inputs[1].value || 1),
                unit_cost: parseFloat(inputs[2].value || 0),
                category: select.value,
                markup_percent: parseFloat(inputs[3].value || 0),
                line_total: parseFloat(item.querySelector('.line-total').textContent.replace('$', '')),
                sort_order: index + 1
            });
        }
    });
    
    if (lineItems.length === 0) {
        showToast('Please add at least one line item to the package', 'error');
        return;
    }
    
    const packageData = {
        name,
        description,
        category,
        base_price: calculatePackageTotals(),
        status: 'active',
        line_items: lineItems
    };
    
    try {
        let response;
        if (editingPackageId) {
            packageData.id = editingPackageId;
            response = await fetch('api.php?action=update_package', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(packageData)
            });
        } else {
            response = await fetch('api.php?action=save_package', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(packageData)
            });
        }
        
        const result = await response.json();
        if (result.success) {
            showToast(editingPackageId ? 'Package updated successfully!' : 'Package saved successfully!');
            cancelAddPackage();
            loadPackages();
        } else {
            showToast('Error saving package: ' + (result.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Error saving package:', error);
        showToast('Error saving package', 'error');
    }
}

async function editPackage(id) {
    try {
        const response = await fetch(`api.php?action=get_package&id=${id}`);
        const packageData = await response.json();
        
        if (packageData && packageData.name) {
            editingPackageId = id;
            document.getElementById('addPackageFormContainer').style.display = 'block';
            document.getElementById('addPackageFormTitle').textContent = 'Edit Package';
            
            // Populate form with existing data
            showAddPackageForm();
            
            // Wait for form to render then populate
            setTimeout(() => {
                document.getElementById('packageName').value = packageData.name || '';
                document.getElementById('packageCategory').value = packageData.category || 'camera_systems';
                document.getElementById('packageDescription').value = packageData.description || '';
                
                // Clear existing line items
                document.getElementById('packageLineItemsList').innerHTML = '';
                
                // Add line items from package
                if (packageData.line_items && packageData.line_items.length > 0) {
                    packageData.line_items.forEach((item) => {
                        addPackageLineItem();
                        const lineItemsList = document.getElementById('packageLineItemsList');
                        const lastItem = lineItemsList.lastElementChild;
                        const inputs = lastItem.querySelectorAll('input');
                        const select = lastItem.querySelector('select');
                        
                        inputs[0].value = item.description || '';
                        inputs[1].value = item.quantity || 1;
                        inputs[2].value = item.unit_cost || 0;
                        select.value = item.category || 'hardware';
                        inputs[3].value = item.markup_percent || 0;
                        
                        // Update the line total display
                        lastItem.querySelector('.line-total').textContent = `$${parseFloat(item.line_total || 0).toFixed(2)}`;
                    });
                } else {
                    addPackageLineItem(); // Add one empty line item
                }
            }, 100);
        } else {
            showToast('Error loading package data', 'error');
        }
    } catch (error) {
        console.error('Error loading package for edit:', error);
        showToast('Error loading package for editing', 'error');
    }
}

async function deletePackage(id) {
    showConfirmation('Are you sure you want to delete this package? This action cannot be undone.', async () => {
        try {
            const response = await fetch(`api.php?action=delete_package&id=${id}`, {
                method: 'POST'
            });
            
            const result = await response.json();
            if (result.success) {
                showToast('Package deleted successfully!');
                loadPackages();
            } else {
                showToast('Error deleting package: ' + (result.error || 'Unknown error'), 'error');
            }
        } catch (error) {
            console.error('Error deleting package:', error);
            showToast('Error deleting package', 'error');
        }
    });
}

async function duplicatePackage(id) {
    try {
        const response = await fetch('api.php?action=duplicate_package', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `id=${id}`
        });
        
        const result = await response.json();
        if (result.success) {
            showToast(`Package duplicated as "${result.name}"`);
            loadPackages();
        } else {
            showToast('Error duplicating package: ' + (result.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Error duplicating package:', error);
        showToast('Error duplicating package', 'error');
    }
}

function usePackageInEstimate(packageId) {
    // First get the package details
    fetch(`api.php?action=get_package&id=${packageId}`)
        .then(response => response.json())
        .then(packageData => {
            if (packageData && packageData.line_items) {
                // Switch to estimate section
                showSection('estimate');
                
                // Add each line item from the package
                packageData.line_items.forEach(item => {
                    addLineItem();
                    
                    // Get the last added line item and populate it
                    const lineItemsList = document.getElementById('lineItemsList');
                    const lastItem = lineItemsList.lastElementChild;
                    const inputs = lastItem.querySelectorAll('input');
                    const select = lastItem.querySelector('select');
                    
                    inputs[0].value = item.description || '';
                    inputs[1].value = item.quantity || 1;
                    inputs[2].value = item.unit_cost || 0;
                    select.value = item.category || 'hardware';
                    inputs[3].value = item.markup_percent || 0;
                    
                    // Update markup and calculate line total
                    updateMarkup(lastItem.id);
                });
                
                // Calculate totals
                calculateTotals();
                
                showToast(`Package "${packageData.name}" added to estimate!`);
            } else {
                showToast('Error loading package data', 'error');
            }
        })
        .catch(error => {
            console.error('Error using package in estimate:', error);
            showToast('Error adding package to estimate', 'error');
        });
}

// Filter and Search Functions for Packages
function filterPackages(page = 1) {
    currentPackagePage = page;
    const searchQuery = document.getElementById('packageSearchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('packageCategoryFilter').value;
    
    let filtered = [...allPackages];
    
    // Sorting
    filtered.sort((a, b) => {
        let valA = a[packageSort.column];
        let valB = b[packageSort.column];
        
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        
        if (valA < valB) return packageSort.direction === 'asc' ? -1 : 1;
        if (valA > valB) return packageSort.direction === 'asc' ? 1 : -1;
        return 0;
    });
    
    // Filtering
    filtered = filtered.filter((packageItem) => {
        const matchesSearch = packageItem.name.toLowerCase().includes(searchQuery) ||
            (packageItem.description && packageItem.description.toLowerCase().includes(searchQuery));
        const matchesCategory = categoryFilter === 'all' || packageItem.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });
    
    const totalPages = Math.ceil(filtered.length / packagesPerPage);
    const startIndex = (currentPackagePage - 1) * packagesPerPage;
    const paginatedPackages = filtered.slice(startIndex, startIndex + packagesPerPage);
    
    const container = document.getElementById('packagesList');
    
    if (paginatedPackages.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; margin: 2rem 0;">No matching packages found.</p>';
        updatePackageFilterStatus(0, allPackages.length, searchQuery, categoryFilter);
        return;
    }
    
    const tableHTML = `
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: #f8f9fa;">
                    <th class="sortable ${packageSort.column === 'name' ? 'sort-' + packageSort.direction : ''}" 
                        style="padding: 1rem; border: 1px solid #ddd; text-align: left;" 
                        onclick="updatePackageSort('name')">Package Name</th>
                    <th class="sortable ${packageSort.column === 'category' ? 'sort-' + packageSort.direction : ''}" 
                        style="padding: 1rem; border: 1px solid #ddd; text-align: left;" 
                        onclick="updatePackageSort('category')">Category</th>
                    <th style="padding: 1rem; border: 1px solid #ddd; text-align: left;">Description</th>
                    <th class="sortable ${packageSort.column === 'base_price' ? 'sort-' + packageSort.direction : ''}" 
                        style="padding: 1rem; border: 1px solid #ddd; text-align: left;" 
                        onclick="updatePackageSort('base_price')">Est. Price</th>
                    <th style="padding: 1rem; border: 1px solid #ddd; text-align: left;">Actions</th>
                </tr>
            </thead>
            <tbody>
                ${paginatedPackages.map(pkg => {
                    const shortDesc = (pkg.description || '').length > 60 
                        ? (pkg.description || '').substring(0, 60) + '...' 
                        : pkg.description || '';
                    const categoryLabel = packageCategories.find(cat => cat.name === pkg.category)?.label || pkg.category;
                    
                    return `
                        <tr>
                            <td style="padding: 1rem; border: 1px solid #ddd;"><strong>${pkg.name}</strong></td>
                            <td style="padding: 1rem; border: 1px solid #ddd;">${categoryLabel}</td>
                            <td style="padding: 1rem; border: 1px solid #ddd;">${shortDesc}</td>
                            <td style="padding: 1rem; border: 1px solid #ddd;">$${parseFloat(pkg.base_price || 0).toFixed(2)}</td>
                            <td style="padding: 1rem; border: 1px solid #ddd;">
                                <div class="flex flex-col space-y-1">
                                    <div class="flex space-x-1">
                                        <button onclick="editPackage(${pkg.id})" class="bg-gray-600 hover:bg-gray-700 text-white text-xs px-2 py-1 rounded transition-colors duration-200">Edit</button>
                                        <button onclick="duplicatePackage(${pkg.id})" class="bg-gray-600 hover:bg-gray-700 text-white text-xs px-2 py-1 rounded transition-colors duration-200">Duplicate</button>
                                        <button onclick="deletePackage(${pkg.id})" class="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded transition-colors duration-200">Delete</button>
                                    </div>
                                    <button onclick="usePackageInEstimate(${pkg.id})" class="bg-udora-600 hover:bg-udora-700 text-white text-xs px-2 py-1 rounded w-full transition-colors duration-200">Use in Estimate</button>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
    
    const paginationHTML = totalPages > 1 ? `
        <div class="pagination">
            <button onclick="changePackagePage(1)" ${currentPackagePage === 1 ? 'disabled' : ''}>&laquo; First</button>
            <button onclick="changePackagePage(${currentPackagePage - 1})" ${currentPackagePage === 1 ? 'disabled' : ''}>&lsaquo; Prev</button>
            <span class="page-info">Page ${currentPackagePage} of ${totalPages}</span>
            <button onclick="changePackagePage(${currentPackagePage + 1})" ${currentPackagePage === totalPages ? 'disabled' : ''}>Next &rsaquo;</button>
            <button onclick="changePackagePage(${totalPages})" ${currentPackagePage === totalPages ? 'disabled' : ''}>Last &raquo;</button>
        </div>
    ` : '';
    
    container.innerHTML = tableHTML + paginationHTML;
    
    updatePackageFilterStatus(filtered.length, allPackages.length, searchQuery, categoryFilter);
}

function updatePackageSort(column) {
    if (packageSort.column === column) {
        packageSort.direction = packageSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        packageSort.column = column;
        packageSort.direction = 'asc';
    }
    filterPackages();
}

function changePackagePage(page) {
    const totalPages = Math.ceil(getFilteredPackages().length / packagesPerPage);
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    filterPackages(page);
}

function getFilteredPackages() {
    const searchQuery = document.getElementById('packageSearchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('packageCategoryFilter').value;
    
    return allPackages.filter((packageItem) => {
        const matchesSearch = packageItem.name.toLowerCase().includes(searchQuery) ||
            (packageItem.description && packageItem.description.toLowerCase().includes(searchQuery));
        const matchesCategory = categoryFilter === 'all' || packageItem.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });
}

function clearPackageFilters() {
    document.getElementById('packageSearchInput').value = '';
    document.getElementById('packageCategoryFilter').value = 'all';
    filterPackages();
}

function updatePackageFilterStatus(filteredCount, totalCount, searchQuery, categoryFilter) {
    const statusElement = document.getElementById('packageFilterStatus');
    if (!statusElement) return;
    
    let statusText = `Showing ${filteredCount} of ${totalCount} packages`;
    
    if (searchQuery || categoryFilter !== 'all') {
        const filters = [];
        if (searchQuery) filters.push(`search: "${searchQuery}"`);
        if (categoryFilter !== 'all') {
            const categoryLabel = packageCategories.find(cat => cat.name === categoryFilter)?.label || categoryFilter;
            filters.push(`category: ${categoryLabel}`);
        }
        statusText += ` (filtered by ${filters.join(', ')})`;
    }
    
    statusElement.textContent = statusText;
}

// CSV Export for Packages
function exportPackagesCSV() {
    fetch('api.php?action=get_packages')
        .then(response => response.json())
        .then(packages => {
            const escapeCSV = (value) => {
                if (value === null || value === undefined) return '';
                const stringValue = String(value);
                if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                    return '"' + stringValue.replace(/"/g, '""') + '"';
                }
                return stringValue;
            };
            
            const csvContent = 'data:text/csv;charset=utf-8,' +
                ['Package Name,Category,Description,Base Price,Status']
                .concat(packages.map(p => 
                    `${escapeCSV(p.name)},${escapeCSV(p.category)},${escapeCSV(p.description || '')},${escapeCSV(p.base_price)},${escapeCSV(p.status)}`
                ))
                .join('\n');
            
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', `packages_export_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showToast('Packages exported successfully!');
        })
        .catch(error => {
            console.error('Error exporting packages:', error);
            showToast('Error exporting packages', 'error');
        });
}

// CSV Import for Packages
function showPackageImportForm() {
    document.getElementById('packageImportFormContainer').style.display = 'block';
    const form = `
        <div class="form-group">
            <label>Select CSV File</label>
            <input type="file" id="packageCsvFileInput" accept=".csv" style="margin-bottom: 1rem;">
            <div style="font-size: 0.9rem; color: #666; margin-bottom: 1rem;">
                <strong>CSV Format:</strong> Package Name, Category, Description, Base Price, Status<br>
                <strong>Categories:</strong> ${packageCategories.map(c => c.name).join(', ')}
            </div>
        </div>
        <div style="margin-top: 1rem;">
            <button onclick="importPackagesCSV()" class="btn">Import Packages</button>
            <button onclick="cancelPackageImport()" class="btn btn-secondary">Cancel</button>
        </div>
    `;
    document.getElementById('packageImportForm').innerHTML = form;
}

function cancelPackageImport() {
    document.getElementById('packageImportFormContainer').style.display = 'none';
}

function importPackagesCSV() {
    const fileInput = document.getElementById('packageCsvFileInput');
    if (!fileInput.files.length) {
        showToast('Please select a CSV file to import.', 'error');
        return;
    }
    
    const file = fileInput.files[0];
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
        showToast('Please select a CSV file', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = async function(event) {
        try {
            const csvData = event.target.result;
            const lines = csvData.trim().split('\n');
            
            if (lines.length < 2) {
                showToast('CSV file must have at least a header row and one data row', 'error');
                return;
            }
            
            // Parse CSV headers (assuming first row is headers)
            const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
            
            // Check for required columns
            const requiredColumns = ['package name', 'name'];
            const hasRequiredColumn = requiredColumns.some(col => headers.includes(col));
            
            if (!hasRequiredColumn) {
                showToast('CSV must have at least "Package Name" or "Name" column', 'error');
                return;
            }
            
            // Parse data rows
            const packages = [];
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
                
                if (values.length < headers.length) {
                    // Skip rows with insufficient data
                    continue;
                }
                
                const packageObj = {};
                headers.forEach((header, index) => {
                    packageObj[header] = values[index] || '';
                });
                
                // Map to expected format
                const formattedPackage = {
                    name: packageObj['package name'] || packageObj['name'] || '',
                    category: packageObj['category'] || 'camera_systems',
                    description: packageObj['description'] || '',
                    base_price: parseFloat(packageObj['base price'] || packageObj['price'] || 0),
                    status: packageObj['status'] || 'active'
                };
                
                // Validate required fields
                if (!formattedPackage.name || formattedPackage.name.trim() === '') {
                    continue; // Skip packages without names
                }
                
                packages.push(formattedPackage);
            }
            
            if (packages.length === 0) {
                showToast('No valid packages found in CSV', 'error');
                return;
            }
            
            // Send to API
            const response = await fetch('api.php?action=import_packages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ packages: packages })
            });
            
            const result = await response.json();
            if (result.success) {
                showToast(`Successfully imported ${result.imported || packages.length} packages!`);
                cancelPackageImport();
                loadPackages();
            } else {
                showToast('Import failed: ' + (result.error || 'Unknown error'), 'error');
                if (result.errors && result.errors.length > 0) {
                    console.log('Import errors:', result.errors);
                }
            }
        } catch (error) {
            console.error('Error importing packages:', error);
            showToast('Error parsing CSV file', 'error');
        }
    };
    
    reader.readAsText(file);
}

// Update navigation to load packages when section is shown
function updateShowSectionForPackages() {
    const originalShowSection = window.showSection;
    window.showSection = function(section) {
        originalShowSection(section);
        if (section === 'packages') {
            loadPackages();
        }
    };
}

// Initialize packages functionality when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    updateShowSectionForPackages();
});
