# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 07-edge-cases.spec.ts >> Edge Cases & Error Handling >> 02. Refresh dashboard while logged in
- Location: e2e\07-edge-cases.spec.ts:10:7

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
            - text: pasien@email.com
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
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Edge Cases & Error Handling', () => {
  4   | 
  5   |   test('01. 404 page', async ({ page }) => {
  6   |     await page.goto('/halaman-tidak-ada-xyz');
  7   |     await expect(page.getByText(/404|not found/i)).toBeVisible();
  8   |   });
  9   | 
  10  |   test('02. Refresh dashboard while logged in', async ({ page }) => {
  11  |     await page.goto('/login');
  12  |     await page.getByLabel(/alamat email/i).fill('pasien@email.com');
> 13  |     await page.getByLabel(/kata sandi/i).fill('password123');
      |                                          ^ Error: locator.fill: Error: strict mode violation: getByLabel(/kata sandi/i) resolved to 2 elements:
  14  |     await page.getByRole('button', { name: /masuk/i }).click();
  15  |     await page.waitForURL('**/dashboard', { timeout: 15000 });
  16  | 
  17  |     // Refresh page
  18  |     await page.reload();
  19  | 
  20  |     // Should stay on dashboard
  21  |     await expect(page).toHaveURL(/\/dashboard/);
  22  |   });
  23  | 
  24  |   test('03. Login page when already logged in', async ({ page }) => {
  25  |     await page.goto('/login');
  26  |     await page.getByLabel(/alamat email/i).fill('pasien@email.com');
  27  |     await page.getByLabel(/kata sandi/i).fill('password123');
  28  |     await page.getByRole('button', { name: /masuk/i }).click();
  29  |     await page.waitForURL('**/dashboard', { timeout: 15000 });
  30  | 
  31  |     // Try to go to login again
  32  |     await page.goto('/login');
  33  | 
  34  |     // Should redirect to dashboard
  35  |     await expect(page).not.toHaveURL('/login');
  36  |   });
  37  | 
  38  |   test('04. Double form submission prevention', async ({ page }) => {
  39  |     await page.goto('/login');
  40  | 
  41  |     const submitBtn = page.getByRole('button', { name: /masuk/i });
  42  | 
  43  |     // Try rapid clicks
  44  |     await submitBtn.click();
  45  |     await submitBtn.click();
  46  | 
  47  |     // Should only process once
  48  |     await page.waitForTimeout(2000);
  49  |   });
  50  | 
  51  |   test('05. Form validation - empty fields', async ({ page }) => {
  52  |     await page.goto('/login');
  53  | 
  54  |     const submitBtn = page.getByRole('button', { name: /masuk/i });
  55  |     await submitBtn.click();
  56  | 
  57  |     // Should show validation errors
  58  |     await expect(page.getByText(/required|wajib|harus diisi/i).first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  59  |   });
  60  | 
  61  |   test('06. Email validation', async ({ page }) => {
  62  |     await page.goto('/login');
  63  | 
  64  |     await page.getByLabel(/alamat email/i).fill('invalid-email');
  65  |     await page.getByLabel(/kata sandi/i).fill('password123');
  66  |     await page.getByRole('button', { name: /masuk/i }).click();
  67  | 
  68  |     // Should show invalid email error
  69  |     await expect(page.getByText(/email tidak valid|invalid email/i)).toBeVisible({ timeout: 5000 }).catch(() => {});
  70  |   });
  71  | 
  72  |   test('07. Invalid credentials', async ({ page }) => {
  73  |     await page.goto('/login');
  74  | 
  75  |     await page.getByLabel(/alamat email/i).fill('wrong@email.com');
  76  |     await page.getByLabel(/kata sandi/i).fill('wrongpassword');
  77  |     await page.getByRole('button', { name: /masuk/i }).click();
  78  | 
  79  |     // Should show error message
  80  |     await expect(page.getByText(/gagal|error|invalid|salah/i).first()).toBeVisible({ timeout: 10000 }).catch(() => {});
  81  |   });
  82  | 
  83  |   test('08. Session timeout redirect', async ({ page }) => {
  84  |     await page.goto('/login');
  85  |     await page.getByLabel(/alamat email/i).fill('pasien@email.com');
  86  |     await page.getByLabel(/kata sandi/i).fill('password123');
  87  |     await page.getByRole('button', { name: /masuk/i }).click();
  88  |     await page.waitForURL('**/dashboard');
  89  | 
  90  |     // Clear storage to simulate timeout
  91  |     await page.context().clearCookies();
  92  |     await page.context().clearStorage();
  93  | 
  94  |     // Try to access protected page
  95  |     await page.goto('/dashboard');
  96  | 
  97  |     // Should redirect to login
  98  |     await expect(page).toHaveURL(/\/login/);
  99  |   });
  100 | 
  101 | });
```