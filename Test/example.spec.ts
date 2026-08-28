import { test, expect, Page } from '@playwright/test';


test.describe.serial('Visitor Insurance', () => {
    let page: Page;

    async function fillDob(index: number, monthVal: string, yearVal: string, dayText: string) {
        const dobLocator = page.locator(`#tr_dob${index}`);
        
        console.log(`Selecting DOB via Datepicker UI for Traveler ${index}: month=${monthVal}, year=${yearVal}, day=${dayText}`);
        // Click to open the datepicker
        await dobLocator.click();
        await page.waitForSelector('#ui-datepicker-div', { state: 'visible', timeout: 5000 });
        await page.waitForTimeout(500);
        
        // Select the year
        await page.locator('#ui-datepicker-div select.ui-datepicker-year').selectOption(yearVal);
        await page.waitForTimeout(500);
        
        // Select the month (0-indexed: 0 for Jan, 11 for Dec)
        await page.locator('#ui-datepicker-div select.ui-datepicker-month').selectOption(monthVal);
        await page.waitForTimeout(500);
        
        // Click the specific day inside the active month
        await page.locator(`#ui-datepicker-div table.ui-datepicker-calendar td:not(.ui-datepicker-other-month) a`)
            .filter({ hasText: new RegExp(`^${dayText}$`) })
            .first()
            .click();
        await page.waitForTimeout(1500);
    }

    async function fillTravelerAndMailingInfo(travelers: any[]) {
        for (let i = 0; i < travelers.length; i++) {
            const index = i + 1;
            const t = travelers[i];

            console.log(`Filling details for Traveler ${index}: ${t.firstName} ${t.lastName}`);
            
            await page.locator(`#tr_firstName${index}`).fill(t.firstName);
            await page.waitForTimeout(1000);
            
            await page.locator(`#tr_lastName${index}`).fill(t.lastName);
            await page.waitForTimeout(1000);
            
            await page.locator(`#tr_gender${index}`).selectOption(t.gender);
            await page.waitForTimeout(1000);
            
            // Fill Date of Birth
            await fillDob(index, t.dobMonth, t.dobYear, t.dobDay);
            
            await page.locator(`#country_of_citizenship${index}`).selectOption(t.citizenship);
            await page.waitForTimeout(1000);

            if (index === 1 && t.beneficiary) {
                await page.locator('#beneficiary_name').fill(t.beneficiary);
                await page.waitForTimeout(1000);
            }
        }

        console.log(" Filling Mailing Address details...");
        
        await page.locator('#mailing_fname').fill('Abhishek');
        await page.waitForTimeout(1000);
        
        await page.locator('#mailing_lname').fill('Shukla');
        await page.waitForTimeout(1000);
        
        await page.locator('#address1').fill('123 Main St');
        await page.waitForTimeout(1000);
        
        await page.locator('#city').fill('Dallas');
        await page.waitForTimeout(1000);
        
        await page.locator('#living_country').selectOption('USA');
        await page.waitForTimeout(1000);

        // Wait for the AJAX call to replace the #state input with a select dropdown
        console.log("Waiting for US states dropdown to load...");
        await page.waitForSelector('select#state', { timeout: 10000 });
        
        await page.locator('select#state').selectOption('TX');
        await page.waitForTimeout(1000);

        await page.locator('#zipcode').fill('75001');
        await page.waitForTimeout(1000);
        
        await page.locator('#mainEmail').fill('test@example.com');
        await page.waitForTimeout(1000);
        
        await page.locator('#phone').fill('(123) 456-7890');
        await page.waitForTimeout(1000);
        
        // Select 'no' for coming to Florida to work
        await page.locator('#florida_to_work_no').check({ force: true });
        await page.waitForTimeout(1000);

        // Click Continue button
        console.log("Clicking Continue button...");
        await page.locator('button[onclick="countinue();"]').click({ force: true });
        await page.waitForTimeout(2000);

        // Confirm physical location popup if visible
        const locationConsentBtn = page.locator('#confirmEEAHomeCountryyChangeBtn');
        if (await locationConsentBtn.isVisible()) {
            console.log("Physical location restriction consent modal detected. Clicking Continue.");
            await locationConsentBtn.click({ force: true });
            await page.waitForTimeout(2000);
        }
    }

    test.beforeAll(async ({ browser }) => {
        const context = await browser.newContext({
            viewport: null,
            deviceScaleFactor: undefined
        });
        page = await context.newPage();
        
        // Add Dialog listener to automatically accept the age discrepancy warning dialog
        page.on('dialog', async dialog => {
            console.log(`[ALERT/CONFIRM DETECTED] Message: "${dialog.message()}"`);
            await dialog.accept();
            console.log("Dialog successfully accepted.");
        });
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
        const startDate = '08/29/2026'; 

        const startDateInput = page.locator('#sdate');
        await startDateInput.fill(startDate);
        await startDateInput.press('Tab'); 
        await page.waitForTimeout(2000);
    });

    test('5. Enter End Date', async () => {
        const endDate = '08/18/2027'; 

        const endDateInput = page.locator('#edate');
        await endDateInput.fill(endDate);
        await endDateInput.press('Tab'); 
        await page.waitForTimeout(2000);
    });

    test('6. Enter Applicant Age', async () => {
        const primaryAge = '23';
        
        await page.locator('#applicant_age').fill(primaryAge);
        await page.waitForTimeout(2000);
    });

    test('7. Enter Spouse Age', async () => {
        const secondaryAge = '24';
        
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
        console.log("Waiting for 3 seconds before clicking the Buy button...");
        await page.waitForTimeout(3000);

        await buyButton.click({ force: true });
        console.log(" Successfully clicked the Buy button for Atlas Premium America!");
        
        await page.waitForTimeout(4000);
    });

    test('12. Fill Traveler Information', async () => {
        const travelers = [
            { firstName: 'Abhishek', lastName: 'Shukla', gender: 'M', citizenship: 'IND', beneficiary: 'Shushama Shukla', dobMonth: '3', dobYear: '2003', dobDay: '15' },
            { firstName: 'Jane', lastName: 'Shukla', gender: 'F', citizenship: 'IND', dobMonth: '4', dobYear: '2002', dobDay: '16' },
            { firstName: 'Bobby', lastName: 'Shukla', gender: 'M', citizenship: 'IND', dobMonth: '3', dobYear: '2017', dobDay: '15' },
            { firstName: 'Billy', lastName: 'Shukla', gender: 'M', citizenship: 'IND', dobMonth: '4', dobYear: '2018', dobDay: '16' },
            { firstName: 'Lily', lastName: 'Shukla', gender: 'F', citizenship: 'IND', dobMonth: '3', dobYear: '2009', dobDay: '15' },
            { firstName: 'Lucy', lastName: 'Shukla', gender: 'F', citizenship: 'IND', dobMonth: '4', dobYear: '2010', dobDay: '16' },
            { firstName: 'Sally', lastName: 'Shukla', gender: 'F', citizenship: 'IND', dobMonth: '5', dobYear: '2011', dobDay: '17' }
        ];

        console.log("--- Filling Traveler Info ---");
        await fillTravelerAndMailingInfo(travelers);
    });

    test('13. Fill Mailing Address and Transition', async () => {
        console.log("Mailing address and traveler transition complete.");
    });

    test('14. Review Information Tab', async () => {
        console.log(" Reviewing plan details on the Review tab...");
        
        const reviewContinueBtn = page.locator('a[onclick="paymenttab();"]');
        await expect(reviewContinueBtn).toBeVisible({ timeout: 15000 });
        
        // 🎯 Continue button ko screen ke center mein scroll karo click karne se pehle
        await reviewContinueBtn.evaluate((node) => node.scrollIntoView({ behavior: 'smooth', block: 'center' }));
        await page.waitForTimeout(1000);
        
        await reviewContinueBtn.click({ force: true });
        await page.waitForTimeout(4000);
        
        // Check if the HTML modal Age Confirmation is visible
        const confirmBtn = page.locator('#confirmDiscrepancyChangeBtn');
        if (await confirmBtn.isVisible()) {
            console.log("Age Confirmation modal detected. Clicking Confirm.");
            
            // 🎯 Modal ke confirm button ko center mein laao
            await confirmBtn.evaluate((node) => node.scrollIntoView({ behavior: 'smooth', block: 'center' }));
            await confirmBtn.click({ force: true });
            await page.waitForTimeout(3000);
            
            console.log("Clicking Continue button again after confirming age discrepancy...");
            
            // 🎯 Wapas Continue button pe ja kar usko center mein laao
            await reviewContinueBtn.evaluate((node) => node.scrollIntoView({ behavior: 'smooth', block: 'center' }));
            await reviewContinueBtn.click({ force: true });
            await page.waitForTimeout(4000);
        }
        
        // Wait for the Payment tab to load to ensure transition completed
        await page.waitForSelector('#payment_method', { state: 'visible', timeout: 20000 });
    });

    test('15. Fill Payment Details', async () => {
        console.log(" Filling Payment details...");
        
        // Ensure Payment tab element is visible before starting
        await page.waitForSelector('#payment_method', { state: 'visible', timeout: 20000 });
        
        // Select 'no' for coming to Florida to work is done, now confirm billing checkbox on Payment tab
        const billingCheck = page.locator('#billing_check');
        const isChecked = await billingCheck.isChecked();
        if (!isChecked) {
            const billingLabel = page.locator('label[for="billing_check"]');
            // Screen ko is element ke center mein scroll karo
            await billingLabel.evaluate((node) => node.scrollIntoView({ behavior: 'smooth', block: 'center' }));
            await billingLabel.click();
            await page.waitForTimeout(2000);
        }
        
        const paymentMethod = page.locator('#payment_method');
        await paymentMethod.evaluate((node) => node.scrollIntoView({ behavior: 'smooth', block: 'center' }));
        await paymentMethod.selectOption('Vi'); // Visa
        await page.waitForTimeout(2000);
        
        const cardHolderName = page.locator('#card_holder_name');
        await cardHolderName.evaluate((node) => node.scrollIntoView({ behavior: 'smooth', block: 'center' }));
        await cardHolderName.fill('Abhishek Shukla');
        await page.waitForTimeout(2000);
        
        const cardNo = page.locator('#card_no');
        await cardNo.evaluate((node) => node.scrollIntoView({ behavior: 'smooth', block: 'center' }));
        await cardNo.fill('4111222233334444');
        await page.waitForTimeout(2000);
        
        const cardCvv = page.locator('#card_cvv');
        await cardCvv.evaluate((node) => node.scrollIntoView({ behavior: 'smooth', block: 'center' }));
        await cardCvv.fill('123');
        await page.waitForTimeout(2000);
        
        const cardMonth = page.locator('#card_month');
        await cardMonth.evaluate((node) => node.scrollIntoView({ behavior: 'smooth', block: 'center' }));
        await cardMonth.selectOption('12');
        await page.waitForTimeout(2000);
        
        const cardYear = page.locator('#card_year');
        await cardYear.evaluate((node) => node.scrollIntoView({ behavior: 'smooth', block: 'center' }));
        await cardYear.selectOption('2028');
        await page.waitForTimeout(2000);

        // How did you hear about us?
        const hearAbout = page.locator('#hear_about');
        await hearAbout.evaluate((node) => node.scrollIntoView({ behavior: 'smooth', block: 'center' }));
        await hearAbout.selectOption('Google');
        await page.waitForTimeout(10000);

        // Agree to Terms & Conditions
        const termsCond = page.locator('label[for="terms_cond"]');
        await termsCond.evaluate((node) => node.scrollIntoView({ behavior: 'smooth', block: 'center' }));
        await termsCond.click();
        await page.waitForTimeout(10000);

        // Verify the Pay Now button is visible and active
        const payNowBtn = page.locator('button[type="submit"]:has-text("Pay Now")');
        await payNowBtn.evaluate((node) => node.scrollIntoView({ behavior: 'smooth', block: 'center' }));
        await expect(payNowBtn).toBeVisible({ timeout: 18000 });
        
        console.log("Form successfully completed! Pay Now button is visible. Skipping actual payment submission.");
    });

});