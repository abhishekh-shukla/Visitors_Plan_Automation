import { test, expect } from '@playwright/test';

test.describe('Visitor Insurance - Negative Scenarios', () => {
    
    // Load a fresh page before each negative test runs to ensure tests are independent
    test.beforeEach(async ({ page }) => {
        await page.goto('https://www.visitorplans.com/', { waitUntil: 'domcontentloaded' });
        
        // Close the initial popup if it appears on the screen
        const popup = page.locator('.clip-image_003');
        if (await popup.isVisible({ timeout: 5000 })) {
            await popup.click({ force: true });
        }
        await page.waitForTimeout(1500); // Wait briefly for the UI to stabilize
    });

    test('1. Verify Coverage exceeding limit (Dates)', async ({ page }) => {
        console.log("Testing Coverage Exceeding Limit...");
        const startDateInput = page.locator('#sdate');
        const endDateInput = page.locator('#edate');

        // Scroll to the start date field (centered) and enter a valid date
        await startDateInput.evaluate((node) => node.scrollIntoView({ behavior: 'smooth', block: 'center' }));
        await startDateInput.fill('08/28/2026');
        await startDateInput.press('Tab');
        
        // Enter an end date 4 years in the future to intentionally exceed the max duration limit
        await endDateInput.evaluate((node) => node.scrollIntoView({ behavior: 'smooth', block: 'center' }));
        await endDateInput.fill('08/28/2030');
        await endDateInput.press('Tab');
        
        // Pause so the error message is clearly visible in the video recording
        await page.waitForTimeout(3000); 
    });

    test('2. Verify Applicant Age with Invalid Inputs', async ({ page }) => {
        const applicantAgeInput = page.locator('#applicant_age');
        
        // List of all negative/invalid inputs to test
        const invalidAges = [
            { desc: 'Below Minimum', val: '0' },
            { desc: 'Above Maximum', val: '150' },
            { desc: 'Alphabets', val: 'abc' },
            { desc: 'Special Characters', val: '!@#' },
            { desc: 'Decimal Value', val: '25.5' },
            { desc: 'Negative Number', val: '-5' }
        ];

        console.log("--- Starting Negative Tests for Applicant Age ---");
        for (const tc of invalidAges) {
            console.log(`Testing Applicant Age with ${tc.desc}: "${tc.val}"`);
            
            // Scroll the element to the center of the screen before entering data
            await applicantAgeInput.evaluate((node) => node.scrollIntoView({ behavior: 'smooth', block: 'center' }));
            await applicantAgeInput.fill(tc.val);
            await applicantAgeInput.press('Tab');
            
            // Wait to capture the UI's reaction (error messages) in the video
            await page.waitForTimeout(1500); 
            // Clear the field for the next invalid input in the loop
            await applicantAgeInput.clear(); 
        }
    });

    test('3. Verify Spouse Age with Invalid Inputs', async ({ page }) => {
        const spouseAgeInput = page.locator('#spouse_age');
        
        const invalidSpouseAges = [
            { desc: 'Alphabets', val: 'xyz' },
            { desc: 'Decimal Value', val: '30.9' },
            { desc: 'Negative Value', val: '-10' },
            { desc: 'Greater than allowed limit', val: '200' }
        ];

        console.log("--- Starting Negative Tests for Spouse Age ---");
        for (const tc of invalidSpouseAges) {
            console.log(`Testing Spouse Age with ${tc.desc}: "${tc.val}"`);
            
            // Scroll to center
            await spouseAgeInput.evaluate((node) => node.scrollIntoView({ behavior: 'smooth', block: 'center' }));
            await spouseAgeInput.fill(tc.val);
            await spouseAgeInput.press('Tab');
            
            await page.waitForTimeout(1500);
            await spouseAgeInput.clear();
        }
    });

    test('4. Verify system handles server error (500)', async ({ page }) => {
        console.log("Simulating 500 Server Error on Quote Submission...");
        
        // Intercept the API request and forcefully return a 500 Internal Server Error
        await page.route('**/*quote*', route => {
            route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Internal Server Error' })
            });
        });

        // Enter minimum valid data required to activate the Get Quote button
        const applicantAgeInput = page.locator('#applicant_age');
        await applicantAgeInput.evaluate((node) => node.scrollIntoView({ behavior: 'smooth', block: 'center' }));
        await applicantAgeInput.fill('30');
        
        const getQuoteBtn = page.locator('button[type="submit"]:has-text("Get A Quote")');
        await getQuoteBtn.evaluate((node) => node.scrollIntoView({ behavior: 'smooth', block: 'center' }));
        await getQuoteBtn.click({ force: true });
        
        // Wait to record how the frontend UI handles and displays the server error
        await page.waitForTimeout(4000); 
    });

});