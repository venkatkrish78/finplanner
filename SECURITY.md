# Security Policy

## 🔒 Security Features

FinPlanner implements several security measures to protect user data:

### Authentication & Authorization
- NextAuth.js for secure session management
- JWT tokens with proper expiration
- User-based data isolation
- Protected API routes

### Data Protection
- User-specific database queries
- Input validation and sanitization
- SQL injection prevention via Prisma ORM
- XSS protection through React

### Recent Security Updates (June 2024)
- Added multi-user authentication system
- Implemented proper data isolation between users
- Updated all API routes with authentication middleware
- Added secure session management

## 🐛 Reporting Security Issues

If you discover a security vulnerability, please:

1. **DO NOT** open a public GitHub issue
2. Email: security@finplanner.com
3. Include detailed steps to reproduce
4. Allow 48 hours for initial response

## 🔄 Security Updates

We regularly update dependencies and security measures. Users should:
- Keep their installations updated
- Use strong passwords
- Enable two-factor authentication (when available)
- Report suspicious activity

## 📋 Security Checklist

- [x] User authentication implemented
- [x] Data isolation between users
- [x] Protected API endpoints
- [x] Input validation
- [x] Secure session management
- [ ] Two-factor authentication (planned)
- [ ] Rate limiting (planned)
- [ ] Audit logging (planned)
