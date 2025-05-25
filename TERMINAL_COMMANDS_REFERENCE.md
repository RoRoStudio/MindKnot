# Terminal Commands Reference

## Project: MindKnot Codebase Restructure
**Environment**: WSL2 Ubuntu 22.04  
**Shell**: /bin/bash  
**Working Directory**: /root/MindKnot

---

## Directory Operations

### Create Directory Structure
```bash
# Create single directory
mkdir -p src/shared/components/ui

# Create multiple directories at once
mkdir -p src/shared/{components/{ui,form,layout,navigation,entries,lists},hooks,services/{database,storage,background,api},types,utils,constants}

# Create app-level directories
mkdir -p src/app/{navigation,store,theme,contexts}

# Create feature directories for all entry types
mkdir -p src/features/{actions,notes,paths,sagas,sparks,loops}/{domain/{entities,services,events,repositories},data/{repositories,storage,api,database/{schemas,migrations}},presentation/{screens,components,hooks,navigation,styles},state/{slices,selectors,middleware},types,utils,constants}
```

### List Directory Contents
```bash
# List current directory
ls -la

# List specific directory
ls -la src/shared/

# List with tree structure (if tree is installed)
tree src/shared/

# List only directories
ls -d */
```

---

## File Operations

### Move Files
```bash
# Move single file
mv src/components/shared/Button.tsx src/shared/components/ui/Button.tsx

# Move entire directory
mv src/components/common/ src/shared/components/ui/

# Move multiple files with pattern
mv src/components/entries/*.tsx src/shared/components/entries/

# Move with backup (create .bak file)
mv src/file.tsx src/file.tsx.bak
```

### Copy Files
```bash
# Copy single file
cp src/components/shared/Button.tsx src/shared/components/ui/Button.tsx

# Copy entire directory recursively
cp -r src/components/common/ src/shared/components/ui/

# Copy with preserve attributes
cp -p src/file.tsx dest/file.tsx
```

### Create Files
```bash
# Create empty file
touch src/shared/components/ui/index.ts

# Create file with content
cat > src/shared/components/ui/index.ts << 'EOF'
export { default as Button } from './Button';
export { default as Card } from './Card';
EOF

# Create multiple index files
touch src/shared/{components,hooks,services,types,utils,constants}/index.ts
```

### Delete Files/Directories
```bash
# Delete file
rm src/old-file.tsx

# Delete directory and contents
rm -rf src/components/entries/loops/

# Delete multiple files with pattern
rm src/components/entries/loops/*.tsx
```

---

## File Content Operations

### View File Contents
```bash
# View entire file
cat src/package.json

# View first 20 lines
head -20 src/components/Button.tsx

# View last 20 lines
tail -20 src/components/Button.tsx

# View file with line numbers
nl src/components/Button.tsx

# View file with pagination
less src/components/Button.tsx
```

### Search in Files
```bash
# Search for text in file
grep "hardcoded color" src/components/Button.tsx

# Search recursively in directory
grep -r "hardcoded" src/components/

# Search with line numbers
grep -n "import" src/components/Button.tsx

# Search for files containing text
grep -l "theme.colors" src/components/*.tsx
```

---

## Verification Commands

### Check File Existence
```bash
# Check if file exists
test -f src/shared/components/ui/Button.tsx && echo "File exists" || echo "File not found"

# Check if directory exists
test -d src/shared/components && echo "Directory exists" || echo "Directory not found"

# List files in directory to verify structure
find src/shared -type f -name "*.tsx" | head -10
```

### Verify Moves Were Successful
```bash
# Check source is empty/deleted
ls src/components/entries/loops/ 2>/dev/null || echo "Source directory successfully removed"

# Check destination has files
ls -la src/features/loops/presentation/components/ | wc -l

# Compare file counts
echo "Original count: $(find src/components -name "*.tsx" | wc -l)"
echo "New count: $(find src/shared src/features src/app -name "*.tsx" | wc -l)"
```

---

## Git Operations (if needed)

### Track Changes
```bash
# Check git status
git status

# Add all changes
git add .

# Add specific files
git add src/shared/

# Commit changes
git commit -m "Phase 1: Move shared components to new structure"

# Create branch for restructure
git checkout -b feature/codebase-restructure
```

---

## Package Management

### Install Dependencies
```bash
# Install npm packages
npm install

# Install specific package
npm install @react-native-async-storage/async-storage

# Install dev dependencies
npm install --save-dev @types/node
```

### Check Dependencies
```bash
# List installed packages
npm list

# Check for outdated packages
npm outdated

# Check package info
npm info react-native
```

---

## Development Commands

### Start Development Server
```bash
# Start Expo development server
npx expo start

# Start with specific platform
npx expo start --ios
npx expo start --android

# Start with tunnel
npx expo start --tunnel
```

### Build and Test
```bash
# Run TypeScript check
npx tsc --noEmit

# Run linter
npx eslint src/

# Run tests
npm test

# Build for production
npx expo build:ios
npx expo build:android
```

---

## Useful Combinations

### Complete Directory Move with Verification
```bash
# 1. Create destination
mkdir -p src/shared/components/ui

# 2. Move files
mv src/components/shared/*.tsx src/shared/components/ui/

# 3. Verify move
ls -la src/shared/components/ui/
ls src/components/shared/ 2>/dev/null || echo "Source directory empty"

# 4. Create index file
touch src/shared/components/ui/index.ts
```

### Batch File Operations
```bash
# Move all TypeScript files from one directory to another
find src/components/entries/actions -name "*.tsx" -exec mv {} src/features/actions/presentation/components/ \;

# Create index files for all directories
find src/features -type d -name components -exec touch {}/index.ts \;

# Set permissions for all TypeScript files
find src/ -name "*.tsx" -exec chmod 644 {} \;
```

---

## Error Handling

### Common Issues and Solutions
```bash
# Permission denied
sudo chown -R $USER:$USER /root/MindKnot

# Directory not empty (when trying to remove)
rm -rf src/old-directory/

# File already exists (when moving)
mv src/file.tsx src/backup-file.tsx.bak
mv src/new-file.tsx src/file.tsx

# Command not found
which command-name
echo $PATH
```

### Safe Operations
```bash
# Always backup before major operations
cp -r src/ src-backup-$(date +%Y%m%d-%H%M%S)/

# Test commands with echo first
echo mv src/file.tsx dest/file.tsx

# Use -i flag for interactive confirmation
mv -i src/file.tsx dest/file.tsx
rm -i src/file.tsx
```

---

## Performance Monitoring

### Check Disk Usage
```bash
# Check directory sizes
du -sh src/*/

# Check available space
df -h

# Find large files
find src/ -type f -size +1M -ls
```

### Process Monitoring
```bash
# Check running processes
ps aux | grep expo

# Check memory usage
free -h

# Check CPU usage
top
```

---

## Notes

- Always run commands from `/root/MindKnot` directory
- Use `mkdir -p` to create nested directories safely
- Use `mv` for moving files (faster than copy + delete)
- Use `cp -r` for copying directories recursively
- Always verify operations with `ls` or `find` commands
- Create backups before major restructuring operations
- Use `test` commands to check file/directory existence before operations

---

## Command History Template

```bash
# Phase 1 - Day 1: Foundation Setup
mkdir -p src/shared/{components/{ui,form,layout,navigation,entries,lists},hooks,services,types,utils,constants}
mkdir -p src/app/{navigation,store,theme,contexts}
mkdir -p src/features/{actions,notes,paths,sagas,sparks,loops}

# Phase 1 - Day 2: Move Components
mv src/components/shared/ src/shared/components/ui/
mv src/components/form/ src/shared/components/form/
# ... continue with systematic moves

# Verification after each major step
ls -la src/shared/components/
find src/shared -name "*.tsx" | wc -l
```

This reference will be updated throughout the implementation process with actual commands used. 