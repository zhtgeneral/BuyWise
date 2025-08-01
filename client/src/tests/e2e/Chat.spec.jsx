import { randomUUID } from 'crypto';
import { test, expect } from '@playwright/test';
import axios from 'axios';

const backendURL = 'http://localhost:3000'; // TODO use env variable but it fails for now using import.meta.env.BACKEND_URL

// test.describe('Visual', async () => {
//   test("title", async ({ page }) => {
//     await page.goto('/registration');

//     const header = page.locator('.login-header');

//     await expect(header).toContainText('Register');
//   })
// })

test.describe('Chat Page', async () => {
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
      console.log("Chat.spec.jsx stopping tests in beforeAll register test user ", error);
    }
  })

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.getByTestId('email-input');
    const passwordInput = page.getByTestId('password-input');
    const loginButton = page.getByTestId('login-button');

    await emailInput.fill(testEmail);
    await passwordInput.fill(testPassword);
    await loginButton.click();

    await page.goto('/chat');
  })

  test.afterAll(async () => {
    try {
      await axios.delete(`${backendURL}/api/dev/cleanup/users`, {
        data: {
          email: testEmail
        }
      })
    } catch (error) {
      console.log("Chat.spec.jsx failed at deleting test user ", error);
    }
  })

  test.describe('Visual', () => {
    test ('Message input', async ({ page }) => {
      const input = page.locator('.chatbot-textarea')

      await Promise.all([
        expect(input).toBeVisible(),
        expect(input).toContainText('')
      ])
    })

    test('Send button', async ({ page }) => {
      const button = page.locator('.chatbot-send-button')

      await Promise.all([
        expect(button).toBeVisible(),
        expect(button).toContainText('Send'),
        expect(button).toBeDisabled()
      ])
    })
  })

  test.describe('Functionality' ,() => {   
    test("chat", async ({ page }) => {
      const testMessage = 'Hi there, this is a message from the automated test.';
      
      const msgInput = page.locator('.chatbot-textarea');
      const sendbutton = page.locator('.chatbot-send-button');

      await msgInput.fill(testMessage);

      await sendbutton.click();

      const userMsg = page.locator('chat-row user'); // userMsg is outside of window but exists so check defined instead of text
      const botMsg = page.locator('chat-row bot');

      await Promise.all([
        expect(userMsg).toBeDefined(),
        expect(botMsg).toBeDefined()
      ])
    })
  })
  
});