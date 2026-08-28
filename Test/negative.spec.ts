import { test, expect } from '@playwright/test';
// 🤖 Step 1: auto-playwright import kiya
import { auto } from 'auto-playwright'; 

test.describe('Visitor Insurance - Auto-Playwright AI Negative Scenarios', () => {
    
    // Har test se pehle fresh page load hoga
    test.beforeEach(async ({ page }) => {
        await page.goto('https://www.visitorplans.com/', { waitUntil: 'domcontentloaded' });
        
        // 🤖 AI se bol rahe hain ki agar popup hai toh close kar de
        console.log("AI checking for popups...");
        // auto-playwright automatically samajh jayega ki popup close karna hai
        await auto('If there is a promotional popup or modal on the screen, click its close icon or button. If not, do nothing.', { page, test });
        
        await page.waitForTimeout(1500); // UI stable hone ke liye
    });

    test('1. Verify Coverage exceeding limit (Dates)', async ({ page }) => {
        console.log("Testing Coverage Exceeding Limit with AI...");
        
        // 🤖 AI khud Date field dhoondhega aur fill karega
        await auto('Enter 08/28/2026 into the Start Date input field and press Tab on the keyboard', { page, test });
        
        // End date 4 saal baad ki daal rahe hain
        await auto('Enter 08/28/2030 into the End Date input field and press Tab on the keyboard', { page, test });
        
        // Wait kar rahe hain taaki video mein error message saaf dikhe
        await page.waitForTimeout(3000); 
    });

    test('2. Verify Applicant Age with Invalid Inputs', async ({ page }) => {
        const invalidAges = [
            { desc: 'Below Minimum', val: '0' },
            { desc: 'Above Maximum', val: '150' },
            { desc: 'Alphabets', val: 'abc' },
            { desc: 'Special Characters', val: '!@#' },
            { desc: 'Decimal Value', val: '25.5' },
            { desc: 'Negative Number', val: '-5' }
        ];

        console.log("--- Starting AI Negative Tests for Applicant Age ---");
        for (const tc of invalidAges) {
            console.log(`AI entering Applicant Age ${tc.desc}: "${tc.val}"`);
            
            // 🤖 AI ko age daalne aur Tab dabane ka aadesh
            await auto(`Enter "${tc.val}" into the Applicant Age input field and press Tab`, { page, test });
            
            await page.waitForTimeout(1500); 
            
            // 🤖 AI ko field saaf karne ka aadesh
            await auto('Clear the text inside the Applicant Age input field completely', { page, test });
        }
    });

    test('3. Verify Spouse Age with Invalid Inputs', async ({ page }) => {
        const invalidSpouseAges = [
            { desc: 'Alphabets', val: 'xyz' },
            { desc: 'Decimal Value', val: '30.9' },
            { desc: 'Negative Value', val: '-10' },
            { desc: 'Greater than allowed limit', val: '200' }
        ];

        console.log("--- Starting AI Negative Tests for Spouse Age ---");
        for (const tc of invalidSpouseAges) {
            console.log(`AI entering Spouse Age ${tc.desc}: "${tc.val}"`);
            
            // 🤖 AI spouse age bharega
            await auto(`Enter "${tc.val}" into the Spouse Age input field and press Tab`, { page, test });
            
            await page.waitForTimeout(1500);
            
            // 🤖 AI se dabba khali karwana
            await auto('Clear the text inside the Spouse Age input field completely', { page, test });
        }
    });

    test('4. Verify system handles server error (500)', async ({ page }) => {
        console.log("Simulating 500 Server Error on Quote Submission...");
        
        // ⚠️ API request ko intercept karke hum zabardasti 500 error bhej rahe hain
        // Yeh manual hi rahega kyunki AI sirf UI chalata hai, Network nahi
        await page.route('**/*quote*', route => {
            route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Internal Server Error' })
            });
        });

        // 🤖 AI form bharega aur button click karega
        await auto('Enter 30 into the Applicant Age input field', { page, test });
        await auto('Click the Get A Quote button', { page, test });
        
        // Server error aane par website kaisa dikhti hai, wo capture karne ke liye wait
        await page.waitForTimeout(4000); 
    });
});