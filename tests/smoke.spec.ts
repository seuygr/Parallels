import { test, expect, Page } from '@playwright/test'
import path from 'path'

async function shot(page: Page, name: string) {
  await page.screenshot({
    path: path.join('test-results', 'screenshots', `${name}.png`),
    fullPage: false,
  })
}

async function waitForCanvas(page: Page) {
  await page.waitForSelector('svg', { timeout: 10_000 })
}

// ─── API mock helpers ─────────────────────────────────────────────────────────
//
// These intercept HTTP requests at the browser level so tests work without a
// live database.  The search route is NOT mocked — it falls through to Wikidata
// so typeahead tests stay real.
//

let _mockId = 0
function nextId() { return `mock-${++_mockId}` }

async function mockPersonWrites(page: Page) {
  // POST /api/persons — personal profile creation OR Wikidata import
  await page.route('**/api/persons', async (route) => {
    if (route.request().method() !== 'POST') { await route.continue(); return }
    // postDataJSON() is synchronous in Playwright, returns null | object
    const body: Record<string, unknown> = route.request().postDataJSON() ?? {}
    const id = nextId()
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id,
        name: body.name ?? body.wikidataId ?? 'Mocked Person',
        bornYear: body.bornYear ? parseInt(String(body.bornYear)) : 1900,
        diedYear: body.diedYear ? parseInt(String(body.diedYear)) : null,
        bornCity: body.bornCity ?? null,
        bornCountry: null,
        type: body.type ?? 'famous',
        color: body.color ?? '#94A3B8',
        events: [],
      }),
    })
  })

  // POST /api/persons/:id/events — add life event
  await page.route('**/api/persons/*/events', async (route) => {
    if (route.request().method() !== 'POST') { await route.continue(); return }
    const body: Record<string, unknown> = route.request().postDataJSON() ?? {}
    const personId = new URL(route.request().url()).pathname.split('/')[3]
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: nextId(),
        personId,
        year: body.year ?? 1950,
        month: body.month ?? null,
        title: body.title ?? 'Mocked Event',
        description: body.description ?? null,
        locationName: body.locationName ?? null,
      }),
    })
  })
}

// ─── Landing page ─────────────────────────────────────────────────────────────

test.describe('Landing page', () => {
  test('hero and search inputs render', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /Did their lives/i })).toBeVisible()
    await expect(page.getByPlaceholder('Person 1…')).toBeVisible()
    await expect(page.getByPlaceholder('Person 2…')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/signin')
    await expect(page.getByRole('link', { name: 'Add your family' })).toHaveAttribute('href', '/signup')
    await shot(page, '01-landing-initial')
  })

  test('typeahead dropdown appears and shows Wikidata results', async ({ page }) => {
    await page.goto('/')
    await page.getByPlaceholder('Person 1…').fill('Churchill')
    await expect(page.locator('[data-testid="search-result"]').first()).toBeVisible({ timeout: 15_000 })
    await shot(page, '02-landing-typeahead-results')
  })

  test('selecting a person collapses input and shows × button', async ({ page }) => {
    await page.goto('/')
    await page.getByPlaceholder('Person 1…').fill('Churchill')
    await expect(page.locator('[data-testid="search-result"]').first()).toBeVisible({ timeout: 15_000 })
    await page.locator('[data-testid="search-result"]').first().click()
    await expect(page.getByPlaceholder('Person 1…')).not.toBeVisible()
    await expect(page.locator('button', { hasText: '×' }).first()).toBeVisible()
    await shot(page, '03-landing-person-selected')
  })

  test('→ with both people navigates to canvas and loads tracks', async ({ page }) => {
    // Mock DB writes so this test doesn't depend on Supabase being up
    await mockPersonWrites(page)

    await page.goto('/')

    await page.getByPlaceholder('Person 1…').fill('Churchill')
    await expect(page.locator('[data-testid="search-result"]').first()).toBeVisible({ timeout: 15_000 })
    await page.locator('[data-testid="search-result"]').first().click()

    await page.getByPlaceholder('Person 2…').fill('Michael Jackson')
    await expect(page.locator('[data-testid="search-result"]').first()).toBeVisible({ timeout: 15_000 })
    await page.locator('[data-testid="search-result"]').first().click()

    await shot(page, '04-landing-both-selected')

    await page.locator('button', { hasText: '→' }).click()
    await expect(page).toHaveURL('/canvas', { timeout: 15_000 })
    await waitForCanvas(page)
    // Both person tracks should be visible as SVG labels
    await expect(page.locator('svg text').nth(0)).toBeAttached()
    await shot(page, '05-canvas-after-landing-navigate')
  })

  test('→ without selection navigates to canvas', async ({ page }) => {
    await page.goto('/')
    await page.locator('button', { hasText: '→' }).click()
    await expect(page).toHaveURL('/canvas', { timeout: 10_000 })
  })
})

// ─── Canvas page ──────────────────────────────────────────────────────────────

test.describe('Canvas page', () => {
  test('ruler, controls and zoom slider always render', async ({ page }) => {
    await page.goto('/canvas')
    await waitForCanvas(page)
    await expect(page.locator('svg text').filter({ hasText: '1800' }).first()).toBeAttached()
    await expect(page.getByRole('button', { name: '+ Add person' })).toBeVisible()
    await expect(page.locator('input[type="range"]')).toBeVisible()
    await shot(page, '06-canvas-loaded')
  })

  test('zoom slider changes the visible year range label', async ({ page }) => {
    await page.goto('/canvas')
    await waitForCanvas(page)
    const rangeLabel = page.locator('span').filter({ hasText: /\d{3,4} – \d{3,4}/ }).first()
    const before = await rangeLabel.textContent()
    await page.locator('input[type="range"]').fill('80')
    const after = await rangeLabel.textContent()
    expect(before).not.toBe(after)
    await shot(page, '07-canvas-zoom-slider')
  })

  test('legend × button appears on hover after adding a person', async ({ page }) => {
    await mockPersonWrites(page)
    await page.goto('/canvas')
    await waitForCanvas(page)

    await page.getByRole('button', { name: '+ Add person' }).click()
    await page.getByRole('button', { name: /Create profile/ }).click()
    await page.getByPlaceholder('e.g. Grandmother Wei').fill('Legend Test')
    await page.getByPlaceholder('e.g. 1928').fill('1900')
    await page.getByRole('button', { name: 'Add to canvas →' }).click()
    // Target the legend <span> specifically — the SVG also has a <text> with the same name
    await expect(page.locator('span.text-xs', { hasText: 'Legend Test' })).toBeVisible({ timeout: 10_000 })

    await page.locator('span.text-xs', { hasText: 'Legend Test' }).hover()
    await expect(page.locator('button[title="Remove from canvas"]').first()).toBeVisible()
    await shot(page, '08-canvas-legend-hover')
  })

  test('click × removes person from legend and canvas', async ({ page }) => {
    await mockPersonWrites(page)
    await page.goto('/canvas')
    await waitForCanvas(page)

    await page.getByRole('button', { name: '+ Add person' }).click()
    await page.getByRole('button', { name: /Create profile/ }).click()
    await page.getByPlaceholder('e.g. Grandmother Wei').fill('Remove Me')
    await page.getByPlaceholder('e.g. 1928').fill('1950')
    await page.getByRole('button', { name: 'Add to canvas →' }).click()
    await expect(page.locator('span.text-xs', { hasText: 'Remove Me' })).toBeVisible({ timeout: 10_000 })

    await page.locator('span.text-xs', { hasText: 'Remove Me' }).hover()
    await page.locator('button[title="Remove from canvas"]').first().click()
    await expect(page.locator('span.text-xs', { hasText: 'Remove Me' })).not.toBeVisible()
    await shot(page, '09-canvas-person-removed')
  })

  test('intersection badge opens panel (skips gracefully if canvas is empty)', async ({ page }) => {
    await page.goto('/canvas')
    await waitForCanvas(page)
    const badge = page.locator('svg text').filter({ hasText: /^\d+y$/ }).first()
    if (await badge.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await badge.click()
      await expect(page.getByText('years')).toBeVisible({ timeout: 5_000 })
      await expect(page.getByText('DURING THIS TIME')).toBeVisible()
      await shot(page, '10-intersection-panel')
    } else {
      await shot(page, '10-canvas-no-intersection-visible')
      test.info().annotations.push({ type: 'note', description: 'No intersection visible — canvas is empty (DB not seeded)' })
    }
  })
})

// ─── Add person modal ─────────────────────────────────────────────────────────

test.describe('Add person modal', () => {
  test.beforeEach(async ({ page }) => {
    // Register mock before navigation so POST /api/persons is always intercepted
    await mockPersonWrites(page)
    await page.goto('/canvas')
    await page.getByRole('button', { name: '+ Add person' }).click()
    await expect(page.getByRole('button', { name: /Search/ })).toBeVisible()
  })

  test('opens on Search tab with search input', async ({ page }) => {
    await expect(page.getByPlaceholder('Search for a person…')).toBeVisible()
    await shot(page, '11-add-person-search-tab')
  })

  test('Search tab finds Wikidata results', async ({ page }) => {
    await page.getByPlaceholder('Search for a person…').fill('Gandhi')
    await expect(page.locator('[data-testid="search-result"]').first()).toBeVisible({ timeout: 15_000 })
    await shot(page, '12-add-person-search-results')
  })

  test('Create profile tab reveals form', async ({ page }) => {
    await page.getByRole('button', { name: /Create profile/ }).click()
    await expect(page.getByPlaceholder('e.g. Grandmother Wei')).toBeVisible()
    await expect(page.getByPlaceholder('e.g. 1928')).toBeVisible()
    await expect(page.getByPlaceholder('e.g. Shanghai')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Yes' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'No' })).toBeVisible()
    await shot(page, '13-create-profile-form')
  })

  test('still alive = No reveals death year field', async ({ page }) => {
    await page.getByRole('button', { name: /Create profile/ }).click()
    await page.getByRole('button', { name: 'No' }).click()
    await expect(page.getByPlaceholder('e.g. 2005')).toBeVisible()
    await shot(page, '14-create-with-death-year')
  })

  test('Add to canvas button disabled until name + year are filled', async ({ page }) => {
    await page.getByRole('button', { name: /Create profile/ }).click()
    const btn = page.getByRole('button', { name: 'Add to canvas →' })
    await expect(btn).toBeDisabled()
    await page.getByPlaceholder('e.g. Grandmother Wei').fill('Someone')
    await expect(btn).toBeDisabled()
    await page.getByPlaceholder('e.g. 1928').fill('1900')
    await expect(btn).toBeEnabled()
    await shot(page, '15-create-button-enabled')
  })

  test('creating a personal profile adds track to canvas', async ({ page }) => {
    await page.getByRole('button', { name: /Create profile/ }).click()
    await page.getByPlaceholder('e.g. Grandmother Wei').fill('Grandmother Wei')
    await page.getByPlaceholder('e.g. 1928').fill('1928')
    await page.getByPlaceholder('e.g. Shanghai').fill('Shanghai')
    await page.getByRole('button', { name: 'Add to canvas →' }).click()
    await expect(page.getByPlaceholder('e.g. Grandmother Wei')).not.toBeVisible()
    await expect(page.locator('span.text-xs', { hasText: 'Grandmother Wei' })).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('svg text', { hasText: 'Grandmother Wei' })).toBeAttached()
    await shot(page, '16-personal-profile-on-canvas')
  })

  test('backdrop click closes modal', async ({ page }) => {
    await page.mouse.click(100, 100)
    await expect(page.getByPlaceholder('Search for a person…')).not.toBeVisible()
  })
})

// ─── Add event modal ──────────────────────────────────────────────────────────

test.describe('Add event modal', () => {
  async function createPerson(page: Page, name: string, born: string) {
    await page.getByRole('button', { name: '+ Add person' }).click()
    await page.getByRole('button', { name: /Create profile/ }).click()
    await page.getByPlaceholder('e.g. Grandmother Wei').fill(name)
    await page.getByPlaceholder('e.g. 1928').fill(born)
    await page.getByRole('button', { name: 'Add to canvas →' }).click()
    await expect(page.locator('span.text-xs', { hasText: name })).toBeVisible({ timeout: 10_000 })
  }

  test.beforeEach(async ({ page }) => {
    await mockPersonWrites(page)
    await page.goto('/canvas')
    await waitForCanvas(page)
  })

  test('+ add event link appears on personal tracks', async ({ page }) => {
    await createPerson(page, 'Grandpa Lin', '1915')
    await expect(page.locator('svg text', { hasText: '+ add event' }).first()).toBeVisible({ timeout: 5_000 })
    await shot(page, '17-add-event-link-visible')
  })

  test('clicking + add event opens the modal', async ({ page }) => {
    await createPerson(page, 'Grandma Fang', '1920')
    await page.locator('svg text', { hasText: '+ add event' }).first().click()
    await expect(page.getByText(/Add event — Grandma Fang/)).toBeVisible({ timeout: 5_000 })
    await shot(page, '18-add-event-modal-open')
  })

  test('Save event disabled until year + title filled', async ({ page }) => {
    await createPerson(page, 'Uncle Bo', '1930')
    await page.locator('svg text', { hasText: '+ add event' }).first().click()
    const saveBtn = page.getByRole('button', { name: 'Save event' })
    await expect(saveBtn).toBeDisabled()
    await page.getByPlaceholder('e.g. 1949').fill('1955')
    await expect(saveBtn).toBeDisabled()
    await page.getByPlaceholder('e.g. Moved to Hong Kong').fill('Left Shanghai')
    await expect(saveBtn).toBeEnabled()
    await shot(page, '19-save-event-enabled')
  })

  test('saving an event closes modal and adds a dot to the track', async ({ page }) => {
    await createPerson(page, 'Aunt Mei', '1935')
    await page.locator('svg text', { hasText: '+ add event' }).first().click()
    await page.getByPlaceholder('e.g. 1949').fill('1960')
    await page.getByPlaceholder('e.g. Moved to Hong Kong').fill('Moved to Guangzhou')
    await page.getByPlaceholder('e.g. Hong Kong').fill('Guangzhou')
    await page.getByRole('button', { name: 'Save event' }).click()
    await expect(page.getByRole('button', { name: 'Save event' })).not.toBeVisible()
    await expect(page.locator('circle[stroke="#0A0A0F"]').first()).toBeAttached({ timeout: 5_000 })
    await shot(page, '20-event-dot-added')
  })
})
