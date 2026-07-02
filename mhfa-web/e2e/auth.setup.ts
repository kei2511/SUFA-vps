import { test as setup } from '@playwright/test';
import { STORAGE_STATE } from './constants';

const AUTH_FILE = '.auth/user.json';

setup('authenticate as pasien', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('pasien@email.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: /masuk/i }).click();
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  await page.context().storageState({ path: STORAGE_STATE.PASIEN });
});

setup('authenticate as konselor', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('konselor@email.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: /masuk/i }).click();
  await page.waitForURL('**/konselor/dashboard', { timeout: 10000 });
  await page.context().storageState({ path: STORAGE_STATE.KONSELOR });
});

setup('authenticate as admin', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@email.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: /masuk/i }).click();
  await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
  await page.context().storageState({ path: STORAGE_STATE.ADMIN });
});