const SPARQL = 'https://query.wikidata.org/sparql'
const SEARCH = 'https://www.wikidata.org/w/api.php'
const UA = 'Parallels/1.0 (seu.ygr@gmail.com)'

export interface WikidataSearchResult {
  wikidataId: string
  name: string
  description: string
}

export interface WikidataPerson {
  wikidataId: string
  name: string
  bornYear: number
  diedYear: number | null
  bornCity: string | null
  bornCountry: string | null
  events: { year: number; title: string }[]
}

async function sparql(query: string) {
  const url = new URL(SPARQL)
  url.searchParams.set('query', query)
  url.searchParams.set('format', 'json')
  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': UA, 'Accept': 'application/json' },
    next: { revalidate: 3600 },
  })
  return res.json()
}

const PERSON_TERMS = [
  'politician', 'leader', 'emperor', 'king', 'queen', 'president',
  'prime minister', 'artist', 'musician', 'scientist', 'writer', 'author',
  'actor', 'actress', 'athlete', 'soldier', 'general', 'philosopher',
  'inventor', 'explorer', 'revolutionary', 'activist', 'filmmaker',
]

export async function searchWikidata(q: string): Promise<WikidataSearchResult[]> {
  const url = new URL(SEARCH)
  url.searchParams.set('action', 'wbsearchentities')
  url.searchParams.set('search', q)
  url.searchParams.set('language', 'en')
  url.searchParams.set('type', 'item')
  url.searchParams.set('limit', '12')
  url.searchParams.set('format', 'json')

  const res = await fetch(url.toString(), { headers: { 'User-Agent': UA } })
  const data = await res.json()

  return (data.search ?? [])
    .filter((r: { description?: string }) => {
      const desc = (r.description ?? '').toLowerCase()
      return /\b\d{3,4}\b/.test(desc) || PERSON_TERMS.some((t) => desc.includes(t))
    })
    .map((r: { id: string; label: string; description?: string }) => ({
      wikidataId: r.id,
      name: r.label,
      description: r.description ?? '',
    }))
}

export async function fetchWikidataPerson(wikidataId: string, name: string): Promise<WikidataPerson | null> {
  const detailsQuery = `
    SELECT ?birthDate ?deathDate ?birthPlaceLabel ?countryLabel WHERE {
      wd:${wikidataId} wdt:P569 ?birthDate .
      OPTIONAL { wd:${wikidataId} wdt:P570 ?deathDate }
      OPTIONAL { wd:${wikidataId} wdt:P19 ?birthPlace }
      OPTIONAL { wd:${wikidataId} wdt:P27 ?country }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
    } LIMIT 1`

  const eventsQuery = `
    SELECT ?eventLabel ?year WHERE {
      wd:${wikidataId} p:P39 ?stmt .
      ?stmt ps:P39 ?event .
      ?stmt pq:P580 ?startDate .
      BIND(YEAR(?startDate) AS ?year)
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
    } ORDER BY ?year LIMIT 12`

  const [detailsData, eventsData] = await Promise.all([
    sparql(detailsQuery),
    sparql(eventsQuery),
  ])

  const d = detailsData.results?.bindings?.[0]
  if (!d) return null

  const bornYear = parseInt(d.birthDate?.value?.slice(0, 4) ?? '0')
  if (!bornYear) return null

  const events = (eventsData.results?.bindings ?? []).map((b: { eventLabel: { value: string }; year: { value: string } }) => ({
    year: parseInt(b.year.value),
    title: b.eventLabel.value,
  }))

  return {
    wikidataId,
    name,
    bornYear,
    diedYear: d.deathDate ? parseInt(d.deathDate.value.slice(0, 4)) : null,
    bornCity: d.birthPlaceLabel?.value ?? null,
    bornCountry: d.countryLabel?.value ?? null,
    events,
  }
}
