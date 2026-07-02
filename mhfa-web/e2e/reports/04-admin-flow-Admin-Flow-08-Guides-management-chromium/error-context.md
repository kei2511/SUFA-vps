# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 04-admin-flow.spec.ts >> Admin Flow >> 08. Guides management
- Location: e2e\04-admin-flow.spec.ts:52:7

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
            - text: admin@email.com
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
  3  | test.describe('Admin Flow', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/login');
  6  |     await page.getByLabel(/alamat email/i).fill('admin@email.com');
> 7  |     await page.getByLabel(/kata sandi/i).fill('password123');
     |                                          ^ Error: locator.fill: Error: strict mode violation: getByLabel(/kata sandi/i) resolved to 2 elements:
  8  |     await page.getByRole('button', { name: /masuk/i }).click();
  9  |     await page.waitForURL('**/admin/dashboard', { timeout: 15000 });
  10 |   });
  11 | 
  12 |   test('01. Admin dashboard loads', async ({ page }) => {
  13 |     await expect(page).toHaveURL(/\/admin\/dashboard/);
  14 |     await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  15 |   });
  16 | 
  17 |   test('02. Admin statistics cards', async ({ page }) => {
  18 |     // Check for statistics cards
  19 |     await expect(page.getByText(/total|statistics/i).first()).toBeVisible();
  20 |   });
  21 | 
  22 |   test('03. User management page', async ({ page }) => {
  23 |     await page.goto('/admin/users');
  24 |     await expect(page.getByRole('heading', { name: /pengguna|users/i })).toBeVisible();
  25 |   });
  26 | 
  27 |   test('04. User search functionality', async ({ page }) => {
  28 |     await page.goto('/admin/users');
  29 | 
  30 |     const searchInput = page.getByPlaceholder(/cari|search/i);
  31 |     if (await searchInput.isVisible()) {
  32 |       await searchInput.fill('test');
  33 |       await expect(searchInput).toHaveValue('test');
  34 |     }
  35 |   });
  36 | 
  37 |   test('05. Invite codes page', async ({ page }) => {
  38 |     await page.goto('/admin/invite-codes');
  39 |     await expect(page.getByRole('heading', { name: /kode undangan|invite/i })).toBeVisible();
  40 |   });
  41 | 
  42 |   test('06. Questionnaires management', async ({ page }) => {
  43 |     await page.goto('/admin/questionnaires');
  44 |     await expect(page.getByRole('heading', { name: /kuesioner|questionnaire/i })).toBeVisible();
  45 |   });
  46 | 
  47 |   test('07. Questionnaire edit page', async ({ page }) => {
  48 |     await page.goto('/admin/questionnaires/1');
  49 |     await expect(page.getByText(/pertanyaan|question/i)).toBeVisible({ timeout: 3000 }).catch(() => {});
  50 |   });
  51 | 
  52 |   test('08. Guides management', async ({ page }) => {
  53 |     await page.goto('/admin/guides');
  54 |     await expect(page.getByRole('heading', { name: /panduan|guide/i })).toBeVisible();
  55 |   });
  56 | 
  57 |   test('09. Contacts management', async ({ page }) => {
  58 |     await page.goto('/admin/contacts');
  59 |     await expect(page.getByRole('heading', { name: /kontak|contact/i })).toBeVisible();
  60 |   });
  61 | 
  62 |   test('10. Reports page', async ({ page }) => {
  63 |     await page.goto('/admin/reports');
  64 |     await expect(page.getByRole('heading', { name: /laporan|report/i })).toBeVisible();
  65 |   });
  66 | });
```