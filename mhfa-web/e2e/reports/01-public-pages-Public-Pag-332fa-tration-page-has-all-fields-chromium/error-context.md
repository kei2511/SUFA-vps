# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 01-public-pages.spec.ts >> Public Pages - Login & Registration >> 05. Registration page has all fields
- Location: e2e\01-public-pages.spec.ts:48:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('link', { name: /sudah punya akun/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('link', { name: /sudah punya akun/i })

```

```yaml
- main:
  - text: health_and_safety
  - heading "Daftar Akun Baru" [level=1]
  - paragraph: Layanan Kesehatan Jiwa MHFA
  - text: Kode Undangan vpn_key
  - textbox "Kode Undangan":
    - /placeholder: XXXXXX
  - text: Nama Lengkap person
  - textbox "Nama Lengkap":
    - /placeholder: Masukkan nama lengkap
  - text: Nomor Telepon phone
  - textbox "Nomor Telepon":
    - /placeholder: 08xxxxxxxxxx
  - text: Alamat Email mail
  - textbox "Alamat Email":
    - /placeholder: contoh@email.com
  - text: Tanggal Lahir calendar_today
  - textbox "Tanggal Lahir"
  - text: Kata Sandi lock
  - textbox "Kata Sandi":
    - /placeholder: Min. 8 karakter
  - button "visibility"
  - text: Konfirmasi Kata Sandi lock
  - textbox "Konfirmasi Kata Sandi":
    - /placeholder: Ulangi kata sandi
  - button "visibility"
  - button "Daftar arrow_forward" [disabled]
  - text: Sudah punya akun?
  - link "Masuk":
    - /url: /login
- alert
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
  16 |     await expect(page.getByLabel(/kata sandi/i)).toBeVisible();
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
> 61 |     await expect(page.getByRole('link', { name: /sudah punya akun/i })).toBeVisible();
     |                                                                         ^ Error: expect(locator).toBeVisible() failed
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