import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('docs/screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({
        width: 1440,
        height: 900,
        deviceScaleFactor: 2
    });

    const targetUrl = 'http://localhost:5188/';

    // Helper for clicking button by text
    const clickButtonWithText = async (selector, text) => {
        const buttons = await page.$$(selector);
        for (const btn of buttons) {
            const content = await page.evaluate(el => el.textContent, btn);
            if (content.includes(text)) {
                await btn.click();
                return true;
            }
        }
        return false;
    };

    // 1. Main Menu
    console.log('Capturing 01-main-menu.png...');
    await page.goto(targetUrl, { waitUntil: 'networkidle0' });
    await page.waitForSelector('.main-menu', { timeout: 5000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-main-menu.png') });

    // 2. Royal Lore Binder
    console.log('Capturing 02-lore-binder.png...');
    await clickButtonWithText('.menu-btn', 'Royal Lore Binder');
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-lore-binder.png') });

    // 3. Realm Multiplayer Lobby
    console.log('Capturing 03-multiplayer-lobby.png...');
    await page.goto(targetUrl, { waitUntil: 'networkidle0' });
    await clickButtonWithText('.menu-btn', 'Realm Multiplayer');
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-multiplayer-lobby.png') });

    // 4. Standard Joust (Standard Duel / Winston Draft)
    console.log('Capturing 04-standard-duel.png...');
    await page.goto(targetUrl, { waitUntil: 'networkidle0' });
    await clickButtonWithText('.menu-btn', 'Standard Joust');
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-standard-duel.png') });

    // 5. Tri-Squad Arena (Pack Opening - Sealed)
    console.log('Capturing 05-pack-opening-sealed.png...');
    await page.goto(targetUrl, { waitUntil: 'networkidle0' });
    await clickButtonWithText('.menu-btn', 'Tri-Squad Arena');
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-pack-opening-sealed.png') });

    // 6. Pack Opening - Revealed
    console.log('Capturing 06-pack-opening-revealed.png...');
    await clickButtonWithText('.reveal-all-btn', 'QUICK OPEN');
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-pack-opening-revealed.png') });

    // 7. Squad Builder
    console.log('Capturing 07-squad-builder.png...');
    await clickButtonWithText('.finish-btn', 'GO TO SQUAD BUILDER');
    await new Promise(r => setTimeout(r, 1200));
    await clickButtonWithText('.quick-build-btn', 'QUICK BUILD');
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07-squad-builder.png') });

    // 8. Match Engine
    console.log('Capturing 08-match-engine.png...');
    await clickButtonWithText('.start-match-btn', 'START MATCH');
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08-match-engine.png') });

    console.log('All 8 high-res screenshots captured successfully!');
    await browser.close();
}

run().catch(err => {
    console.error('Error taking screenshots:', err);
    process.exit(1);
});
