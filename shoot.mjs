import puppeteer from 'puppeteer-core'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const OUT = process.argv[2]
const URL = 'http://localhost:5173/'

const seed = {
  'broke.profile': JSON.stringify({ netMonthlyIncome: 60000, existingEmis: 0, cibil: 760 }),
  'broke.debts': JSON.stringify([
    { name: 'Credit card', balance: 40000, annualRatePct: 42, minPayment: 3800 },
    { name: 'Bike loan', balance: 90000, annualRatePct: 11, minPayment: 2950 },
    { name: 'Phone EMI', balance: 30000, annualRatePct: 24, minPayment: 2800 },
  ]),
  'broke.settings': JSON.stringify({ savingsGoalPct: 20 }),
  'broke.streak': JSON.stringify({ current: 6, longest: 9, lastCheckIn: null, freezes: 1 }),
  'broke.checkins': JSON.stringify([]),
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true })

// Seed localStorage, then reload so the app reads it.
await page.goto(URL, { waitUntil: 'networkidle2' })
await page.evaluate((s) => {
  for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v)
}, seed)

async function shot(name, ms = 900) {
  await new Promise((r) => setTimeout(r, ms))
  await page.screenshot({ path: `${OUT}/${name}.png` })
  console.log('shot', name)
}

async function tap(text) {
  await page.evaluate((t) => {
    const els = [...document.querySelectorAll('button, [role=button]')]
    const el = els.find((e) => e.textContent.trim().toUpperCase().includes(t.toUpperCase()))
    if (el) el.click()
  }, text)
}

await page.reload({ waitUntil: 'networkidle2' })
await shot('01-today')

await tap('AFFORD')
await shot('02-afford')

await tap('DEBT')
await shot('03-debt')

await tap('ME')
await shot('04-me')

await browser.close()
console.log('done')
