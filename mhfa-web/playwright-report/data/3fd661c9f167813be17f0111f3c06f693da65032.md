# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 02-patient-flow.spec.ts >> Patient Flow >> 04. Start Screening flow
- Location: e2e\02-patient-flow.spec.ts:35:7

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
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Patient Flow', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // Login as patient
  6  |     await page.goto('/login');
  7  |     await page.getByLabel(/alamat email/i).fill('pasien@email.com');
> 8  |     await page.getByLabel(/kata sandi/i).fill('password123');
     |                                          ^ Error: locator.fill: Error: strict mode violation: getByLabel(/kata sandi/i) resolved to 2 elements:
  9  |     await page.getByRole('button', { name: /masuk/i }).click();
  10 |     await page.waitForURL('**/dashboard', { timeout: 15000 });
  11 |   });
  12 | 
  13 |   test('01. Dashboard loads for patient', async ({ page }) => {
  14 |     await expect(page).toHaveURL(/\/dashboard/);
  15 |     await expect(page.getByRole('heading', { name: /selamat datang/i })).toBeVisible();
  16 |   });
  17 | 
  18 |   test('02. Navigation menu - Dashboard', async ({ page }) => {
  19 |     await page.getByRole('link', { name: /dashboard/i }).click();
  20 |     await expect(page).toHaveURL(/\/dashboard/);
  21 |   });
  22 | 
  23 |   test('03. Navigate to Screening', async ({ page }) => {
  24 |     // Check for "Skrining" or "Janji Temu" menu
  25 |     const screeningMenu = page.getByRole('link', { name: /skrining|janji temu/i });
  26 | 
  27 |     if (await screeningMenu.isVisible()) {
  28 |       await screeningMenu.click();
  29 |       await expect(page).toHaveURL(/screening/);
  30 |     } else {
  31 |       console.log('Screening menu not found');
  32 |     }
  33 |   });
  34 | 
  35 |   test('04. Start Screening flow', async ({ page }) => {
  36 |     // Navigate to start screening
  37 |     await page.goto('/screening/start');
  38 | 
  39 |     await expect(page.getByRole('heading', { name: /skrining/i })).toBeVisible();
  40 | 
  41 |     // Click "Mulai Skrining" button
  42 |     await page.getByRole('button', { name: /mulai skrining/i }).click();
  43 | 
  44 |     // Should show questionnaire
  45 |     await expect(page.getByText(/pertanyaan/i).or(page.getByText(/q[1-9]/i))).toBeVisible();
  46 |   });
  47 | 
  48 |   test('05. Complete screening questionnaire', async ({ page }) => {
  49 |     await page.goto('/screening/start');
  50 |     await page.getByRole('button', { name: /mulai skrining/i }).click();
  51 | 
  52 |     // Answer first question and proceed
  53 |     const firstAnswer = page.locator('label').first();
  54 |     if (await firstAnswer.isVisible()) {
  55 |       await firstAnswer.click();
  56 |       await page.getByRole('button', { name: /berikutnya|next/i }).click();
  57 |     }
  58 | 
  59 |     // Try to finish if only one question
  60 |     await page.getByRole('button', { name: /selesai|finish|kirim/i }).click({ timeout: 5000 }).catch(() => {});
  61 |   });
  62 | 
  63 |   test('06. Check Screening Result page', async ({ page }) => {
  64 |     await page.goto('/screening/start');
  65 |     await page.getByRole('button', { name: /mulai skrining/i }).click();
  66 | 
  67 |     // Try to navigate to result directly for quick check
  68 |     await page.goto('/screening/1/result', { waitUntil: 'domcontentloaded' });
  69 |     await expect(page.getByText(/hasil skrining|result/i)).toBeVisible({ timeout: 3000 }).catch(() => {});
  70 |   });
  71 | 
  72 |   test('07. Intervention page', async ({ page }) => {
  73 |     await page.goto('/intervention/1');
  74 | 
  75 |     // Check for intervention options
  76 |     await expect(page.getByText(/curhat|chat|panduan|kontak/i).first()).toBeVisible({ timeout: 3000 }).catch(() => {});
  77 |   });
  78 | 
  79 |   test('08. History page', async ({ page }) => {
  80 |     await page.goto('/history');
  81 |     await expect(page.getByRole('heading', { name: /riwayat/i })).toBeVisible();
  82 |   });
  83 | 
  84 |   test('09. Notifications page', async ({ page }) => {
  85 |     await page.goto('/notifications');
  86 |     await expect(page.getByRole('heading', { name: /notifikasi/i })).toBeVisible();
  87 |   });
  88 | 
  89 |   test('10. Profile/Settings page', async ({ page }) => {
  90 |     // Try both profile and settings
  91 |     const profileMenu = page.getByRole('link', { name: /profile|profil|settings/i });
  92 | 
  93 |     if (await profileMenu.isVisible()) {
  94 |       await profileMenu.click();
  95 |       await expect(page.getByText(/data profil|profile settings/i)).toBeVisible();
  96 |     }
  97 |   });
  98 | });
```