import { Person, LifeEvent } from '@/types'

export const PERSONS: Person[] = [
  {
    id: 'churchill',
    name: 'Winston Churchill',
    bornYear: 1874,
    diedYear: 1965,
    bornCity: 'Woodstock',
    bornCountry: 'England',
    type: 'famous',
    color: '#F59E0B',
  },
  {
    id: 'mj',
    name: 'Michael Jackson',
    bornYear: 1958,
    diedYear: 2009,
    bornCity: 'Gary',
    bornCountry: 'USA',
    type: 'famous',
    color: '#60A5FA',
  },
  {
    id: 'qianlong',
    name: '乾隆皇帝',
    bornYear: 1711,
    diedYear: 1799,
    bornCity: 'Beijing',
    bornCountry: 'China',
    type: 'famous',
    color: '#A78BFA',
  },
  {
    id: 'grandmother',
    name: 'Grandmother',
    bornYear: 1928,
    diedYear: null,
    bornCity: 'Shanghai',
    bornCountry: 'China',
    type: 'personal',
    color: '#34D399',
  },
]

export const EVENTS: LifeEvent[] = [
  // Churchill
  { id: 'c1', personId: 'churchill', year: 1895, title: 'First War Correspondent', description: 'Reported on the Cuban War of Independence for the Daily Graphic.', locationName: 'Cuba' },
  { id: 'c2', personId: 'churchill', year: 1900, title: 'Elected to Parliament', description: 'Won his first seat in the House of Commons for Oldham.', locationName: 'London, England' },
  { id: 'c3', personId: 'churchill', year: 1940, title: 'Became Prime Minister', description: 'Took over from Chamberlain at the darkest moment of WWII.', locationName: 'London, England' },
  { id: 'c4', personId: 'churchill', year: 1945, title: 'V-E Day', description: 'Announced the end of the war in Europe to jubilant crowds.', locationName: 'London, England' },
  { id: 'c5', personId: 'churchill', year: 1953, title: 'Nobel Prize in Literature', description: 'Awarded for his historical and biographical writings.', locationName: 'Stockholm, Sweden' },

  // Michael Jackson
  { id: 'mj1', personId: 'mj', year: 1964, title: 'Jackson 5 Formed', description: 'Began performing with his brothers in Gary, Indiana.', locationName: 'Gary, USA' },
  { id: 'mj2', personId: 'mj', year: 1979, title: 'Off the Wall', description: 'Released his breakthrough solo album, produced by Quincy Jones.', locationName: 'Los Angeles, USA' },
  { id: 'mj3', personId: 'mj', year: 1982, title: 'Thriller Released', description: 'Best-selling album of all time. Changed music and music video forever.', locationName: 'Los Angeles, USA' },
  { id: 'mj4', personId: 'mj', year: 1987, title: 'Bad World Tour', description: 'First solo world tour — 504 concerts across 15 countries.', locationName: 'Kansas City, USA' },
  { id: 'mj5', personId: 'mj', year: 1996, title: 'HIStory World Tour', description: 'One of the highest-grossing concert tours in history.', locationName: 'Prague, Czech Republic' },

  // Qianlong
  { id: 'q1', personId: 'qianlong', year: 1735, title: 'Became Emperor', description: 'Ascended to the throne of the Qing Dynasty at age 24.', locationName: 'Beijing, China' },
  { id: 'q2', personId: 'qianlong', year: 1750, title: 'Ten Great Campaigns', description: 'Launched a series of military campaigns expanding the empire to its greatest extent.', locationName: 'Beijing, China' },
  { id: 'q3', personId: 'qianlong', year: 1793, title: 'Macartney Mission', description: 'Refused British trade mission, declaring China had no need of foreign goods.', locationName: 'Chengde, China' },
  { id: 'q4', personId: 'qianlong', year: 1796, title: 'Abdicated', description: 'Stepped down after 60 years to avoid surpassing his grandfather\'s reign.', locationName: 'Beijing, China' },

  // Grandmother
  { id: 'g1', personId: 'grandmother', year: 1949, title: 'Liberation of Shanghai', description: 'Was 21 when the People\'s Liberation Army entered Shanghai. Everything changed overnight.', locationName: 'Shanghai, China' },
  { id: 'g2', personId: 'grandmother', year: 1955, title: 'Moved to Hong Kong', description: 'Crossed the border with one suitcase and a photograph of her parents.', locationName: 'Hong Kong' },
  { id: 'g3', personId: 'grandmother', year: 1967, title: 'Hong Kong Riots', description: 'Lived through the leftist riots. Stayed calm. Kept going to work.', locationName: 'Hong Kong' },
  { id: 'g4', personId: 'grandmother', year: 1975, title: 'Immigrated to Canada', description: 'Arrived in Toronto in February. Said it was colder than anything she had imagined.', locationName: 'Toronto, Canada' },
  { id: 'g5', personId: 'grandmother', year: 1997, title: 'Hong Kong Handover', description: 'Watched the ceremony on television in Toronto. Cried for an hour.', locationName: 'Toronto, Canada' },
]
