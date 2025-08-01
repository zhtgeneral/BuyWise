import { test, expect } from '@playwright/test';
import axios from 'axios';
import { randomUUID } from 'crypto';

const backendURL = 'http://localhost:3000'; // TODO use env variable but it fails for now using import.meta.env.BACKEND_URL

test.describe('Login Page', async () => {
  test.describe('Visual', async () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
    })
  
    test("title", async ({ page }) => {
      const header = page.locator('.login-header');
  
      await expect(header).toContainText('Login');
    })
  
    test('ability to switch to register', async ({ page }) => {
      const registerButton = page.getByTestId('register-button');
  
      await registerButton.click();
  
      await expect(page).toHaveURL('/registration'); 
  
      /** Assume the /register page is working with the assigned test file */
    })
  })

  test.describe('Functionality', async () => { 
    const uuid = randomUUID();
    const testName = `test${uuid}`;
    const testEmail = `test${uuid}@example.com`;
    const testPassword = testEmail;

    test.beforeAll(async () => {
      try {
        await axios.post(`${backendURL}/api/auth/register`, {
          name: testName,
          email: testEmail,
          password: testPassword
        })
      } catch (error) {
        console.log("Login.spec.jsx stopping tests in beforeAll register test user ", error);
      }
    })

    test.afterAll(async () => {
      try {
        await axios.delete(`${backendURL}/api/dev/cleanup/users`, {
          data: {
            email: testEmail,
          }
        })
      } catch (error) {
        console.log("Login.spec.jsx stopping tests in afterAll delete test user ", error);
      }
    })

    test("login", async ({ page }) => {
      await page.goto('/login');
      
      const emailInput = page.getByTestId('email-input');
      const passwordInput = page.getByTestId('password-input');
      const loginButton = page.getByTestId('login-button');

      await emailInput.fill(testEmail);
      await passwordInput.fill(testPassword);

      await loginButton.click(); 
      
      await expect(page).toHaveURL('/'); 
      await Promise.all([
        expect(page.locator('.sidebar-auth')).toContainText(`Welcome ${testName}!`), 
        expect(page.locator('.logout-button')).toBeVisible(),
        expect(page.locator('.login-button')).not.toBeVisible()
      ])
    })
  });
})

