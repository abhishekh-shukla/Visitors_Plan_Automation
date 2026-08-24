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

    test('12. Fill Traveler Information', async () => {
        // Fill details for Traveler 1 to 7. DOBs are prepopulated by the page automatically.
        const travelers = [
            { firstName: 'Neekhil', lastName: 'Sharma', gender: 'M', citizenship: 'IND', beneficiary: 'Jane Sharma' },
            { firstName: 'Jane', lastName: 'Sharma', gender: 'F', citizenship: 'IND' },
            { firstName: 'Bobby', lastName: 'Sharma', gender: 'M', citizenship: 'IND' },
            { firstName: 'Billy', lastName: 'Sharma', gender: 'M', citizenship: 'IND' },
            { firstName: 'Lily', lastName: 'Sharma', gender: 'F', citizenship: 'IND' },
            { firstName: 'Lucy', lastName: 'Sharma', gender: 'F', citizenship: 'IND' },
            { firstName: 'Sally', lastName: 'Sharma', gender: 'F', citizenship: 'IND' }
        ];

        for (let i = 0; i < travelers.length; i++) {
            const index = i + 1;
            const t = travelers[i];

            console.log(`✍️ Filling details for Traveler ${index}: ${t.firstName} ${t.lastName}`);
            await page.locator(`#tr_firstName${index}`).fill(t.firstName);
            await page.locator(`#tr_lastName${index}`).fill(t.lastName);
            await page.locator(`#tr_gender${index}`).selectOption(t.gender);
            await page.locator(`#country_of_citizenship${index}`).selectOption(t.citizenship);

            if (index === 1 && t.beneficiary) {
                await page.locator('#beneficiary_name').fill(t.beneficiary);
            }
        }
        await page.waitForTimeout(2000);
    });

    test('13. Fill Mailing Address and Transition', async () => {
        console.log("✍️ Filling Mailing Address details...");
        await page.locator('#mailing_fname').fill('Neekhil');
        await page.locator('#mailing_lname').fill('Sharma');
        await page.locator('#address1').fill('123 Main St');
        await page.locator('#city').fill('Dallas');
        
        await page.locator('#living_country').selectOption('USA');

        // Wait for the AJAX call to replace the #state input with a select dropdown
        console.log("⏳ Waiting for US states dropdown to load...");
        await page.waitForSelector('select#state', { timeout: 10000 });
        await page.locator('select#state').selectOption('TX');

        await page.locator('#zipcode').fill('75001');
        await page.locator('#mainEmail').fill('test@example.com');
        await page.locator('#phone').fill('(123) 456-7890');
        // Select 'no' for coming to Florida to work
        await page.locator('#florida_to_work_no').check({ force: true });

        await page.waitForTimeout(1000);

        // Click first Continue button
        console.log("👉 Clicking first Continue button...");
        await page.locator('button[onclick="countinue();"]').click({ force: true });

        // Wait for page to react
        await page.waitForTimeout(2000);



        // If the Physical Location restriction modal pops up, confirm to continue
        const locationConsentBtn = page.locator('#confirmEEAHomeCountryyChangeBtn');
        if (await locationConsentBtn.isVisible()) {
            console.log("⚠️ Physical location restriction consent modal detected. Clicking Continue.");
            await locationConsentBtn.click({ force: true });
            await page.waitForTimeout(2000);
        }
    });

    test('14. Review Information Tab', async () => {
        console.log("🧐 Reviewing plan details on the Review tab...");
        // Wait for the review tab / review details container to be visible (or just click continue on the tab)
        const reviewContinueBtn = page.locator('a[onclick="paymenttab();"]');
        await expect(reviewContinueBtn).toBeVisible({ timeout: 15000 });
        
        await page.waitForTimeout(1000);
        await reviewContinueBtn.click({ force: true });
        await page.waitForTimeout(2000);
    });

    test('15. Fill Payment Details', async () => {
        console.log("💳 Filling Payment details...");
        
        // Select 'no' for coming to Florida to work is done, now confirm billing checkbox on Payment tab
        const billingCheck = page.locator('#billing_check');
        const isChecked = await billingCheck.isChecked();
        if (!isChecked) {
            await page.locator('label[for="billing_check"]').click();
        }
        
        await page.locator('#payment_method').selectOption('Vi'); // Visa
        await page.locator('#card_holder_name').fill('Neekhil Sharma');
        await page.locator('#card_no').fill('4111222233334444');
        await page.locator('#card_cvv').fill('123');
        await page.locator('#card_month').selectOption('12');
        await page.locator('#card_year').selectOption('2028');

        // How did you hear about us?
        await page.locator('#hear_about').selectOption('Google');

        // Agree to Terms & Conditions
        await page.locator('label[for="terms_cond"]').click();
        await page.waitForTimeout(2000);

        // Verify the Pay Now button is visible and active
        const payNowBtn = page.locator('button[type="submit"]:has-text("Pay Now")');
        await expect(payNowBtn).toBeVisible({ timeout: 15000 });
        console.log("🏆 Form successfully completed! Pay Now button is visible. Skipping actual payment submission.");
    });

});