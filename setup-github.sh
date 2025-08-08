#!/bin/bash

# UAE Corporate Tax Advisor - GitHub Repository Setup Script
# This script helps set up the GitHub repository with proper protection measures

set -e

echo "🚀 Setting up UAE Corporate Tax Advisor GitHub Repository"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    print_warning "GitHub CLI is not installed. You'll need to create the repository manually."
    print_status "Install GitHub CLI: https://cli.github.com/"
    MANUAL_SETUP=true
else
    MANUAL_SETUP=false
fi

# Get repository name
REPO_NAME="UAE-Corporate-Tax-Advisor"
print_status "Repository name: $REPO_NAME"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_error "Not in a git repository. Please run 'git init' first."
    exit 1
fi

# Check if we have commits
if ! git rev-parse HEAD &> /dev/null; then
    print_error "No commits found. Please make an initial commit first."
    exit 1
fi

print_success "Git repository is properly initialized"

# Create the repository on GitHub
if [ "$MANUAL_SETUP" = false ]; then
    print_status "Creating GitHub repository..."
    
    # Check if repository already exists
    if gh repo view "$REPO_NAME" &> /dev/null; then
        print_warning "Repository $REPO_NAME already exists on GitHub"
        read -p "Do you want to continue with setup? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        gh repo create "$REPO_NAME" \
            --public \
            --description "Comprehensive UAE Corporate Tax Advisory System with advanced tax calculation, document management, and compliance tracking." \
            --homepage "https://github.com/$(gh api user --jq .login)/$REPO_NAME" \
            --source . \
            --remote origin \
            --push
    fi
else
    print_status "Manual setup required:"
    echo "1. Go to https://github.com/new"
    echo "2. Create repository: $REPO_NAME"
    echo "3. Make it public"
    echo "4. Add description: Comprehensive UAE Corporate Tax Advisory System"
    echo "5. Run the following commands:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/$REPO_NAME.git"
    echo "   git push -u origin main"
    echo ""
    read -p "Press Enter after creating the repository..."
fi

# Add remote if not already added
if ! git remote get-url origin &> /dev/null; then
    if [ "$MANUAL_SETUP" = false ]; then
        print_status "Adding remote origin..."
        gh repo set-default "$REPO_NAME"
    else
        print_status "Please add the remote origin manually:"
        echo "git remote add origin https://github.com/YOUR_USERNAME/$REPO_NAME.git"
    fi
fi

# Push to GitHub
print_status "Pushing code to GitHub..."
git push -u origin main

print_success "Code pushed to GitHub successfully!"

# Set up branch protection rules
if [ "$MANUAL_SETUP" = false ]; then
    print_status "Setting up branch protection rules..."
    
    # Enable branch protection for main branch
    gh api repos/$(gh api user --jq .login)/$REPO_NAME/branches/main/protection \
        --method PUT \
        --field required_status_checks='{"strict":true,"contexts":["ci/backend-tests","ci/frontend-tests","ci/security-scan"]}' \
        --field enforce_admins=true \
        --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true,"require_code_owner_reviews":false}' \
        --field restrictions=null \
        --field allow_force_pushes=false \
        --field allow_deletions=false
    
    print_success "Branch protection rules configured"
    
    # Enable security features
    print_status "Enabling security features..."
    
    # Enable Dependabot alerts
    gh api repos/$(gh api user --jq .login)/$REPO_NAME/vulnerability-alerts \
        --method PUT \
        --field enabled=true
    
    # Enable automated security fixes
    gh api repos/$(gh api user --jq .login)/$REPO_NAME/automated-security-fixes \
        --method PUT \
        --field enabled=true
    
    print_success "Security features enabled"
    
    # Set up repository topics
    print_status "Setting up repository topics..."
    gh api repos/$(gh api user --jq .login)/$REPO_NAME/topics \
        --method PUT \
        --field names='["uae","tax","corporate-tax","tax-advisory","nodejs","react","typescript","postgresql","express","tailwindcss"]'
    
    print_success "Repository topics set"
    
else
    print_status "Manual setup required for protection rules:"
    echo ""
    echo "1. Go to Settings > Branches"
    echo "2. Add rule for 'main' branch"
    echo "3. Enable:"
    echo "   - Require a pull request before merging"
    echo "   - Require status checks to pass before merging"
    echo "   - Require branches to be up to date"
    echo "   - Require conversation resolution"
    echo "   - Include administrators"
    echo ""
    echo "4. Go to Settings > Security & analysis"
    echo "5. Enable:"
    echo "   - Dependabot alerts"
    echo "   - Dependabot security updates"
    echo "   - Secret scanning"
    echo ""
    read -p "Press Enter after configuring protection rules..."
fi

# Create initial release
if [ "$MANUAL_SETUP" = false ]; then
    print_status "Creating initial release..."
    
    # Create a tag for the initial release
    git tag -a v1.0.0 -m "Initial release - UAE Corporate Tax Advisory System"
    git push origin v1.0.0
    
    # Create GitHub release
    gh release create v1.0.0 \
        --title "Initial Release - UAE Corporate Tax Advisory System" \
        --notes "## 🎉 Initial Release

### Features
- Complete backend API with TypeScript and Express
- React frontend with TypeScript and Tailwind CSS
- PostgreSQL database schema and migrations
- Comprehensive documentation and project structure
- CI/CD pipeline with security scanning
- GitHub protection measures and templates
- Dependabot configuration for automated updates
- Security policy and contributing guidelines

### Technology Stack
- **Backend**: Node.js, Express, TypeScript, PostgreSQL
- **Frontend**: React, TypeScript, Tailwind CSS
- **Database**: PostgreSQL with comprehensive schema
- **Testing**: Jest for backend, React Testing Library for frontend
- **CI/CD**: GitHub Actions with security scanning

### Security Features
- JWT authentication
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- Rate limiting
- CORS configuration

### Getting Started
1. Clone the repository
2. Follow the setup instructions in README.md
3. Run the development servers
4. Access the application at http://localhost:3000

### Documentation
- [README.md](README.md) - Project overview and setup
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contributing guidelines
- [SECURITY.md](SECURITY.md) - Security policy
- [API Documentation](docs/api.md) - API reference

Built with ❤️ for UAE businesses" \
        --target main
    
    print_success "Initial release created"
else
    print_status "Manual release creation required:"
    echo "1. Go to Releases in GitHub"
    echo "2. Create a new release with tag v1.0.0"
    echo "3. Add release notes from the script above"
fi

# Final instructions
echo ""
print_success "🎉 GitHub repository setup complete!"
echo ""
echo "Next steps:"
echo "1. Review the repository on GitHub"
echo "2. Check that all protection rules are active"
echo "3. Verify that CI/CD pipeline is working"
echo "4. Test the application locally"
echo "5. Share the repository with your team"
echo ""
echo "Repository URL: https://github.com/$(gh api user --jq .login)/$REPO_NAME"
echo ""
print_status "Happy coding! 🚀"
