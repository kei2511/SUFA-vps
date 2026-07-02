# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 01-public-pages.spec.ts >> Public Pages - Login & Registration >> 01. Login page loads correctly
- Location: e2e\01-public-pages.spec.ts:5:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByLabel(/kata sandi/i)
Expected: visible
Error: strict mode violation: getByLabel(/kata sandi/i) resolved to 2 elements:
    1) <input value="" required="" id="password" type="password" placeholder="Masukkan kata sandi Anda" class="w-full pl-10 pr-12 py-3 bg-surface border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base text-on-surface placeholder:text-outline-variant"/> aka getByRole('textbox', { name: 'Kata Sandi' })
    2) <button type="button" aria-label="Tampilkan kata sandi" class="absolute right-3 p-1 rounded hover:bg-surface-container text-outline focus:outline-none focus:ring-2 focus:ring-primary">…</button> aka getByRole('button', { name: 'Tampilkan kata sandi' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByLabel(/kata sandi/i)

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
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
          - textbox "Alamat Email" [ref=e14]:
            - /placeholder: contoh@email.com
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
  3  | test.describe('Public Pages - Login & Registration', () => {
  4  | 
  5  |   test('01. Login page loads correctly', async ({ page }) => {
  6  |     await page.goto('/login');
  7  | 
  8  |     // Check logo and heading
  9  |     await expect(page.getByRole('heading', { name: /masuk ke akun/i })).toBeVisible();
  10 | 
  11 |     // Check branding (NOT Kemenkes)
  12 |     await expect(page.getByText(/layanan kesehatan jiwa mhfa/i)).toBeVisible();
  13 | 
  14 |     // Check form fields
  15 |     await expect(page.getByLabel(/alamat email/i)).toBeVisible();
> 16 |     await expect(page.getByLabel(/kata sandi/i)).toBeVisible();
     |                                                  ^ Error: expect(locator).toBeVisible() failed
  17 |   });
  18 | 
  19 |   test('02. Password toggle works', async ({ page }) => {
  20 |     await page.goto('/login');
  21 | 
  22 |     const passwordInput = page.getByLabel(/kata sandi/i);
  23 | 
  24 |     // Initially should be type="password"
  25 |     await expect(passwordInput).toHaveAttribute('type', 'password');
  26 | 
  27 |     // Click toggle (eye icon)
  28 |     const toggleButton = page.locator('button[aria-label*="password"], button:has(svg)').first();
  29 |     if (await toggleButton.isVisible()) {
  30 |       await toggleButton.click();
  31 |       // Should change to type="text"
  32 |       await expect(passwordInput).toHaveAttribute('type', 'text');
  33 |     }
  34 |   });
  35 | 
  36 |   test('03. Forgot password link works', async ({ page }) => {
  37 |     await page.goto('/login');
  38 |     await page.getByRole('link', { name: /lupa kata sandi/i }).click();
  39 |     await expect(page).toHaveURL(/forgot-password/);
  40 |   });
  41 | 
  42 |   test('04. Register link works', async ({ page }) => {
  43 |     await page.goto('/login');
  44 |     await page.getByRole('link', { name: /daftar sekarang/i }).click();
  45 |     await expect(page).toHaveURL(/register/);
  46 |   });
  47 | 
  48 |   test('05. Registration page has all fields', async ({ page }) => {
  49 |     await page.goto('/register');
  50 | 
  51 |     // Check all required fields
  52 |     await expect(page.getByLabel(/kode undangan/i)).toBeVisible();
  53 |     await expect(page.getByLabel(/nama lengkap/i)).toBeVisible();
  54 |     await expect(page.getByLabel(/nomor telepon/i)).toBeVisible();
  55 |     await expect(page.getByLabel(/alamat email|email/i)).toBeVisible();
  56 |     await expect(page.getByLabel(/tanggal lahir/i)).toBeVisible();
  57 |     await expect(page.getByLabel(/kata sandi|password/i).first()).toBeVisible();
  58 |     await expect(page.getByLabel(/konfirmasi kata sandi|konfirmasi password/i)).toBeVisible();
  59 | 
  60 |     // Check "Sudah punya akun?" link
  61 |     await expect(page.getByRole('link', { name: /sudah punya akun/i })).toBeVisible();
  62 |   });
  63 | 
  64 |   test('06. Reset password page loads', async ({ page }) => {
  65 |     await page.goto('/reset-password');
  66 |     await expect(page.getByLabel(/password baru/i).or(page.getByLabel(/new password/i))).toBeVisible();
  67 |   });
  68 | 
  69 |   test('07. 404 page works', async ({ page }) => {
  70 |     await page.goto('/halaman-tidak-ada-xyz-123');
  71 |     await expect(page.getByText(/404|not found/i)).toBeVisible();
  72 |   });
  73 | 
  74 | });
```