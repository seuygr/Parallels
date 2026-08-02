const UA = 'Parallels/1.0 (seu.ygr@gmail.com)'

export interface WikipediaLifeEvent {
  year: number
  title: string
  titleZh: string | null
}

const MAX_EVENTS_PER_PERSON = 15
const MAX_EXTRACT_CHARS = 15_000
const MIN_SENTENCE_LEN = 25
const MAX_SENTENCE_LEN = 280

async function getWikipediaTitles(wikidataId: string): Promise<{ en: string | null; zh: string | null }> {
  const url = new URL('https://www.wikidata.org/w/api.php')
  url.searchParams.set('action', 'wbgetentities')
  url.searchParams.set('ids', wikidataId)
  url.searchParams.set('props', 'sitelinks')
  url.searchParams.set('sitefilter', 'enwiki|zhwiki')
  url.searchParams.set('format', 'json')
  const res = await fetch(url.toString(), { headers: { 'User-Agent': UA }, next: { revalidate: 3600 } })
  const data = await res.json()
  const sitelinks = data.entities?.[wikidataId]?.sitelinks ?? {}
  return {
    en: sitelinks.enwiki?.title ?? null,
    zh: sitelinks.zhwiki?.title ?? null,
  }
}

async function fetchWikipediaExtract(lang: 'en' | 'zh', title: string): Promise<string | null> {
  const url = new URL(`https://${lang}.wikipedia.org/w/api.php`)
  url.searchParams.set('action', 'query')
  url.searchParams.set('prop', 'extracts')
  url.searchParams.set('explaintext', '1')
  url.searchParams.set('redirects', '1')
  url.searchParams.set('titles', title)
  url.searchParams.set('format', 'json')
  url.searchParams.set('formatversion', '2')
  const res = await fetch(url.toString(), { headers: { 'User-Agent': UA }, next: { revalidate: 3600 } })
  const data = await res.json()
  const page = data.query?.pages?.[0]
  if (!page || page.missing || !page.extract) return null
  return page.extract as string
}

// Common abbreviations that end in "." but don't end a sentence (e.g. "O.S. 21 March").
const ABBR = 'St|Mr|Mrs|Ms|Dr|Jr|Sr|vs|etc|No|Ft|approx|Prof|Rev|Gen|Sen|Rep|Gov|Lt|Col|Capt|Sgt|Co|Inc|Ltd|Corp|O\\.S|N\\.S|c|ca'
// Western sentences end in ". " (punctuation + whitespace, guarded against abbreviations).
// CJK sentences end directly in 。！？ with no following whitespace, so that case needs no \s+ requirement.
const SENTENCE_SPLIT_RE = new RegExp(`(?<!\\b(?:${ABBR})\\.)(?<=[.!?])\\s+|(?<=[。！？])`, 'g')

function splitSentences(text: string): string[] {
  return text
    .slice(0, MAX_EXTRACT_CHARS)
    .split(SENTENCE_SPLIT_RE)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('=='))
}

// Matches "1848", "551 BC", "551 BCE" — returns the signed year or null.
function parseYearFromSentence(sentence: string): number | null {
  const match = sentence.match(/\b(\d{3,4})\s*(BCE|BC)?\b/)
  if (!match) return null
  const year = parseInt(match[1])
  return match[2] ? -year : year
}

interface Candidate {
  year: number
  text: string
}

function extractYearEvents(text: string, bornYear: number, diedYear: number | null): Candidate[] {
  const maxYear = diedYear ?? new Date().getFullYear()
  const seenYears = new Set<number>()
  const candidates: Candidate[] = []

  for (const sentence of splitSentences(text)) {
    if (sentence.length < MIN_SENTENCE_LEN || sentence.length > MAX_SENTENCE_LEN) continue
    const year = parseYearFromSentence(sentence)
    if (year === null || year < bornYear || year > maxYear) continue
    if (seenYears.has(year)) continue // keep the first (usually most prominent) mention per year
    seenYears.add(year)
    candidates.push({ year, text: sentence })
    if (candidates.length >= MAX_EVENTS_PER_PERSON) break
  }

  return candidates
}

function buildYearMap(text: string, bornYear: number, diedYear: number | null): Map<number, string> {
  const map = new Map<number, string>()
  for (const { year, text: sentence } of extractYearEvents(text, bornYear, diedYear)) {
    if (!map.has(year)) map.set(year, sentence)
  }
  return map
}

// Falls back to machine translation when the zh Wikipedia article has no sentence for this year.
async function translateToZh(text: string): Promise<string | null> {
  try {
    const url = new URL('https://translate.googleapis.com/translate_a/single')
    url.searchParams.set('client', 'gtx')
    url.searchParams.set('sl', 'en')
    url.searchParams.set('tl', 'zh-CN')
    url.searchParams.set('dt', 't')
    url.searchParams.set('q', text)
    const res = await fetch(url.toString(), { headers: { 'User-Agent': UA } })
    if (!res.ok) return null
    const data = await res.json()
    const translated = data?.[0]?.map((seg: [string]) => seg[0]).join('') ?? null
    return translated || null
  } catch {
    return null
  }
}

// Pulls life events from a person's Wikipedia article rather than Wikidata's structured
// properties, since most historical figures have far richer biographical prose than
// filled-in structured fields (positions held, awards, etc).
export async function fetchWikipediaLifeEvents(
  wikidataId: string,
  bornYear: number,
  diedYear: number | null
): Promise<WikipediaLifeEvent[]> {
  const { en, zh } = await getWikipediaTitles(wikidataId)
  if (!en) return []

  const [enText, zhText] = await Promise.all([
    fetchWikipediaExtract('en', en),
    zh ? fetchWikipediaExtract('zh', zh) : Promise.resolve(null),
  ])
  if (!enText) return []

  const enEvents = extractYearEvents(enText, bornYear, diedYear)
  const zhByYear = zhText ? buildYearMap(zhText, bornYear, diedYear) : new Map<number, string>()

  return Promise.all(
    enEvents.map(async (e) => ({
      year: e.year,
      title: e.text,
      titleZh: zhByYear.get(e.year) ?? (await translateToZh(e.text)),
    }))
  )
}
