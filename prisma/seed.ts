import { PrismaClient } from '../src/generated/prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Famous persons
  const churchill = await prisma.person.upsert({
    where: { wikidataId: 'Q8016' },
    update: {},
    create: {
      name: 'Winston Churchill',
      bornYear: 1874,
      diedYear: 1965,
      bornCity: 'Woodstock',
      bornCountry: 'England',
      type: 'famous',
      wikidataId: 'Q8016',
      isPublic: true,
      color: '#F59E0B',
    },
  })

  const mj = await prisma.person.upsert({
    where: { wikidataId: 'Q2831' },
    update: {},
    create: {
      name: 'Michael Jackson',
      bornYear: 1958,
      diedYear: 2009,
      bornCity: 'Gary',
      bornCountry: 'USA',
      type: 'famous',
      wikidataId: 'Q2831',
      isPublic: true,
      color: '#60A5FA',
    },
  })

  const qianlong = await prisma.person.upsert({
    where: { wikidataId: 'Q7918' },
    update: {},
    create: {
      name: '乾隆皇帝',
      bornYear: 1711,
      diedYear: 1799,
      bornCity: 'Beijing',
      bornCountry: 'China',
      type: 'famous',
      wikidataId: 'Q7918',
      isPublic: true,
      color: '#A78BFA',
    },
  })

  const grandmother = await prisma.person.upsert({
    where: { wikidataId: 'PERSONAL_GRANDMOTHER_DEMO' },
    update: {},
    create: {
      name: 'Grandmother',
      bornYear: 1928,
      diedYear: null,
      bornCity: 'Shanghai',
      bornCountry: 'China',
      type: 'personal',
      wikidataId: 'PERSONAL_GRANDMOTHER_DEMO',
      isPublic: false,
      color: '#34D399',
    },
  })

  // Life events — Churchill
  await prisma.lifeEvent.createMany({
    skipDuplicates: true,
    data: [
      { personId: churchill.id, year: 1895, title: 'First War Correspondent', description: 'Reported on the Cuban War of Independence for the Daily Graphic.', locationName: 'Cuba' },
      { personId: churchill.id, year: 1900, title: 'Elected to Parliament', description: 'Won his first seat in the House of Commons for Oldham.', locationName: 'London, England' },
      { personId: churchill.id, year: 1940, title: 'Became Prime Minister', description: 'Took over from Chamberlain at the darkest moment of WWII.', locationName: 'London, England' },
      { personId: churchill.id, year: 1945, title: 'V-E Day', description: 'Announced the end of the war in Europe to jubilant crowds.', locationName: 'London, England' },
      { personId: churchill.id, year: 1953, title: 'Nobel Prize in Literature', description: 'Awarded for his historical and biographical writings.', locationName: 'Stockholm, Sweden' },
    ],
  })

  // Life events — Michael Jackson
  await prisma.lifeEvent.createMany({
    skipDuplicates: true,
    data: [
      { personId: mj.id, year: 1964, title: 'Jackson 5 Formed', description: 'Began performing with his brothers in Gary, Indiana.', locationName: 'Gary, USA' },
      { personId: mj.id, year: 1979, title: 'Off the Wall', description: 'Released his breakthrough solo album, produced by Quincy Jones.', locationName: 'Los Angeles, USA' },
      { personId: mj.id, year: 1982, title: 'Thriller Released', description: 'Best-selling album of all time. Changed music and music video forever.', locationName: 'Los Angeles, USA' },
      { personId: mj.id, year: 1987, title: 'Bad World Tour', description: 'First solo world tour — 504 concerts across 15 countries.', locationName: 'Kansas City, USA' },
    ],
  })

  // Life events — Qianlong
  await prisma.lifeEvent.createMany({
    skipDuplicates: true,
    data: [
      { personId: qianlong.id, year: 1735, title: 'Became Emperor', description: 'Ascended to the throne of the Qing Dynasty at age 24.', locationName: 'Beijing, China' },
      { personId: qianlong.id, year: 1793, title: 'Macartney Mission', description: 'Refused British trade mission, declaring China had no need of foreign goods.', locationName: 'Chengde, China' },
      { personId: qianlong.id, year: 1796, title: 'Abdicated', description: 'Stepped down after 60 years to avoid surpassing his grandfather\'s reign.', locationName: 'Beijing, China' },
    ],
  })

  // Life events — Grandmother
  await prisma.lifeEvent.createMany({
    skipDuplicates: true,
    data: [
      { personId: grandmother.id, year: 1949, title: 'Liberation of Shanghai', description: 'Was 21 when the People\'s Liberation Army entered Shanghai. Everything changed overnight.', locationName: 'Shanghai, China' },
      { personId: grandmother.id, year: 1955, title: 'Moved to Hong Kong', description: 'Crossed the border with one suitcase and a photograph of her parents.', locationName: 'Hong Kong' },
      { personId: grandmother.id, year: 1975, title: 'Immigrated to Canada', description: 'Arrived in Toronto in February. Said it was colder than anything she had imagined.', locationName: 'Toronto, Canada' },
      { personId: grandmother.id, year: 1997, title: 'Hong Kong Handover', description: 'Watched the ceremony on television in Toronto. Cried for an hour.', locationName: 'Toronto, Canada' },
    ],
  })

  console.log('✓ Seeded 4 persons and their life events')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
