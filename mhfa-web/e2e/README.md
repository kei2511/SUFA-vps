# E2E Testing with Playwright

## Setup

```bash
npm install -d @playwright/test
npx playwright install chromium
```

## Configuration

- **Base URL**: `https://sufa-six.vercel.app`
- **Test Users**:
  - Pasien: `pasien@email.com` / `password123`
  - Konselor: `konselor@email.com` / `password123`
  - Admin: `admin@email.com` / `password123`

## Run Tests

```bash
# Run all tests
npx playwright test

# Run tests in headed mode (see browser)
npx playwright test --headless=false

# Run with mobile viewport
npx playwright test --project=chromium-mobile

# Run specific test file
npx playwright test e2e/01-public-pages.spec.ts

# Generate HTML report
npx playwright show-report
```

## Test Files

| File | Description |
|------|-------------|
| `01-public-pages.spec.ts` | Login, Register, Forgot Password, 404 |
| `02-patient-flow.spec.ts` | Patient screening, chat, history flows |
| `03-counselor-flow.spec.ts` | Counselor dashboard, patient list, chat |
| `04-admin-flow.spec.ts` | Admin user management, invite codes, reports |
| `05-responsive.spec.ts` | Desktop, mobile, tablet layout verification |
| `06-critical-issues.spec.ts` | Issues from June 28 report verification |
| `07-edge-cases.spec.ts` | Edge cases, error handling, validation |

## Output

Reports are generated in `e2e/reports/` directory.