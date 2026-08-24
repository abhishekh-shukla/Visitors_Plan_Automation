import { test, expect, Page } from '@playwright/test';

test.describe.serial('Visitor Insurance', () => {
    let page: Page;

    test.beforeAll(async ({ browser }) => {
        const context = await browser.newContext({
            viewport: null,
            deviceScaleFactor: undefined
        });
        page = await context.newPage();
    });

    test.afterAll(async () => {
        await page.close();
    });

    test('1. Load Page', async () => {
        await page.goto('https://www.visitorplans.com/', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);
        await page.locator('.clip-image_003').click({ force: true });
        await page.waitForTimeout(2000); 
    });

    test('2. Select Home Country (India)', async () => {
        await page.locator('a').filter({ hasText: 'Home Country' }).click({ force: true });
        await page.waitForTimeout(500); 
        
        await page.locator('ul.dropdown li[title="India"]').click({ force: true });
        await page.waitForTimeout(2000);
    });

    test('3. Select Destination Country (USA)', async () => {
        await page.locator('a').filter({ hasText: 'United States of America' }).first().click({ force: true });
        await page.waitForTimeout(500);
        
        await page.locator('ul.dropdown li[title="United States of America"]').click({ force: true });
        await page.waitForTimeout(2000);
    });

    test('4. Enter Start Date', async () => {
        const startDate = '08/28/2026'; 

        const startDateInput = page.locator('#sdate');
        await startDateInput.fill(startDate);
        await startDateInput.press('Tab'); 
        await page.waitForTimeout(2000);
    });

    test('5. Enter End Date', async () => {
        const endDate = '08/17/2027'; 

        const endDateInput = page.locator('#edate');
        await endDateInput.fill(endDate);
        await endDateInput.press('Tab'); 
        await page.waitForTimeout(2000);
    });

    test('6. Enter Applicant Age', async () => {
        const primaryAge = '32';
        
        await page.locator('#applicant_age').fill(primaryAge);
        await page.waitForTimeout(2000);
    });

    test('7. Enter Spouse Age', async () => {
        const secondaryAge = '33';
        
        await page.locator('#spouse_age').fill(secondaryAge);
        await page.waitForTimeout(2000);
    });

    test('8. Select Number of Children', async () => {
        const numberOfChildren0to9 = '2';
        const numberOfChildren10to17 = '3';

        // 0-9 Years Dropdown
        await page.locator('#dependent').selectOption(numberOfChildren0to9);
        await page.waitForTimeout(2000);

        // 10-17 Years Dropdown
        await page.locator('#dependentgreaterten').selectOption(numberOfChildren10to17);
        await page.waitForTimeout(2000);
    });

    test('9. Click Get A Quote', async () => {
        const getQuoteBtn = page.locator('button[type="submit"]:has-text("Get A Quote")');
        
        await expect(getQuoteBtn).toBeVisible();
        await getQuoteBtn.click({ force: true });
        
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(6000); 
    });

    test('10. Find and Scroll to Atlas Premium America Plan', async () => {
        const planHeading = page.locator('h3.search_plan_name').filter({ hasText: 'Atlas Premium America' });

        await expect(planHeading).toBeVisible({ timeout: 15000 });
        
        // Scroll the element right to the center of the screen smoothly
        await planHeading.evaluate((node) => {
            node.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        });
        
        await page.waitForTimeout(1000); // Short wait for the scroll animation to finish

        console.log("🎯 Atlas Premium America plan found and scrolled to the center of the screen!");
        
        await planHeading.click({ force: true });
        await page.waitForTimeout(2000);
    });

    test('11. Click Buy Button for Atlas Premium America', async () => {
        // Target the Buy button specifically using the unique onclick function for plan 279
        const buyButton = page.locator('a.button-buy[onclick*="purchaseVisitorPlans279"]');

        await expect(buyButton).toBeVisible({ timeout: 15000 });
        await buyButton.scrollIntoViewIfNeeded();

        // ⏱️ Wait for 3 seconds before clicking the Buy button
        console.log("⏳ Waiting for 3 seconds before clicking the Buy button...");
        await page.waitForTimeout(3000);

        await buyButton.click({ force: true });
        console.log("🛒 Successfully clicked the Buy button for Atlas Premium America!");
        
        await page.waitForTimeout(4000); 
    });

});