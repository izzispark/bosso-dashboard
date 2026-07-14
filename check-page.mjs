import { chromium } from 'playwright';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage();
const errors=[]; page.on('console',m=>{if(m.type()==='error') errors.push('console: '+m.text())}); page.on('pageerror',e=>errors.push('pageerror: '+e.message));
const response=await page.goto('https://dashboard.bosso.izzispark.cloud/',{waitUntil:'networkidle'});
console.log('status',response?.status()); console.log('title',await page.title()); console.log('body', (await page.locator('body').innerText()).slice(0,500)); await page.getByText('Contas a Receber').click(); await page.waitForTimeout(300); console.log('receber', (await page.locator('body').innerText()).slice(0,300)); console.log('errors',JSON.stringify(errors)); await browser.close();
