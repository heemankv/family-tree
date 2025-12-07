# Contributing to Family Tree Explorer

Thank you for your interest in contributing to Family Tree Explorer! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)

## Code of Conduct

This project follows a standard Code of Conduct. By participating, you are expected to:

- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/family-tree.git
   cd family-tree
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/heemankv/family-tree.git
   ```

## Development Setup

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for frontend development)
- Go 1.21+ (for backend development)
- Python 3 (for CSV import scripts)

### Running with Docker (Recommended)

```bash
# Start all services
docker compose up -d

# Import sample data
./scripts/csv_import.sh

# View logs
docker compose logs -f
```

### Running Locally (Development)

**Backend:**
```bash
cd backend
go run cmd/server/main.go
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Database:**
```bash
docker run -d --name neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/familytree123 \
  neo4j:5.15.0-community
```

### Project Structure

```
family-tree/
├── backend/              # Go API server
│   ├── cmd/server/       # Entry point
│   ├── internal/         # Internal packages
│   │   ├── config/       # Configuration
│   │   ├── database/     # Neo4j repository
│   │   ├── handlers/     # HTTP handlers
│   │   ├── middleware/   # CORS, rate limiting
│   │   └── models/       # Data models
│   └── Dockerfile
├── frontend/             # Next.js application
│   ├── src/
│   │   ├── app/          # Next.js App Router
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom hooks
│   │   ├── lib/          # Utilities
│   │   ├── store/        # Zustand store
│   │   └── types/        # TypeScript types
│   └── Dockerfile
├── data/                 # Sample CSV data
├── scripts/              # Utility scripts
├── docs/                 # Documentation
└── AI_docs/              # Technical specifications
```

## How to Contribute

### Types of Contributions

- **Bug fixes**: Fix issues reported in GitHub Issues
- **Features**: Implement features from the roadmap or propose new ones
- **Documentation**: Improve README, guides, or code comments
- **Tests**: Add or improve test coverage
- **Performance**: Optimize code or queries
- **UI/UX**: Improve design, accessibility, or responsiveness

### Workflow

1. **Check existing issues** to avoid duplicate work
2. **Create an issue** for significant changes before starting
3. **Create a branch** from `master`:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```
4. **Make your changes** following the coding standards
5. **Test your changes** locally
6. **Commit your changes** with clear messages
7. **Push to your fork** and create a Pull Request

## Pull Request Process

1. **Update documentation** if you change functionality
2. **Ensure all tests pass** (when applicable)
3. **Keep PRs focused** - one feature/fix per PR
4. **Fill out the PR template** completely
5. **Request review** from maintainers
6. **Address feedback** promptly

### PR Title Format

```
type: brief description

Examples:
feat: add keyboard shortcuts help modal
fix: resolve edge highlighting for couples
docs: update data import guide
refactor: extract theme logic into custom hook
```

## Coding Standards

### Frontend (TypeScript/React)

- Use TypeScript for all new files
- Follow existing component patterns
- Use Tailwind CSS for styling
- Use Zustand for state management
- Prefer functional components with hooks
- Use meaningful variable/function names

```typescript
// Good
const PersonCard: React.FC<PersonCardProps> = ({ person, isSelected }) => {
  // ...
};

// Avoid
const Card = (props: any) => {
  // ...
};
```

### Backend (Go)

- Follow standard Go conventions
- Use meaningful package names
- Handle errors explicitly
- Add comments for exported functions

```go
// Good
func (h *TreeHandler) GetPerson(c *gin.Context) {
    id := c.Param("id")
    if id == "" {
        c.JSON(http.StatusBadRequest, ErrorResponse{...})
        return
    }
    // ...
}
```

### CSS/Styling

- Use Tailwind utility classes
- Follow the existing color scheme (CSS variables)
- Ensure dark mode compatibility
- Test on mobile viewports

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(frontend): add search by profession filter
fix(backend): handle empty AKA field in CSV import
docs: add troubleshooting section to DATA_IMPORT.md
refactor(frontend): extract graph layout into separate module
```

## Reporting Bugs

When reporting bugs, please include:

1. **Description**: Clear description of the issue
2. **Steps to Reproduce**: Numbered steps to reproduce
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: OS, browser, Docker version
6. **Screenshots**: If applicable
7. **Logs**: Relevant error messages or console output

Use the bug report issue template when available.

## Requesting Features

When requesting features:

1. **Check existing issues** to avoid duplicates
2. **Describe the problem** you're trying to solve
3. **Propose a solution** if you have one
4. **Consider alternatives** you've thought about
5. **Provide context** on why this would be useful

Use the feature request issue template when available.

## Questions?

- Open a [GitHub Discussion](https://github.com/heemankv/family-tree/discussions) for questions
- Check existing issues and documentation first
- Be patient - maintainers are volunteers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Family Tree Explorer!
