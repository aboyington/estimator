#!/bin/bash

# Bumps the version number in package.json and updates the version in the app's footer.

# Default bump type is 'patch'
BUMP_TYPE=${1:-patch}

# Get the current version from package.json
CURRENT_VERSION=$(node -pe "require('./package.json').version")

# Use npm to bump the version, which handles the version increment logic
NEW_VERSION=$(npm version $BUMP_TYPE --no-git-tag-version | sed 's/v//')

# Update the version in index.html, replacing the content of the footer-version span
# Using a temporary file for sed compatibility on both macOS and Linux

sed -i.bak "s|class=\"footer-version\">v[0-9.]*\(alpha\)?\(beta\)?\(rc\)?[0-9.]*<|class=\"footer-version\">v${NEW_VERSION}<|g" index.html && rm index.html.bak

# Output the new version
echo "Version bumped to v${NEW_VERSION}"
