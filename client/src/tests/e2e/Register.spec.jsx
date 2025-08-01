import { randomUUID } from 'crypto';
import { test, expect } from '@playwright/test';
import axios from 'axios';

const backendURL = 'http://localhost:3000'; // TODO use env variable but it fails for now using import.meta.env.BACKEND_URL

test.describe('Visual', async () => {
  test("title", async ({ page }) => {
    await page.goto('/registration');

    const header = page.locator('.login-header');

    await expect(header).toContainText('Register');
  })
})

test.describe('Register Functionality', async () => {  
  const uuid = randomUUID();
  const testName = `test${uuid}`;
  const testEmail = `test${uuid}@example.com`;
  const testPassword = testEmail;

  test.afterAll(async () => {
    try {
      await axios.delete(`${backendURL}/api/dev/cleanup/users`, {
        data: {
          email: testEmail
        }
      })
    } catch (error) {
      console.log("Register.spec.jsx failed at deleting test user ", error);
    }
  })

  test("register", async ({ page }) => {
    await page.goto('/registration');
    
    const nameInput = page.getByTestId('name-input');
    const emailInput = page.getByTestId('email-input');
    const passwordInput = page.getByTestId('password-input');
    const registerButton = page.getByTestId('register-button');

    await nameInput.fill(testName);
    await emailInput.fill(testEmail);
    await passwordInput.fill(testPassword);
    
    await registerButton.click();

    await expect(page).toHaveURL('/login'); 
  })
});