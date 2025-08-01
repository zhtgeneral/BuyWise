// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Visual', async () => {
  test("title", async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/BuyWise/);
  })

  test("sidebar routes", async ({ page }) => {
    await page.goto('/');
    
    const sidebarLinks = page.locator('.sidebar-separator');
    
    await expect(sidebarLinks).toBeVisible();
    await expect(sidebarLinks).toHaveText(/Create new chat/);
    await expect(sidebarLinks).toHaveText(/Edit Profile/);
    await expect(sidebarLinks).toHaveText(/Explore Products/);
    await expect(sidebarLinks).toHaveText(/About Us/);    
  })
});

// rizz@mail.ca
// RizzRizz1!