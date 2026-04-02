#!/bin/bash

# ============================================================================
# PHASE 1: QUICK START - DevOps & Code Cleanup (2-3 hours)
# ============================================================================

set -e

echo "🚀 PHASE 1 - DevOps & Code Cleanup"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

echo -e "${BLUE}[1/8] Cleaning stale build artifacts...${NC}"
find . -name ".next-stale-*" -type d -exec rm -rf {} + 2>/dev/null || true
echo -e "${GREEN}✓ Removed stale build artifacts${NC}\n"

echo -e "${BLUE}[2/8] Creating logs directory...${NC}"
mkdir -p logs
echo -e "${GREEN}✓ Logs directory ready${NC}\n"

echo -e "${BLUE}[3/8] Updating .gitignore...${NC}"
cat >> .gitignore << 'EOF'

# Build artifacts
.next-stale-*
.next/cache
dist/
build/

# Logs
logs/
*.log
npm-debug.log*

# Environment
.env.local
.env.*.local

# Testing
coverage/
.nyc_output/

# IDE
.vscode/settings.json
.idea/

# OS
.DS_Store
Thumbs.db
EOF
echo -e "${GREEN}✓ .gitignore updated${NC}\n"

echo -e "${BLUE}[4/8] Installing ESLint & Prettier...${NC}"
npm install --save-dev eslint prettier eslint-config-next eslint-plugin-react eslint-plugin-@typescript-eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin 2>&1 | tail -5
echo -e "${GREEN}✓ ESLint & Prettier installed${NC}\n"

echo -e "${BLUE}[5/8] Creating ESLint config...${NC}"
cat > .eslintrc.json << 'EOF'
{
  "extends": ["next/core-web-vitals", "eslint:recommended"],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["warn"]
  }
}
EOF
echo -e "${GREEN}✓ ESLint config created${NC}\n"

echo -e "${BLUE}[6/8] Creating Prettier config...${NC}"
cat > .prettierrc << 'EOF'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
EOF
echo -e "${GREEN}✓ Prettier config created${NC}\n"

echo -e "${BLUE}[7/8] Installing Husky & preparing pre-commit hooks...${NC}"
npm install --save-dev husky lint-staged 2>&1 | tail -3
npx husky install 2>/dev/null || true

cat > .husky/pre-commit << 'EOF'
#!/bin/sh
# Husky pre-commit hook
npx lint-staged
EOF

chmod +x .husky/pre-commit 2>/dev/null || true

cat > package.json.tmp << 'EOF'
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.json": ["prettier --write"]
  }
}
EOF

echo -e "${GREEN}✓ Husky hooks configured${NC}\n"

echo -e "${BLUE}[8/8] Updating package.json scripts...${NC}"
npm pkg set scripts.lint="eslint . --ext .ts,.tsx,.js,.jsx" 2>/dev/null || true
npm pkg set scripts.format="prettier --write '**/*.{ts,tsx,js,jsx,json,md}'" 2>/dev/null || true
npm pkg set scripts.type-check="tsc --noEmit" 2>/dev/null || true

echo -e "${GREEN}✓ npm scripts updated${NC}\n"

echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ PHASE 1 COMPLETE!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo "📋 Next steps:"
echo "   1. Run: npm run lint"
echo "   2. Run: npm run format"
echo "   3. Continue with Phase 2: npm run build"
echo ""
