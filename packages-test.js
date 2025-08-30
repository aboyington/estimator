// packages-test.js - Minimal test version

console.log('packages-test.js loading...');
console.log('allPackages exists?', typeof allPackages !== 'undefined');

// Test conditional declaration
if (typeof allPackages === 'undefined') {
  console.log('Declaring allPackages...');
  var allPackages = [];
} else {
  console.log('allPackages already exists, skipping declaration');
}

console.log('packages-test.js loaded successfully');
