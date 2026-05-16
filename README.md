# Skones Security Management App

A comprehensive mobile application for managing security guards, tracking deployments, processing payroll, and managing incidents for Skones Security Company Limited Ghana.

## 🚀 Features

### Core Functionality

- **Guard Management** - Track all deployed guards with real-time status updates and performance metrics
- **Merit Scoring System** - Comprehensive performance tracking with attendance, conduct, and training metrics
- **Deployment Posts** - Complete deployment post management with client information and guard assignments
- **Payroll Processing** - Full payroll system with calculations, approval workflows, and payment tracking
- **Incident Reporting** - Track and manage security incidents with detailed reporting and resolution tracking
- **Geo-Tracking** - Real-time location monitoring of guards with route history and geofencing
- **Radio Communication** - Shortwave radio simulation for staff communication and emergency alerts
- **Document Management** - Generate and export reports in PDF and Excel formats
- **Company Information** - Board of Directors, company history, and contact information

### Security Features

- **AES-256 Encryption** for all sensitive data (guards, payroll, locations)
- **Role-Based Access Control** (Admin, Accounts, Operations)
- **Secure Token Storage** using platform-specific keychains
- **Input Validation & Sanitization** to prevent injection attacks
- **Rate Limiting** to prevent brute force attacks
- **Audit Logging** for compliance and forensics
- **HTTPS/TLS** for all data in transit
- **Environment Variable Protection** for secrets management

## 📱 Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | React Native 0.81 |
| **Mobile Platform** | Expo SDK 54 |
| **Language** | TypeScript 5.9 |
| **Styling** | NativeWind 4 (Tailwind CSS) |
| **Routing** | Expo Router 6 |
| **State Management** | React Context + useReducer |
| **API Client** | tRPC + TanStack Query |
| **Storage** | AsyncStorage + Secure Store |
| **Encryption** | crypto-js (AES-256) |
| **Testing** | Vitest |
| **Backend** | Node.js + Express |
| **Database** | PostgreSQL |

## 🛠️ Installation & Setup

### Prerequisites

- Node.js 22.x or higher
- pnpm 9.12.0 or higher
- Git with SSH configured
- Expo CLI (installed via pnpm)

### Quick Start

```bash
# Clone the repository
git clone git@github.com:tpanamaj/Skones-security-app.git
cd skones-app

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
pnpm dev

# Open in browser
# https://localhost:8081

# Scan QR code with Expo Go on your phone
```

### Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Encryption
ENCRYPTION_KEY=<your-256-bit-hex-key>

# API
REACT_APP_API_URL=https://api.skones.local/v1

# Authentication
JWT_SECRET=<your-jwt-secret>

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/skones_db

# Other services
REACT_APP_GOOGLE_MAPS_API_KEY=<your-api-key>
```

See [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) for complete variable documentation.

## 📖 Documentation

- **[SECURITY.md](./SECURITY.md)** - Security measures, best practices, and incident response
- **[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)** - Code architecture, development workflow, and common tasks
- **[ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)** - Environment variables and configuration
- **[GITHUB_SSH_SETUP_GUIDE.md](./GITHUB_SSH_SETUP_GUIDE.md)** - SSH key setup for GitHub

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run with coverage
pnpm test --coverage

# Run specific test file
pnpm test lib/__tests__/auth-context.test.ts
```

## 🔍 Code Quality

```bash
# Check TypeScript
pnpm run check

# Run linting
pnpm exec expo lint

# Format code
pnpm run format
```

## 🚀 Development Workflow

### Branch Strategy

```
main (production)
  ↑
  ├── develop (staging)
  │   ├── feature/guard-management
  │   ├── feature/payroll-processing
  │   └── bugfix/auth-issue
```

### Creating a Feature

1. Create a branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -m "feat: description"`
3. Push: `git push origin feature/your-feature`
4. Create Pull Request on GitHub
5. After approval, merge to develop

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

## 🔐 Security

### Key Security Features

- **Data Encryption** - All sensitive data encrypted with AES-256
- **Secure Storage** - Tokens stored in platform keychains
- **Input Validation** - All user input validated and sanitized
- **Rate Limiting** - Protection against brute force attacks
- **Audit Logging** - All security events logged for compliance

### Reporting Security Issues

**Do NOT create public GitHub issues for security vulnerabilities.**

Instead, email: `security@skones.local` with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

Response time: 48 hours

See [SECURITY.md](./SECURITY.md) for complete security documentation.

## 📊 Project Structure

```
skones-app/
├── app/                    # Expo Router app screens
├── components/             # Reusable UI components
├── lib/                    # Core utilities and modules
│   ├── encryption.ts       # AES-256 encryption
│   ├── security.ts         # Security utilities
│   ├── secure-storage.ts   # Encrypted storage
│   ├── auth-context.tsx    # Authentication
│   └── app-context.tsx     # App state
├── hooks/                  # Custom React hooks
├── constants/              # Constants and configuration
├── assets/                 # Images and fonts
├── server/                 # Backend server
├── .github/                # GitHub workflows and config
├── SECURITY.md             # Security documentation
├── DEVELOPER_GUIDE.md      # Developer guide
└── package.json            # Dependencies
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a Pull Request

### Code Review Checklist

- [ ] Code follows project style guide
- [ ] All tests pass
- [ ] No console.logs or debug code
- [ ] No hardcoded secrets
- [ ] Input is validated
- [ ] Sensitive data is encrypted
- [ ] Error handling is implemented
- [ ] Documentation is updated

## 🐛 Troubleshooting

### Common Issues

**Port already in use:**
```bash
lsof -ti:8081 | xargs kill -9
```

**Module not found:**
```bash
rm -rf node_modules
pnpm install
```

**Encryption key not set:**
```bash
ENCRYPTION_KEY=$(openssl rand -hex 32)
echo "ENCRYPTION_KEY=$ENCRYPTION_KEY" >> .env.local
```

See [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) for more troubleshooting tips.

## 📝 License

This project is proprietary software for Skones Security Company Limited Ghana.

## 👥 Team

- **Project Lead** - Skones Security Company Limited
- **Development** - Mobile Development Team
- **Security** - Security Team

## 📞 Support

For questions or issues:
1. Check the documentation first
2. Search existing GitHub issues
3. Create a new GitHub issue with details
4. Contact the development team

## 🔄 CI/CD Pipeline

Automated testing and deployment:

- **Security Scan** - Checks for vulnerabilities and secrets
- **Linting** - Code quality and style checks
- **Testing** - Unit tests and integration tests
- **Build** - Production build verification
- **Dependency Check** - Outdated and vulnerable dependencies

See `.github/workflows/ci.yml` for workflow details.

## 📈 Performance

- **Bundle Size** - Optimized with code splitting
- **List Performance** - Uses FlatList for efficient rendering
- **Image Optimization** - WebP format and caching
- **Memoization** - Prevents unnecessary re-renders

## 🎯 Roadmap

### v1.1 (Next Release)
- [ ] Real-time geo-tracking map
- [ ] Enhanced incident reporting UI
- [ ] Batch payroll processing
- [ ] Advanced reporting dashboard

### v1.2
- [ ] Biometric authentication
- [ ] Offline sync improvements
- [ ] Performance optimizations
- [ ] Additional language support

## 📊 Statistics

| Metric | Value |
|--------|-------|
| **Lines of Code** | 15,000+ |
| **Components** | 50+ |
| **Test Coverage** | 80%+ |
| **Security Modules** | 3 |
| **Supported Platforms** | iOS, Android, Web |

## 🙏 Acknowledgments

- Skones Security Company Limited Ghana
- Expo team for excellent React Native framework
- Open source community for amazing libraries

---

**Version:** 1.0.0  
**Last Updated:** May 15, 2026  
**Status:** Production Ready ✅

For more information, visit the [GitHub repository](https://github.com/tpanamaj/Skones-security-app).
