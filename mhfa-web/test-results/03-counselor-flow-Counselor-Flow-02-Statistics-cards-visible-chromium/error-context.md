# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 03-counselor-flow.spec.ts >> Counselor Flow >> 02. Statistics cards visible
- Location: e2e\03-counselor-flow.spec.ts:17:7

# Error details

```
Error: locator.fill: Error: strict mode violation: getByLabel(/kata sandi/i) resolved to 2 elements:
    1) <input value="" required="" id="password" type="password" placeholder="Masukkan kata sandi Anda" class="w-full pl-10 pr-12 py-3 bg-surface border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base text-on-surface placeholder:text-outline-variant"/> aka getByRole('textbox', { name: 'Kata Sandi' })
    2) <button type="button" aria-label="Tampilkan kata sandi" class="absolute right-3 p-1 rounded hover:bg-surface-container text-outline focus:outline-none focus:ring-2 focus:ring-primary">…</button> aka getByRole('button', { name: 'Tampilkan kata sandi' })

Call log:
  - waiting for getByLabel(/kata sandi/i)

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - main [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e6]: health_and_safety
      - heading "Masuk ke Akun" [level=1] [ref=e7]
      - paragraph [ref=e8]: Layanan Kesehatan Jiwa MHFA
    - generic [ref=e9]:
      - generic [ref=e10]:
        - generic [ref=e11]: Alamat Email
        - generic [ref=e12]:
          - generic [ref=e13]: mail
          - textbox "Alamat Email" [active] [ref=e14]:
            - /placeholder: contoh@email.com
            - text: konselor@email.com
      - generic [ref=e15]:
        - generic [ref=e16]: Kata Sandi
        - generic [ref=e17]:
          - generic [ref=e18]: lock
          - textbox "Kata Sandi" [ref=e19]:
            - /placeholder: Masukkan kata sandi Anda
          - button "Tampilkan kata sandi" [ref=e20]:
            - generic [ref=e21]: visibility
      - link "Lupa kata sandi?" [ref=e23] [cursor=pointer]:
        - /url: /forgot-password
      - button "Masuk arrow_forward" [ref=e24]:
        - text: Masuk
        - generic [ref=e25]: arrow_forward
    - generic [ref=e28]: Atau
    - generic [ref=e30]:
      - text: Belum punya akun?
      - link "Daftar sekarang" [ref=e31] [cursor=pointer]:
        - /url: /register
  - alert [ref=e32]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Counselor Flow', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/login');
  6  |     await page.getByLabel(/alamat email/i).fill('konselor@email.com');
> 7  |     await page.getByLabel(/kata sandi/i).fill('password123');
     |                                          ^ Error: locator.fill: Error: strict mode violation: getByLabel(/kata sandi/i) resolved to 2 elements:
  8  |     await page.getByRole('button', { name: /masuk/i }).click();
  9  |     await page.waitForURL('**/konselor/dashboard', { timeout: 15000 });
  10 |   });
  11 | 
  12 |   test('01. Counselor dashboard loads', async ({ page }) => {
  13 |     await expect(page).toHaveURL(/\/konselor\/dashboard/);
  14 |     await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  15 |   });
  16 | 
  17 |   test('02. Statistics cards visible', async ({ page }) => {
  18 |     // Check for total patients card
  19 |     await expect(page.getByText(/total pasien|pasien/i).first()).toBeVisible();
  20 |   });
  21 | 
  22 |   test('03. Patient list page', async ({ page }) => {
  23 |     await page.goto('/konselor/patients');
  24 |     await expect(page.getByRole('heading', { name: /daftar pasien|patients/i })).toBeVisible();
  25 |   });
  26 | 
  27 |   test('04. Counselor chat page', async ({ page }) => {
  28 |     await page.goto('/konselor/chat/1', { waitUntil: 'domcontentloaded' });
  29 |     await expect(page.getByText(/chat|messages/i)).toBeVisible({ timeout: 3000 }).catch(() => {});
  30 |   });
  31 | 
  32 |   test('05. Counselor navigation menu', async ({ page }) => {
  33 |     // Check for counselor menu items
  34 |     const dashboardLink = page.getByRole('link', { name: /dashboard/i });
  35 |     const patientsLink = page.getByRole('link', { name: /daftar pasien|patients/i });
  36 | 
  37 |     await expect(dashboardLink).toBeVisible();
  38 |     await expect(patientsLink).toBeVisible();
  39 |   });
  40 | });
```