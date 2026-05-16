# Developer Guide - Skones Security Management App

Welcome to the Skones Security Management App development team! This guide will help you understand the codebase, contribute effectively, and maintain code quality.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Getting Started](#getting-started)
3. [Code Architecture](#code-architecture)
4. [Key Modules](#key-modules)
5. [Development Workflow](#development-workflow)
6. [Testing](#testing)
7. [Debugging](#debugging)
8. [Performance Optimization](#performance-optimization)
9. [Common Tasks](#common-tasks)
10. [Troubleshooting](#troubleshooting)

---

## Project Structure

```
skones-app/
├── app/                          # Expo Router app directory
│   ├── _layout.tsx              # Root layout with providers
│   ├── login.tsx                # Login screen
│   ├── role-select.tsx          # Role selection screen
│   └── (tabs)/                  # Tab-based screens
│       ├── _layout.tsx          # Tab bar configuration
│       ├── index.tsx            # Dashboard
│       ├── guards.tsx           # Guard management
│       ├── deployments.tsx      # Deployment posts
│       ├── reports.tsx          # Reports & payroll
│       └── more.tsx             # Additional features
├── components/                   # Reusable components
│   ├── screen-container.tsx     # Safe area wrapper
│   ├── themed-view.tsx          # Theme-aware view
│   └── ui/                      # UI components
├── lib/                          # Core utilities
│   ├── types.ts                 # TypeScript types
│   ├── mock-data.ts             # Mock data for development
│   ├── auth-context.tsx         # Authentication context
│   ├── app-context.tsx          # App state context
│   ├── encryption.ts            # AES-256 encryption
│   ├── secure-storage.ts        # Encrypted storage
│   ├── security.ts              # Security utilities
│   ├── utils.ts                 # Helper functions
│   └── trpc.ts                  # API client
├── hooks/                        # Custom React hooks
│   ├── use-auth.ts              # Authentication hook
│   ├── use-colors.ts            # Theme colors hook
│   └── use-color-scheme.ts      # Dark mode detection
├── constants/                    # Constants
│   └── theme.ts                 # Theme configuration
├── assets/                       # Images and fonts
│   └── images/                  # App icons and splash
├── server/                       # Backend server
│   ├── _core/                   # Core server logic
│   └── README.md                # Backend documentation
├── .github/                      # GitHub configuration
│   ├── workflows/               # CI/CD pipelines
│   └── branch-protection.md     # Branch rules
├── app.config.ts                # Expo app configuration
├── tailwind.config.js           # Tailwind CSS config
├── theme.config.js              # App theme colors
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── SECURITY.md                  # Security documentation
├── ENVIRONMENT_SETUP.md         # Environment variables
└── DEVELOPER_GUIDE.md           # This file
```

---

## Getting Started

### Prerequisites

- Node.js 22.x or higher
- pnpm 9.12.0 or higher
- Git with SSH configured
- Expo CLI (installed via pnpm)

### Installation

```bash
# Clone the repository
git clone git@github.com:tpanamaj/Skones-security-app.git
cd skones-app

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Start development server
pnpm dev
```

### First Run

1. Open https://localhost:8081 in your browser
2. You should see the Expo Metro Bundler
3. Scan the QR code with Expo Go app on your phone
4. App should load on your device

---

## Code Architecture

### Authentication Flow

```
Login Screen
    ↓
Validate Credentials
    ↓
Get JWT Token
    ↓
Store Token (Secure Store)
    ↓
Role Selection
    ↓
Dashboard (Role-based)
```

### Data Flow

```
User Action
    ↓
Component Handler
    ↓
App Context (State Management)
    ↓
Encryption (if sensitive)
    ↓
Secure Storage / API
    ↓
Update UI
```

### State Management

**App Context** (`lib/app-context.tsx`):
- Global app state
- Guard data
- Payroll data
- Incident data
- Location data

**Auth Context** (`lib/auth-context.tsx`):
- User authentication
- User role
- Session management

**Local State** (Component level):
- Form inputs
- UI state (loading, errors)
- Temporary data

---

## Key Modules

### Encryption Module (`lib/encryption.ts`)

Provides AES-256 encryption for sensitive data.

**Key Functions:**
- `encryptData(data)` - Encrypt any data
- `decryptData(encryptedData)` - Decrypt data
- `encryptObjectFields(obj, fields)` - Encrypt specific fields
- `decryptObjectFields(obj, fields)` - Decrypt specific fields
- `encryptLocation(lat, lng)` - Encrypt coordinates
- `encryptPayrollData(guardId, amount, bankDetails)` - Encrypt payroll

**Usage:**
```typescript
import { encryptData, decryptData } from '@/lib/encryption';

const encrypted = encryptData('sensitive data');
const decrypted = decryptData(encrypted);
```

### Secure Storage Module (`lib/secure-storage.ts`)

Provides encrypted storage using AsyncStorage + encryption.

**Key Functions:**
- `storeEncryptedData(key, data)` - Store encrypted data
- `getEncryptedData(key)` - Retrieve encrypted data
- `storeSecureData(key, value)` - Store in platform keychain
- `getSecureData(key)` - Retrieve from keychain
- `storeGuardData(data)` - Store guard data
- `getGuardData()` - Retrieve guard data
- `storePayrollData(data)` - Store payroll data
- `getPayrollData()` - Retrieve payroll data
- `clearAllData()` - Clear all stored data

**Usage:**
```typescript
import { storeEncryptedData, getEncryptedData } from '@/lib/secure-storage';

await storeEncryptedData('@skones_guard_data', guardData);
const guardData = await getEncryptedData('@skones_guard_data');
```

### Security Module (`lib/security.ts`)

Provides input validation and security utilities.

**Key Functions:**
- `isValidEmail(email)` - Validate email format
- `isValidPhone(phone)` - Validate phone format
- `validatePasswordStrength(password)` - Check password strength
- `sanitizeInput(input)` - Prevent XSS attacks
- `isValidURL(url)` - Validate URL format
- `isValidCoordinates(lat, lng)` - Validate coordinates
- `hasSQLInjectionPatterns(input)` - Detect SQL injection
- `isRateLimited(identifier, maxAttempts, windowMs)` - Rate limiting
- `validateUserInput(input)` - Comprehensive input validation

**Usage:**
```typescript
import { isValidEmail, sanitizeInput, validateUserInput } from '@/lib/security';

if (!isValidEmail(email)) {
  throw new Error('Invalid email');
}

const safe = sanitizeInput(userInput);
const { isValid, errors } = validateUserInput(userInput);
```

### Types Module (`lib/types.ts`)

Defines TypeScript interfaces for all data models.

**Key Types:**
- `User` - User account information
- `Guard` - Guard details
- `MeritScore` - Performance metrics
- `Payroll` - Payroll information
- `DeploymentPost` - Deployment location
- `Incident` - Incident report
- `Location` - GPS coordinates
- `Communication` - Message/call data

---

## Development Workflow

### Branch Strategy

```
main (production)
  ↑
  ├── develop (staging)
  │   ↑
  │   ├── feature/guard-management
  │   ├── feature/payroll-processing
  │   ├── bugfix/auth-issue
  │   └── docs/api-documentation
```

### Creating a Feature

1. **Create a branch:**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Make changes:**
   - Edit files
   - Add tests
   - Update documentation

3. **Commit changes:**
   ```bash
   git add .
   git commit -m "feat: description of changes"
   ```

4. **Push and create PR:**
   ```bash
   git push origin feature/your-feature-name
   ```
   - Go to GitHub
   - Create Pull Request
   - Link to related issues
   - Request reviewers

5. **Address review comments:**
   - Make requested changes
   - Commit with `git commit --amend`
   - Force push: `git push -f origin feature/your-feature-name`

6. **Merge to develop:**
   - After approval, merge PR
   - Delete branch

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Code style (no logic change)
- `refactor:` Code refactoring
- `perf:` Performance improvement
- `test:` Adding tests
- `chore:` Build, dependencies

**Examples:**
```
feat(guard): add guard search functionality
fix(auth): resolve token expiration issue
docs(security): update encryption documentation
```

---

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run specific test file
pnpm test lib/__tests__/auth-context.test.ts

# Run with coverage
pnpm test --coverage
```

### Writing Tests

**Test file location:** `lib/__tests__/module.test.ts`

**Test structure:**
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { functionToTest } from '@/lib/module';

describe('Module Name', () => {
  beforeEach(() => {
    // Setup before each test
  });

  it('should do something', () => {
    const result = functionToTest();
    expect(result).toBe(expectedValue);
  });

  it('should handle errors', () => {
    expect(() => functionToTest()).toThrow();
  });
});
```

### Test Coverage Goals

- Minimum 80% code coverage
- 100% coverage for security modules
- All critical paths tested
- Error cases tested

---

## Debugging

### Browser DevTools

1. Open app in browser: https://localhost:8081
2. Press `F12` to open DevTools
3. Use Console, Network, Storage tabs

### React DevTools

```bash
# Install React DevTools extension in Chrome/Firefox
# Then use it to inspect component hierarchy
```

### Logging

```typescript
// Development logging
console.log('Debug message:', data);

// Error logging
console.error('Error:', error);

// Remove sensitive data from logs
import { removeSensitiveData } from '@/lib/security';
console.log('User:', removeSensitiveData(userData));
```

### Common Issues

**Issue: "Cannot find module"**
```bash
# Clear cache and reinstall
rm -rf node_modules
pnpm install
```

**Issue: "Port already in use"**
```bash
# Kill process on port 8081
lsof -ti:8081 | xargs kill -9
```

**Issue: "Encryption key not set"**
```bash
# Add ENCRYPTION_KEY to .env.local
ENCRYPTION_KEY=$(openssl rand -hex 32)
echo "ENCRYPTION_KEY=$ENCRYPTION_KEY" >> .env.local
```

---

## Performance Optimization

### Code Splitting

- Use `React.lazy()` for screen components
- Load components on demand
- Reduces initial bundle size

### Memoization

```typescript
import { useMemo, useCallback } from 'react';

// Memoize expensive calculations
const memoizedValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);

// Memoize callbacks
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

### Image Optimization

- Use WebP format when possible
- Compress images before adding
- Use `expo-image` for caching

### List Performance

- Use `FlatList` instead of `ScrollView` with `.map()`
- Implement `keyExtractor` prop
- Use `getItemLayout` for better performance

---

## Common Tasks

### Adding a New Screen

1. **Create screen file:**
   ```bash
   touch app/(tabs)/new-screen.tsx
   ```

2. **Add to tab bar:**
   ```typescript
   // app/(tabs)/_layout.tsx
   <Tabs.Screen
     name="new-screen"
     options={{
       title: "New Screen",
       tabBarIcon: ({ color }) => (
         <IconSymbol size={28} name="icon.name" color={color} />
       ),
     }}
   />
   ```

3. **Add icon mapping:**
   ```typescript
   // components/ui/icon-symbol.tsx
   const MAPPING = {
     "icon.name": "material-icon-name",
     // ...
   };
   ```

### Adding a New API Endpoint

1. **Create server route:**
   ```typescript
   // server/_core/routes/guards.ts
   export const guardsRouter = router({
     getAll: publicProcedure.query(async () => {
       // Fetch guards
     }),
   });
   ```

2. **Add to main router:**
   ```typescript
   // server/_core/index.ts
   export const appRouter = router({
     guards: guardsRouter,
   });
   ```

3. **Use in component:**
   ```typescript
   const { data: guards } = trpc.guards.getAll.useQuery();
   ```

### Adding a New Type

1. **Define in types.ts:**
   ```typescript
   export interface NewType {
     id: string;
     name: string;
     createdAt: Date;
   }
   ```

2. **Use in components:**
   ```typescript
   import { NewType } from '@/lib/types';
   
   const item: NewType = { /* ... */ };
   ```

### Adding Environment Variables

1. **Add to .env.local:**
   ```bash
   NEW_VAR=value
   REACT_APP_NEW_VAR=value
   ```

2. **Use in code:**
   ```typescript
   const value = process.env.NEW_VAR;
   const appValue = process.env.REACT_APP_NEW_VAR;
   ```

---

## Troubleshooting

### Build Issues

**Problem: TypeScript errors**
```bash
# Check TypeScript
pnpm run check

# Fix errors and retry
```

**Problem: Dependency conflicts**
```bash
# Update dependencies
pnpm update

# Or reinstall
pnpm install --force
```

### Runtime Issues

**Problem: App crashes on startup**
- Check console for errors
- Verify environment variables
- Check encryption key is set
- Clear app cache: `pnpm dev` and reload

**Problem: Data not persisting**
- Check secure storage is working
- Verify encryption key hasn't changed
- Check device storage permissions

**Problem: API calls failing**
- Verify API URL in .env.local
- Check network connectivity
- Verify authentication token
- Check CORS settings

### Performance Issues

**Problem: Slow list scrolling**
- Replace `ScrollView` with `FlatList`
- Memoize expensive components
- Reduce re-renders with `useMemo`

**Problem: Large bundle size**
- Check for unused dependencies
- Use code splitting
- Optimize images
- Remove console.logs

---

## Resources

- [Expo Documentation](https://docs.expo.dev)
- [React Native Documentation](https://reactnative.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [NativeWind Documentation](https://www.nativewind.dev)

---

## Getting Help

1. **Check documentation first** - Most answers are in the docs
2. **Search GitHub issues** - Someone may have had the same problem
3. **Ask in team chat** - Collaborate with teammates
4. **Create an issue** - Document the problem for future reference

---

## Code Review Checklist

Before submitting a PR, ensure:

- [ ] Code follows project style guide
- [ ] All tests pass
- [ ] No console.logs or debug code
- [ ] No hardcoded secrets or API keys
- [ ] Input is validated
- [ ] Sensitive data is encrypted
- [ ] Error handling is implemented
- [ ] Documentation is updated
- [ ] Commit messages are clear
- [ ] No merge conflicts

---

**Happy coding! 🚀**

For questions or suggestions, contact the development team or create an issue on GitHub.
