# Contributing to UAE Corporate Tax Advisory

Thank you for your interest in contributing to the UAE Corporate Tax Advisory project! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Release Process](#release-process)
- [Documentation](#documentation)

## Code of Conduct

This project and its participants are governed by our Code of Conduct. By participating, you are expected to uphold this code.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git
- PostgreSQL (for development)
- Basic knowledge of TypeScript, React, and Node.js

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/UAE-Corporate-Tax-Advisor.git
   cd UAE-Corporate-Tax-Advisor
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/original-owner/UAE-Corporate-Tax-Advisor.git
   ```

## Development Setup

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your local configuration
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your local configuration
npm start
```

### Database Setup

```bash
cd database
psql -U postgres -c "CREATE DATABASE uae_tax_db_dev;"
psql -U postgres -d uae_tax_db_dev -f setup_database.sql
psql -U postgres -d uae_tax_db_dev -f seed_data.sql
```

## Coding Standards

### TypeScript Guidelines

- Use strict TypeScript configuration
- Prefer interfaces over types for object shapes
- Use meaningful type names
- Avoid `any` type - use `unknown` when necessary
- Use proper error handling with typed errors

### React Guidelines

- Use functional components with hooks
- Prefer composition over inheritance
- Use proper prop types and interfaces
- Implement proper error boundaries
- Use React.memo for performance optimization when needed

### Backend Guidelines

- Use async/await over promises
- Implement proper error handling
- Use middleware for cross-cutting concerns
- Follow RESTful API design principles
- Implement proper validation and sanitization

### Code Style

- Use Prettier for code formatting
- Follow ESLint rules
- Use meaningful variable and function names
- Write self-documenting code
- Add JSDoc comments for complex functions

### File Naming

- Use kebab-case for file names
- Use PascalCase for component names
- Use camelCase for variables and functions
- Use UPPER_SNAKE_CASE for constants

## Testing Guidelines

### Unit Tests

- Write tests for all new features
- Maintain 80%+ code coverage
- Use descriptive test names
- Test both success and error cases
- Mock external dependencies

### Integration Tests

- Test API endpoints
- Test database operations
- Test authentication flows
- Test error handling

### Frontend Tests

- Test component rendering
- Test user interactions
- Test form validation
- Test API integration

### Running Tests

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# All tests
npm run test:all
```

## Pull Request Process

### Before Submitting

1. **Update your fork**: Keep your fork up to date
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**: Follow the coding standards

4. **Test your changes**: Run all tests and ensure they pass

5. **Update documentation**: Update README, API docs, etc.

### Commit Messages

Use conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build process or auxiliary tool changes

Examples:
```
feat(auth): add JWT token refresh functionality
fix(api): resolve CORS issue in production
docs(readme): update installation instructions
```

### Pull Request Checklist

- [ ] Code follows the project's style guidelines
- [ ] Self-review of code has been performed
- [ ] Code has been commented, particularly in hard-to-understand areas
- [ ] Corresponding changes to documentation have been made
- [ ] Changes generate no new warnings
- [ ] Tests have been added that prove the fix is effective or feature works
- [ ] New and existing unit tests pass locally
- [ ] Any dependent changes have been merged and published

### Review Process

1. **Automated Checks**: CI/CD pipeline must pass
2. **Code Review**: At least one maintainer must approve
3. **Security Review**: Security implications are considered
4. **Documentation**: Documentation is updated if needed
5. **Testing**: All tests pass and new tests are added

## Release Process

### Versioning

We use [Semantic Versioning](https://semver.org/):

- **MAJOR**: Incompatible API changes
- **MINOR**: New functionality in a backwards-compatible manner
- **PATCH**: Backwards-compatible bug fixes

### Release Steps

1. **Create release branch**:
   ```bash
   git checkout -b release/v1.2.0
   ```

2. **Update version numbers**:
   - Update package.json files
   - Update CHANGELOG.md
   - Update documentation

3. **Create pull request**:
   - Merge to main branch
   - Create GitHub release
   - Tag the release

4. **Deploy**:
   - Deploy to staging environment
   - Run integration tests
   - Deploy to production

## Documentation

### Code Documentation

- Use JSDoc for functions and classes
- Include examples in comments
- Document complex algorithms
- Explain business logic

### API Documentation

- Document all endpoints
- Include request/response examples
- Document error codes
- Keep OpenAPI spec updated

### User Documentation

- Write clear installation instructions
- Include troubleshooting guides
- Provide usage examples
- Keep screenshots updated

## Communication

### Issues

- Use the issue templates
- Provide detailed information
- Include steps to reproduce
- Add screenshots when relevant

### Discussions

- Use GitHub Discussions for questions
- Be respectful and helpful
- Search existing discussions first
- Tag appropriately

### Slack/Discord

- Join our community channels
- Ask questions in appropriate channels
- Share your progress and challenges
- Help other contributors

## Recognition

### Contributors

- All contributors are listed in CONTRIBUTORS.md
- Significant contributions are highlighted
- Contributors receive recognition in releases

### Hall of Fame

- Top contributors are featured
- Special achievements are recognized
- Community awards for outstanding work

## Getting Help

### Resources

- [Project Documentation](docs/)
- [API Reference](docs/api.md)
- [FAQ](docs/faq.md)
- [Troubleshooting Guide](docs/troubleshooting.md)

### Support Channels

- GitHub Issues for bugs
- GitHub Discussions for questions
- Email for security issues
- Community chat for real-time help

---

**Thank you for contributing to UAE Corporate Tax Advisory!**

Your contributions help make tax management easier for UAE businesses.
