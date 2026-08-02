import { config } from 'dotenv'
config({ path: '.env.local' })
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const COLORS = [
  '#F59E0B', '#60A5FA', '#A78BFA', '#34D399', '#F87171',
  '#FB923C', '#E879F9', '#22D3EE', '#A3E635', '#FCD34D',
  '#38BDF8', '#4ADE80', '#C084FC', '#F472B6', '#FBBF24',
]

type Event = { year: number; title: string; locationName?: string; description?: string; importance?: number }
type PersonSeed = {
  name: string; bornYear: number; diedYear: number | null
  bornCity: string; bornCountry: string; wikidataId: string; events: Event[]
}

const PERSONS: PersonSeed[] = [
  // ── Ancient World ──────────────────────────────────────────────────────────
  {
    name: 'Confucius', bornYear: -551, diedYear: -479,
    bornCity: 'Qufu', bornCountry: 'China', wikidataId: 'Q4604',
    events: [
      { year: -501, title: 'Governor of Zhongdu', locationName: 'Lu, China', description: 'Appointed magistrate, reformed the state through moral governance.' },
      { year: -497, title: 'Began Travelling the States', locationName: 'China', description: 'Spent 14 years wandering Chinese states seeking a ruler to implement his ideas.' },
      { year: -479, title: 'Death', locationName: 'Qufu, China', description: 'Died at 72, his ideas later becoming the foundation of Chinese civilisation.' },
    ],
  },
  {
    name: 'Socrates', bornYear: -470, diedYear: -399,
    bornCity: 'Athens', bornCountry: 'Greece', wikidataId: 'Q380',
    events: [
      { year: -431, title: 'Fought in the Peloponnesian War', locationName: 'Athens, Greece', description: 'Served as a foot soldier, noted for bravery at the battle of Delium.' },
      { year: -399, title: 'Trial and Execution', locationName: 'Athens, Greece', description: 'Tried for impiety and corrupting youth. Chose death by hemlock over exile.' },
    ],
  },
  {
    name: 'Plato', bornYear: -428, diedYear: -348,
    bornCity: 'Athens', bornCountry: 'Greece', wikidataId: 'Q859',
    events: [
      { year: -407, title: 'Met Socrates', locationName: 'Athens, Greece', description: 'Became a devoted pupil of Socrates, abandoning his earlier poetic ambitions.' },
      { year: -387, title: 'Founded the Academy', locationName: 'Athens, Greece', description: 'Established the first institution of higher learning in the Western world.' },
      { year: -360, title: 'Wrote The Republic', locationName: 'Athens, Greece', description: 'Completed his most famous work on justice, the ideal state, and the philosopher-king.' },
    ],
  },
  {
    name: 'Aristotle', bornYear: -384, diedYear: -322,
    bornCity: 'Stagira', bornCountry: 'Greece', wikidataId: 'Q868',
    events: [
      { year: -367, title: 'Joined Plato\'s Academy', locationName: 'Athens, Greece', description: 'Studied under Plato for 20 years, later diverging sharply in his methods.' },
      { year: -343, title: 'Tutored Alexander the Great', locationName: 'Macedon, Greece', description: 'Hired by Philip II to educate the young prince Alexander.' },
      { year: -335, title: 'Founded the Lyceum', locationName: 'Athens, Greece', description: 'Established his own school, pioneering systematic observation and classification.' },
    ],
  },
  {
    name: 'Alexander the Great', bornYear: -356, diedYear: -323,
    bornCity: 'Pella', bornCountry: 'Macedon', wikidataId: 'Q8409',
    events: [
      { year: -336, title: 'Became King of Macedon', locationName: 'Pella, Macedon', description: 'Took the throne at 20 after his father Philip II was assassinated.' },
      { year: -334, title: 'Invaded Persia', locationName: 'Hellespont', description: 'Crossed into Asia with 40,000 soldiers, beginning his conquest of the Persian Empire.' },
      { year: -323, title: 'Death in Babylon', locationName: 'Babylon', description: 'Died at 32, cause unknown. His empire immediately fractured among his generals.' },
    ],
  },
  {
    name: 'Julius Caesar', bornYear: -100, diedYear: -44,
    bornCity: 'Rome', bornCountry: 'Roman Republic', wikidataId: 'Q1048',
    events: [
      { year: -60, title: 'First Triumvirate', locationName: 'Rome', description: 'Formed a power-sharing alliance with Pompey and Crassus.' },
      { year: -52, title: 'Battle of Alesia', locationName: 'Gaul', description: 'Defeated Vercingetorix, completing the Roman conquest of Gaul.' },
      { year: -44, title: 'Assassination', locationName: 'Rome', description: 'Stabbed 23 times by senators on the Ides of March.' },
    ],
  },
  {
    name: 'Cleopatra VII', bornYear: -69, diedYear: -30,
    bornCity: 'Alexandria', bornCountry: 'Egypt', wikidataId: 'Q1400',
    events: [
      { year: -51, title: 'Became Queen of Egypt', locationName: 'Alexandria, Egypt', description: 'Co-ruled with her brother Ptolemy XIII at age 18.' },
      { year: -48, title: 'Alliance with Julius Caesar', locationName: 'Alexandria, Egypt', description: 'Formed a political and romantic alliance that secured her throne.' },
      { year: -30, title: 'Death', locationName: 'Alexandria, Egypt', description: 'Died by suicide after Octavian\'s forces defeated Antony\'s fleet at Actium.' },
    ],
  },
  {
    name: 'Augustus', bornYear: -63, diedYear: 14,
    bornCity: 'Rome', bornCountry: 'Roman Republic', wikidataId: 'Q1405',
    events: [
      { year: -31, title: 'Battle of Actium', locationName: 'Greece', description: 'Defeated Mark Antony and Cleopatra, becoming the undisputed ruler of Rome.' },
      { year: -27, title: 'Became First Emperor', locationName: 'Rome', description: 'The Senate granted him the title "Augustus", beginning the Roman Empire.' },
      { year: 14, title: 'Death', locationName: 'Nola, Italy', description: 'Died at 75 after a 40-year reign that transformed Rome into an empire.' },
    ],
  },

  // ── Medieval ───────────────────────────────────────────────────────────────
  {
    name: 'Charlemagne', bornYear: 742, diedYear: 814,
    bornCity: 'Liège', bornCountry: 'Frankish Kingdom', wikidataId: 'Q3781',
    events: [
      { year: 768, title: 'King of the Franks', locationName: 'Aachen', description: 'Inherited the Frankish kingdom and immediately began expanding it.' },
      { year: 800, title: 'Crowned Emperor', locationName: 'Rome, Italy', description: 'Pope Leo III crowned him Emperor of the Romans on Christmas Day.' },
      { year: 804, title: 'Conquered Saxony', locationName: 'Saxony', description: 'Completed 30-year campaign to Christianise and absorb the Saxon tribes.' },
    ],
  },
  {
    name: 'Genghis Khan', bornYear: 1162, diedYear: 1227,
    bornCity: 'Khentii', bornCountry: 'Mongolia', wikidataId: 'Q720',
    events: [
      { year: 1206, title: 'Became Great Khan', locationName: 'Mongolia', description: 'United the Mongol tribes and was proclaimed universal ruler.' },
      { year: 1215, title: 'Conquered Beijing', locationName: 'Beijing, China', description: 'Sacked the Jin Dynasty capital, one of the largest cities in the world.' },
      { year: 1220, title: 'Destroyed Samarkand', locationName: 'Samarkand', description: 'Razed one of the greatest cities of the Islamic world.' },
    ],
  },
  {
    name: 'Marco Polo', bornYear: 1254, diedYear: 1324,
    bornCity: 'Venice', bornCountry: 'Italy', wikidataId: 'Q6101',
    events: [
      { year: 1271, title: 'Departed for China', locationName: 'Venice, Italy', description: 'Set out on a 24-year journey to Asia with his father and uncle.' },
      { year: 1275, title: 'Met Kublai Khan', locationName: 'Xanadu, China', description: 'Arrived at the court of the Mongol emperor and entered his service.' },
      { year: 1298, title: 'Wrote Il Milione', locationName: 'Genoa, Italy', description: 'Dictated his travels while a prisoner of war; the book shaped Europe\'s view of Asia.' },
    ],
  },
  {
    name: 'Dante Alighieri', bornYear: 1265, diedYear: 1321,
    bornCity: 'Florence', bornCountry: 'Italy', wikidataId: 'Q1067',
    events: [
      { year: 1302, title: 'Exiled from Florence', locationName: 'Florence, Italy', description: 'Banished on false charges of corruption, never to return.' },
      { year: 1314, title: 'Began the Divine Comedy', locationName: 'Ravenna, Italy', description: 'Wrote his epic poem spanning Inferno, Purgatorio, and Paradiso.' },
      { year: 1321, title: 'Death in Ravenna', locationName: 'Ravenna, Italy', description: 'Died shortly after completing the Paradiso, aged 56.' },
    ],
  },
  {
    name: 'Christopher Columbus', bornYear: 1451, diedYear: 1506,
    bornCity: 'Genoa', bornCountry: 'Italy', wikidataId: 'Q7322',
    events: [
      { year: 1492, title: 'Reached the Americas', locationName: 'Bahamas', description: 'Made landfall in the Caribbean on October 12, believing he had reached Asia.' },
      { year: 1493, title: 'Second Voyage', locationName: 'Caribbean', description: 'Returned with 17 ships and 1,200 men to establish a permanent colony.' },
      { year: 1506, title: 'Death', locationName: 'Valladolid, Spain', description: 'Died still believing he had reached the coast of Asia.' },
    ],
  },

  // ── Renaissance ────────────────────────────────────────────────────────────
  {
    name: 'Leonardo da Vinci', bornYear: 1452, diedYear: 1519,
    bornCity: 'Vinci', bornCountry: 'Italy', wikidataId: 'Q762',
    events: [
      { year: 1482, title: 'Moved to Milan', locationName: 'Milan, Italy', description: 'Entered the service of Ludovico Sforza as painter, sculptor and engineer.' },
      { year: 1503, title: 'Began the Mona Lisa', locationName: 'Florence, Italy', description: 'Started the painting that would become the most famous in the world.' },
      { year: 1516, title: 'Moved to France', locationName: 'Amboise, France', description: 'Invited by Francis I to live at Château du Clos Lucé until his death.' },
    ],
  },
  {
    name: 'Michelangelo', bornYear: 1475, diedYear: 1564,
    bornCity: 'Caprese', bornCountry: 'Italy', wikidataId: 'Q5592',
    events: [
      { year: 1499, title: 'Completed the Pietà', locationName: 'Rome, Italy', description: 'Finished his marble masterpiece at age 24, the only work he ever signed.' },
      { year: 1512, title: 'Sistine Chapel Ceiling', locationName: 'Vatican City', description: 'Completed four years of painting the ceiling of the Sistine Chapel.' },
      { year: 1547, title: 'Chief Architect of St. Peter\'s', locationName: 'Rome, Italy', description: 'Appointed to redesign St. Peter\'s Basilica, shaping its iconic dome.' },
    ],
  },
  {
    name: 'Nicolaus Copernicus', bornYear: 1473, diedYear: 1543,
    bornCity: 'Toruń', bornCountry: 'Poland', wikidataId: 'Q619',
    events: [
      { year: 1514, title: 'Proposed Heliocentric Model', locationName: 'Frombork, Poland', description: 'Circulated a manuscript arguing the Sun, not Earth, was the centre of the universe.' },
      { year: 1543, title: 'De Revolutionibus Published', locationName: 'Frombork, Poland', description: 'Published his heliocentric theory the year he died, launching the Scientific Revolution.' },
    ],
  },
  {
    name: 'William Shakespeare', bornYear: 1564, diedYear: 1616,
    bornCity: 'Stratford-upon-Avon', bornCountry: 'England', wikidataId: 'Q692',
    events: [
      { year: 1594, title: 'Joined Lord Chamberlain\'s Men', locationName: 'London, England', description: 'Became part-owner and playwright of the most celebrated acting company in England.' },
      { year: 1599, title: 'Globe Theatre Built', locationName: 'London, England', description: 'His company built the Globe Theatre; many of his greatest works premiered there.' },
      { year: 1603, title: 'King\'s Men', locationName: 'London, England', description: 'Received royal patronage from James I, elevating the company\'s status.' },
    ],
  },
  {
    name: 'Galileo Galilei', bornYear: 1564, diedYear: 1642,
    bornCity: 'Pisa', bornCountry: 'Italy', wikidataId: 'Q307',
    events: [
      { year: 1610, title: 'Discovered Jupiter\'s Moons', locationName: 'Padua, Italy', description: 'Used his telescope to discover four moons orbiting Jupiter, challenging Earth-centric views.' },
      { year: 1633, title: 'Trial by the Inquisition', locationName: 'Rome, Italy', description: 'Forced by the Catholic Church to recant his support for the Copernican system.' },
      { year: 1638, title: 'Two New Sciences', locationName: 'Arcetri, Italy', description: 'Published his masterwork on motion and mechanics while under house arrest and blind.' },
    ],
  },

  // ── Enlightenment ──────────────────────────────────────────────────────────
  {
    name: 'Isaac Newton', bornYear: 1643, diedYear: 1727,
    bornCity: 'Woolsthorpe', bornCountry: 'England', wikidataId: 'Q935',
    events: [
      { year: 1666, title: 'Annus Mirabilis', locationName: 'Woolsthorpe, England', description: 'In a single year developed calculus, laws of motion and the theory of gravitation.' },
      { year: 1687, title: 'Principia Mathematica', locationName: 'London, England', description: 'Published the laws of motion and universal gravitation, one of history\'s greatest scientific works.' },
      { year: 1703, title: 'President of the Royal Society', locationName: 'London, England', description: 'Led the world\'s foremost scientific institution for 24 years.' },
    ],
  },
  {
    name: 'Johann Sebastian Bach', bornYear: 1685, diedYear: 1750,
    bornCity: 'Eisenach', bornCountry: 'Germany', wikidataId: 'Q1339',
    events: [
      { year: 1708, title: 'Court Organist in Weimar', locationName: 'Weimar, Germany', description: 'Appointed court organist, composing many of his greatest organ works.' },
      { year: 1723, title: 'Cantor of St. Thomas Church', locationName: 'Leipzig, Germany', description: 'Took up his most important post, composing over 200 cantatas for the church.' },
      { year: 1742, title: 'Goldberg Variations', locationName: 'Leipzig, Germany', description: 'Published his monumental set of keyboard variations.' },
    ],
  },
  {
    name: 'Voltaire', bornYear: 1694, diedYear: 1778,
    bornCity: 'Paris', bornCountry: 'France', wikidataId: 'Q9068',
    events: [
      { year: 1718, title: 'Oedipe Premieres', locationName: 'Paris, France', description: 'His first major play made him famous overnight and earned him the pen name Voltaire.' },
      { year: 1726, title: 'Exiled to England', locationName: 'London, England', description: 'Spent three years in England after imprisonment in the Bastille, discovering English liberalism.' },
      { year: 1759, title: 'Candide Published', locationName: 'Geneva, Switzerland', description: 'Published his satirical novella attacking religious optimism and political corruption.' },
    ],
  },
  {
    name: 'George Washington', bornYear: 1732, diedYear: 1799,
    bornCity: 'Westmoreland County', bornCountry: 'USA', wikidataId: 'Q23',
    events: [
      { year: 1775, title: 'Commander of Continental Army', locationName: 'Philadelphia, USA', description: 'Appointed commander-in-chief of the Continental Army by the Continental Congress.' },
      { year: 1781, title: 'Victory at Yorktown', locationName: 'Virginia, USA', description: 'Cornwallis surrendered, effectively ending the Revolutionary War.' },
      { year: 1789, title: 'First President', locationName: 'New York, USA', description: 'Inaugurated as the first President of the United States of America.' },
    ],
  },
  {
    name: 'Wolfgang Amadeus Mozart', bornYear: 1756, diedYear: 1791,
    bornCity: 'Salzburg', bornCountry: 'Austria', wikidataId: 'Q254',
    events: [
      { year: 1762, title: 'First European Tour', locationName: 'Vienna, Austria', description: 'At age six, performed for the Empress Maria Theresa in Vienna.' },
      { year: 1782, title: 'The Abduction from the Seraglio', locationName: 'Vienna, Austria', description: 'His opera was a sensation; Emperor Joseph II reportedly said it had "too many notes".' },
      { year: 1791, title: 'Requiem and Death', locationName: 'Vienna, Austria', description: 'Died at 35 while composing his Requiem, leaving it unfinished.' },
    ],
  },
  {
    name: 'Thomas Jefferson', bornYear: 1743, diedYear: 1826,
    bornCity: 'Shadwell', bornCountry: 'USA', wikidataId: 'Q11812',
    events: [
      { year: 1776, title: 'Wrote the Declaration of Independence', locationName: 'Philadelphia, USA', description: 'Drafted the founding document of the United States at age 33.' },
      { year: 1801, title: 'Third President', locationName: 'Washington D.C., USA', description: 'Elected President, serving two terms and doubling the size of the country with the Louisiana Purchase.' },
      { year: 1819, title: 'Founded the University of Virginia', locationName: 'Charlottesville, USA', description: 'Considered this his greatest achievement alongside the Declaration.' },
    ],
  },
  {
    name: 'Benjamin Franklin', bornYear: 1706, diedYear: 1790,
    bornCity: 'Boston', bornCountry: 'USA', wikidataId: 'seed_franklin',
    events: [
      { year: 1752, title: 'Lightning Rod Experiment', locationName: 'Philadelphia, USA', description: 'Proved lightning was electrical using a kite, leading to the invention of the lightning rod.' },
      { year: 1776, title: 'Signed the Declaration of Independence', locationName: 'Philadelphia, USA', description: 'One of five men who drafted it; the oldest signer at 70.' },
      { year: 1783, title: 'Treaty of Paris', locationName: 'Paris, France', description: 'Helped negotiate the treaty that ended the Revolutionary War.' },
    ],
  },

  // ── 19th Century ───────────────────────────────────────────────────────────
  {
    name: 'Napoleon Bonaparte', bornYear: 1769, diedYear: 1821,
    bornCity: 'Ajaccio', bornCountry: 'France', wikidataId: 'Q517',
    events: [
      { year: 1799, title: 'Seized Power in France', locationName: 'Paris, France', description: 'Led the coup of 18 Brumaire, becoming First Consul and effectively ruler of France.' },
      { year: 1804, title: 'Crowned Emperor', locationName: 'Paris, France', description: 'Crowned himself Emperor of the French at Notre-Dame Cathedral before Pope Pius VII.' },
      { year: 1815, title: 'Defeated at Waterloo', locationName: 'Waterloo, Belgium', description: 'Final defeat by Wellington and Blücher, ending his Hundred Days campaign.' },
    ],
  },
  {
    name: 'Ludwig van Beethoven', bornYear: 1770, diedYear: 1827,
    bornCity: 'Bonn', bornCountry: 'Germany', wikidataId: 'Q255',
    events: [
      { year: 1800, title: 'First Symphony Premiered', locationName: 'Vienna, Austria', description: 'His First Symphony established him as the heir to Haydn and Mozart.' },
      { year: 1802, title: 'Confronted His Deafness', locationName: 'Heiligenstadt, Austria', description: 'Wrote the Heiligenstadt Testament, coming to terms with his progressive deafness.' },
      { year: 1824, title: 'Ninth Symphony Premiered', locationName: 'Vienna, Austria', description: 'Conducted the premiere while completely deaf; had to be turned to see the audience\'s applause.' },
    ],
  },
  {
    name: 'Abraham Lincoln', bornYear: 1809, diedYear: 1865,
    bornCity: 'Hodgenville', bornCountry: 'USA', wikidataId: 'Q91',
    events: [
      { year: 1860, title: 'Elected President', locationName: 'Springfield, USA', description: 'Won the presidency on an anti-slavery expansion platform, triggering Southern secession.' },
      { year: 1863, title: 'Emancipation Proclamation', locationName: 'Washington D.C., USA', description: 'Declared enslaved people in Confederate states to be free.' },
      { year: 1865, title: 'Assassination', locationName: 'Washington D.C., USA', description: 'Shot by John Wilkes Booth at Ford\'s Theatre, five days after the Civil War ended.' },
    ],
  },
  {
    name: 'Charles Darwin', bornYear: 1809, diedYear: 1882,
    bornCity: 'Shrewsbury', bornCountry: 'England', wikidataId: 'Q1035',
    events: [
      { year: 1831, title: 'Voyage of the Beagle', locationName: 'Plymouth, England', description: 'Embarked on a five-year scientific voyage around the world that shaped his theory of evolution.' },
      { year: 1859, title: 'On the Origin of Species', locationName: 'London, England', description: 'Published his theory of evolution by natural selection; 1,250 copies sold on the first day.' },
      { year: 1871, title: 'The Descent of Man', locationName: 'London, England', description: 'Applied his evolutionary theory to human origins, igniting enormous controversy.' },
    ],
  },
  {
    name: 'Karl Marx', bornYear: 1818, diedYear: 1883,
    bornCity: 'Trier', bornCountry: 'Germany', wikidataId: 'Q9061',
    events: [
      { year: 1848, title: 'Communist Manifesto', locationName: 'London, England', description: 'Published with Engels on the eve of the European revolutions of 1848.' },
      { year: 1849, title: 'Exiled to London', locationName: 'London, England', description: 'Settled permanently in London after being expelled from France, Belgium and Germany.' },
      { year: 1867, title: 'Das Kapital Published', locationName: 'London, England', description: 'Published the first volume of his critique of political economy, his life\'s masterwork.' },
    ],
  },
  {
    name: 'Queen Victoria', bornYear: 1819, diedYear: 1901,
    bornCity: 'London', bornCountry: 'England', wikidataId: 'Q9439',
    events: [
      { year: 1837, title: 'Became Queen', locationName: 'London, England', description: 'Ascended the throne at 18, beginning the longest reign in British history to that point.' },
      { year: 1861, title: 'Prince Albert Died', locationName: 'Windsor, England', description: 'Her husband\'s death sent her into 40 years of mourning, withdrawing from public life.' },
      { year: 1876, title: 'Empress of India', locationName: 'London, England', description: 'Declared Empress of India by Disraeli, ruling over a quarter of the world\'s population.' },
    ],
  },
  {
    name: 'Leo Tolstoy', bornYear: 1828, diedYear: 1910,
    bornCity: 'Yasnaya Polyana', bornCountry: 'Russia', wikidataId: 'Q7243',
    events: [
      { year: 1869, title: 'War and Peace', locationName: 'Yasnaya Polyana, Russia', description: 'Published his epic novel of Napoleonic Russia, considered one of the greatest novels ever written.' },
      { year: 1877, title: 'Anna Karenina', locationName: 'Moscow, Russia', description: 'Completed his second great novel exploring love, society and moral responsibility.' },
      { year: 1910, title: 'Fled Home, Died in Exile', locationName: 'Astapovo, Russia', description: 'Left his estate at 82 to escape his unhappy marriage; died of pneumonia at a railway station.' },
    ],
  },
  {
    name: 'Vincent van Gogh', bornYear: 1853, diedYear: 1890,
    bornCity: 'Zundert', bornCountry: 'Netherlands', wikidataId: 'Q5582',
    events: [
      { year: 1886, title: 'Moved to Paris', locationName: 'Paris, France', description: 'Arrived to live with his brother Theo and encountered the Impressionist movement.' },
      { year: 1888, title: 'Moved to Arles', locationName: 'Arles, France', description: 'Most prolific period: painted The Yellow House, Sunflowers, and Bedroom in Arles.' },
      { year: 1890, title: 'Death', locationName: 'Auvers-sur-Oise, France', description: 'Shot himself in the chest at 37. Sold only one painting in his lifetime.' },
    ],
  },
  {
    name: 'Nikola Tesla', bornYear: 1856, diedYear: 1943,
    bornCity: 'Smiljan', bornCountry: 'Serbia', wikidataId: 'Q9036',
    events: [
      { year: 1884, title: 'Arrived in America', locationName: 'New York, USA', description: 'Emigrated to the US with four cents in his pocket, a poem, and some calculations.' },
      { year: 1891, title: 'Tesla Coil Invented', locationName: 'New York, USA', description: 'Invented the high-frequency transformer that bears his name, enabling AC power systems.' },
      { year: 1899, title: 'Wireless Power Experiments', locationName: 'Colorado Springs, USA', description: 'Transmitted electricity wirelessly and lit 200 lamps without wires.' },
    ],
  },
  {
    name: 'Sigmund Freud', bornYear: 1856, diedYear: 1939,
    bornCity: 'Freiberg', bornCountry: 'Austria', wikidataId: 'seed_freud',
    events: [
      { year: 1900, title: 'The Interpretation of Dreams', locationName: 'Vienna, Austria', description: 'Published his foundational work on the unconscious mind and dream analysis.' },
      { year: 1905, title: 'Three Essays on Sexuality', locationName: 'Vienna, Austria', description: 'Outlined his theory of psychosexual development, shocking Victorian society.' },
      { year: 1938, title: 'Fled to London', locationName: 'London, England', description: 'Escaped Vienna after the Nazi annexation of Austria, dying in London the following year.' },
    ],
  },
  {
    name: 'Theodore Roosevelt', bornYear: 1858, diedYear: 1919,
    bornCity: 'New York City', bornCountry: 'USA', wikidataId: 'Q33866',
    events: [
      { year: 1901, title: 'Became President', locationName: 'Washington D.C., USA', description: 'Youngest president at 42 after McKinley\'s assassination. Reshaped the American presidency.' },
      { year: 1906, title: 'Nobel Peace Prize', locationName: 'Oslo, Norway', description: 'Awarded for mediating the Russo-Japanese War, the first American to win the Nobel Prize.' },
      { year: 1913, title: 'Amazon Expedition', locationName: 'Brazil', description: 'Led an expedition into the uncharted Amazon, nearly dying of jungle fever.' },
    ],
  },
  {
    name: 'Oscar Wilde', bornYear: 1854, diedYear: 1900,
    bornCity: 'Dublin', bornCountry: 'Ireland', wikidataId: 'seed_oscar_wilde',
    events: [
      { year: 1890, title: 'The Picture of Dorian Gray', locationName: 'London, England', description: 'Published his only novel, scandalising Victorian society with its themes of hedonism.' },
      { year: 1895, title: 'Imprisoned for Gross Indecency', locationName: 'London, England', description: 'Sentenced to two years hard labour for homosexuality; destroyed his health and career.' },
      { year: 1898, title: 'The Ballad of Reading Gaol', locationName: 'Paris, France', description: 'Published his last great work, written after his release from prison.' },
    ],
  },
  {
    name: 'Marie Curie', bornYear: 1867, diedYear: 1934,
    bornCity: 'Warsaw', bornCountry: 'Poland', wikidataId: 'Q7186',
    events: [
      { year: 1898, title: 'Discovered Polonium and Radium', locationName: 'Paris, France', description: 'Discovered two new elements, coining the term "radioactivity".' },
      { year: 1903, title: 'First Nobel Prize in Physics', locationName: 'Stockholm, Sweden', description: 'First woman to win a Nobel Prize, shared with her husband Pierre and Henri Becquerel.' },
      { year: 1911, title: 'Second Nobel Prize in Chemistry', locationName: 'Stockholm, Sweden', description: 'Only person to win Nobel Prizes in two different sciences.' },
    ],
  },
  {
    name: 'Mahatma Gandhi', bornYear: 1869, diedYear: 1948,
    bornCity: 'Porbandar', bornCountry: 'India', wikidataId: 'Q1001',
    events: [
      { year: 1906, title: 'First Civil Disobedience Campaign', locationName: 'Johannesburg, South Africa', description: 'Organised nonviolent resistance against discriminatory laws in South Africa.' },
      { year: 1930, title: 'Salt March', locationName: 'Dandi, India', description: 'Led a 240-mile march to the sea to protest British salt taxes, galvanising Indian independence.' },
      { year: 1948, title: 'Assassination', locationName: 'New Delhi, India', description: 'Shot at a prayer meeting by a Hindu nationalist five months after Indian independence.' },
    ],
  },
  {
    name: 'Charles Dickens', bornYear: 1812, diedYear: 1870,
    bornCity: 'Portsmouth', bornCountry: 'England', wikidataId: 'seed_dickens',
    events: [
      { year: 1836, title: 'The Pickwick Papers', locationName: 'London, England', description: 'His first novel was published in serial form, making him an overnight sensation at 24.' },
      { year: 1843, title: 'A Christmas Carol', locationName: 'London, England', description: 'Published in six weeks; transformed the cultural celebration of Christmas.' },
      { year: 1861, title: 'Great Expectations', locationName: 'London, England', description: 'Published his masterwork of social class and personal ambition.' },
    ],
  },

  // ── Early 20th Century ─────────────────────────────────────────────────────
  {
    name: 'Vladimir Lenin', bornYear: 1870, diedYear: 1924,
    bornCity: 'Simbirsk', bornCountry: 'Russia', wikidataId: 'Q1394',
    events: [
      { year: 1903, title: 'Founded the Bolsheviks', locationName: 'London, England', description: 'Split the Russian Social Democratic Party into Bolsheviks and Mensheviks at a congress in London.' },
      { year: 1917, title: 'October Revolution', locationName: 'Petrograd, Russia', description: 'Led the Bolshevik seizure of power, becoming the world\'s first communist head of state.' },
      { year: 1921, title: 'New Economic Policy', locationName: 'Moscow, Russia', description: 'Introduced limited capitalism to rescue the Soviet economy from collapse.' },
    ],
  },
  {
    name: 'Albert Einstein', bornYear: 1879, diedYear: 1955,
    bornCity: 'Ulm', bornCountry: 'Germany', wikidataId: 'Q937',
    events: [
      { year: 1905, title: 'Miracle Year Papers', locationName: 'Bern, Switzerland', description: 'Published four groundbreaking papers including Special Relativity and E=mc², while working as a patent clerk.' },
      { year: 1915, title: 'General Theory of Relativity', locationName: 'Berlin, Germany', description: 'Completed his masterwork, redefining gravity as the curvature of spacetime.' },
      { year: 1933, title: 'Fled Nazi Germany', locationName: 'Princeton, USA', description: 'Emigrated to the US after Hitler came to power, joining the Institute for Advanced Study.' },
    ],
  },
  {
    name: 'Pablo Picasso', bornYear: 1881, diedYear: 1973,
    bornCity: 'Málaga', bornCountry: 'Spain', wikidataId: 'Q5593',
    events: [
      { year: 1907, title: 'Les Demoiselles d\'Avignon', locationName: 'Paris, France', description: 'Created the proto-Cubist work that shattered the conventions of Western painting.' },
      { year: 1937, title: 'Guernica', locationName: 'Paris, France', description: 'Painted his response to the Nazi bombing of a Basque town, becoming the 20th century\'s most powerful anti-war statement.' },
      { year: 1944, title: 'Joined the Communist Party', locationName: 'Paris, France', description: 'Publicly joined the French Communist Party as a protest against Fascism.' },
    ],
  },
  {
    name: 'Joseph Stalin', bornYear: 1878, diedYear: 1953,
    bornCity: 'Gori', bornCountry: 'Georgia', wikidataId: 'Q855',
    events: [
      { year: 1924, title: 'Became Soviet Leader', locationName: 'Moscow, Russia', description: 'After Lenin\'s death, outmanoeuvred Trotsky and other rivals to become supreme leader.' },
      { year: 1932, title: 'Soviet Famine', locationName: 'Ukraine', description: 'Collectivisation policies caused a famine killing millions, particularly in Ukraine.' },
      { year: 1945, title: 'Victory over Nazi Germany', locationName: 'Moscow, Russia', description: 'The Soviet Union suffered 27 million dead but emerged as a global superpower.' },
    ],
  },
  {
    name: 'Franz Kafka', bornYear: 1883, diedYear: 1924,
    bornCity: 'Prague', bornCountry: 'Czech Republic', wikidataId: 'Q905',
    events: [
      { year: 1915, title: 'The Metamorphosis Published', locationName: 'Prague', description: 'His story of Gregor Samsa waking as a giant insect became a landmark of 20th century literature.' },
      { year: 1919, title: 'In the Penal Colony', locationName: 'Prague', description: 'Published his harrowing story of a torture device, a metaphor for bureaucratic cruelty.' },
      { year: 1924, title: 'Died Before Fame', locationName: 'Vienna, Austria', description: 'Died of tuberculosis at 40, asking his friend Max Brod to burn all his work. Brod published it instead.' },
    ],
  },
  {
    name: 'Adolf Hitler', bornYear: 1889, diedYear: 1945,
    bornCity: 'Braunau am Inn', bornCountry: 'Austria', wikidataId: 'Q352',
    events: [
      { year: 1933, title: 'Became Chancellor of Germany', locationName: 'Berlin, Germany', description: 'Appointed Chancellor, quickly dismantling the Weimar Republic and establishing a dictatorship.' },
      { year: 1939, title: 'Invaded Poland', locationName: 'Berlin, Germany', description: 'Ordered the invasion of Poland on September 1, triggering World War II.' },
      { year: 1945, title: 'Death in Berlin Bunker', locationName: 'Berlin, Germany', description: 'Shot himself as Soviet forces closed in on Berlin, ending the Third Reich.' },
    ],
  },
  {
    name: 'Mao Zedong', bornYear: 1893, diedYear: 1976,
    bornCity: 'Shaoshan', bornCountry: 'China', wikidataId: 'Q15180',
    events: [
      { year: 1934, title: 'The Long March', locationName: 'China', description: 'Led the Red Army on a 6,000-mile retreat, cementing his leadership of the Communist Party.' },
      { year: 1949, title: 'Founded the People\'s Republic', locationName: 'Beijing, China', description: 'Proclaimed the People\'s Republic of China from Tiananmen Gate after defeating the Nationalists.' },
      { year: 1966, title: 'Cultural Revolution', locationName: 'Beijing, China', description: 'Launched a decade of political terror that killed hundreds of thousands and upended Chinese society.' },
    ],
  },
  {
    name: 'Alan Turing', bornYear: 1912, diedYear: 1954,
    bornCity: 'London', bornCountry: 'England', wikidataId: 'Q7251',
    events: [
      { year: 1936, title: 'Turing Machine Paper', locationName: 'Cambridge, England', description: 'Published "On Computable Numbers", laying the theoretical foundation of computer science.' },
      { year: 1940, title: 'Broke Enigma Code', locationName: 'Bletchley Park, England', description: 'Led the team that cracked the Nazi Enigma cipher, credited with shortening the war by two years.' },
      { year: 1952, title: 'Convicted of Gross Indecency', locationName: 'Manchester, England', description: 'Prosecuted for being gay, subjected to chemical castration. Died two years later.' },
    ],
  },
  {
    name: 'Franklin D. Roosevelt', bornYear: 1882, diedYear: 1945,
    bornCity: 'Hyde Park', bornCountry: 'USA', wikidataId: 'seed_fdr',
    events: [
      { year: 1933, title: 'New Deal', locationName: 'Washington D.C., USA', description: 'Launched sweeping economic reforms to pull America out of the Great Depression.' },
      { year: 1941, title: 'Entered World War II', locationName: 'Washington D.C., USA', description: 'Asked Congress for a declaration of war the day after Pearl Harbor.' },
      { year: 1945, title: 'Yalta Conference', locationName: 'Yalta, Ukraine', description: 'Met Churchill and Stalin to plan the post-war world; died two months later in office.' },
    ],
  },
  {
    name: 'Walt Disney', bornYear: 1901, diedYear: 1966,
    bornCity: 'Chicago', bornCountry: 'USA', wikidataId: 'seed_disney',
    events: [
      { year: 1928, title: 'Mickey Mouse Debuted', locationName: 'Los Angeles, USA', description: 'Steamboat Willie introduced Mickey Mouse and pioneered synchronized sound in animation.' },
      { year: 1937, title: 'Snow White Released', locationName: 'Los Angeles, USA', description: 'The first feature-length animated film was called "Disney\'s Folly" — it became the highest-grossing film of 1938.' },
      { year: 1955, title: 'Disneyland Opened', locationName: 'Anaheim, USA', description: 'Opened the first Disney theme park, transforming the entertainment industry.' },
    ],
  },

  // ── Mid 20th Century ───────────────────────────────────────────────────────
  {
    name: 'John F. Kennedy', bornYear: 1917, diedYear: 1963,
    bornCity: 'Brookline', bornCountry: 'USA', wikidataId: 'Q9696',
    events: [
      { year: 1960, title: 'Elected President', locationName: 'Washington D.C., USA', description: 'Became the youngest elected president and the first Catholic president of the United States.' },
      { year: 1962, title: 'Cuban Missile Crisis', locationName: 'Washington D.C., USA', description: 'Navigated the 13-day standoff with the Soviet Union that brought the world to the edge of nuclear war.' },
      { year: 1963, title: 'Assassination', locationName: 'Dallas, USA', description: 'Shot in his motorcade on November 22. Lee Harvey Oswald was charged but murdered before trial.' },
    ],
  },
  {
    name: 'Nelson Mandela', bornYear: 1918, diedYear: 2013,
    bornCity: 'Mvezo', bornCountry: 'South Africa', wikidataId: 'Q8023',
    events: [
      { year: 1964, title: 'Sentenced to Life in Prison', locationName: 'Pretoria, South Africa', description: 'Convicted of sabotage and conspiracy; imprisoned on Robben Island for 18 of his 27 years.' },
      { year: 1990, title: 'Released from Prison', locationName: 'Cape Town, South Africa', description: 'Walked free after 27 years, delivering a speech to a crowd of thousands.' },
      { year: 1994, title: 'First Black President of South Africa', locationName: 'Pretoria, South Africa', description: 'Elected in the first fully democratic election in South African history.' },
    ],
  },
  {
    name: 'Martin Luther King Jr.', bornYear: 1929, diedYear: 1968,
    bornCity: 'Atlanta', bornCountry: 'USA', wikidataId: 'Q8027',
    events: [
      { year: 1955, title: 'Montgomery Bus Boycott', locationName: 'Montgomery, USA', description: 'Led the 381-day boycott that ended segregation on Montgomery\'s buses.' },
      { year: 1963, title: 'I Have a Dream', locationName: 'Washington D.C., USA', description: 'Delivered his defining speech to 250,000 people at the Lincoln Memorial.' },
      { year: 1968, title: 'Assassination', locationName: 'Memphis, USA', description: 'Shot on the balcony of the Lorraine Motel; his murder triggered riots across 100 US cities.' },
    ],
  },
  {
    name: 'Che Guevara', bornYear: 1928, diedYear: 1967,
    bornCity: 'Rosario', bornCountry: 'Argentina', wikidataId: 'Q5809',
    events: [
      { year: 1952, title: 'Motorcycle Diary Journey', locationName: 'South America', description: 'Travelled 8,000 miles across South America; witnessing poverty transformed his political outlook.' },
      { year: 1959, title: 'Cuban Revolution Won', locationName: 'Havana, Cuba', description: 'Helped Fidel Castro overthrow the Batista dictatorship.' },
      { year: 1967, title: 'Executed in Bolivia', locationName: 'La Higuera, Bolivia', description: 'Captured and shot by CIA-backed Bolivian forces, becoming an enduring revolutionary icon.' },
    ],
  },
  {
    name: 'Elvis Presley', bornYear: 1935, diedYear: 1977,
    bornCity: 'Tupelo', bornCountry: 'USA', wikidataId: 'Q303',
    events: [
      { year: 1954, title: 'First Recording at Sun Studio', locationName: 'Memphis, USA', description: 'Recorded "That\'s All Right" with Sam Phillips, launching rock and roll.' },
      { year: 1956, title: 'National Phenomenon', locationName: 'New York, USA', description: 'Appeared on The Ed Sullivan Show to 60 million viewers; the camera famously shot him only from the waist up.' },
      { year: 1977, title: 'Death', locationName: 'Memphis, USA', description: 'Found dead at Graceland at 42; his death was mourned by fans around the world.' },
    ],
  },
  {
    name: 'Marilyn Monroe', bornYear: 1926, diedYear: 1962,
    bornCity: 'Los Angeles', bornCountry: 'USA', wikidataId: 'seed_monroe',
    events: [
      { year: 1953, title: 'Gentlemen Prefer Blondes', locationName: 'Los Angeles, USA', description: 'Her performance cemented her as the defining sex symbol of the 20th century.' },
      { year: 1954, title: 'Married Joe DiMaggio', locationName: 'San Francisco, USA', description: 'Married the baseball legend in a union that lasted only nine months.' },
      { year: 1962, title: 'Happy Birthday, Mr. President', locationName: 'New York, USA', description: 'Her infamous serenade to JFK; she died three months later at 36.' },
    ],
  },
  {
    name: 'Margaret Thatcher', bornYear: 1925, diedYear: 2013,
    bornCity: 'Grantham', bornCountry: 'England', wikidataId: 'seed_thatcher',
    events: [
      { year: 1979, title: 'Became Prime Minister', locationName: 'London, England', description: 'First female Prime Minister of the United Kingdom.' },
      { year: 1982, title: 'Falklands War', locationName: 'London, England', description: 'Ordered the task force to recapture the Falkland Islands from Argentina.' },
      { year: 1990, title: 'Resigned as Prime Minister', locationName: 'London, England', description: 'Ousted by her own party after 11 years in power over opposition to European integration.' },
    ],
  },
  {
    name: 'Muhammad Ali', bornYear: 1942, diedYear: 2016,
    bornCity: 'Louisville', bornCountry: 'USA', wikidataId: 'seed_ali',
    events: [
      { year: 1964, title: 'Won World Heavyweight Title', locationName: 'Miami, USA', description: 'Shocked the world by defeating Sonny Liston and announcing "I am the greatest!"' },
      { year: 1967, title: 'Refused Vietnam Draft', locationName: 'Houston, USA', description: 'Stripped of his title and banned from boxing for three years for conscientious objection.' },
      { year: 1974, title: 'Rumble in the Jungle', locationName: 'Kinshasa, Zaire', description: 'Defeated George Foreman in Zaire with the "rope-a-dope" tactic, reclaiming the heavyweight title.' },
    ],
  },
  {
    name: 'John Lennon', bornYear: 1940, diedYear: 1980,
    bornCity: 'Liverpool', bornCountry: 'England', wikidataId: 'Q1347',
    events: [
      { year: 1963, title: 'Beatlemania Began', locationName: 'London, England', description: 'The Beatles appeared on Sunday Night at the London Palladium; the crowd hysteria coined "Beatlemania".' },
      { year: 1969, title: 'Bed-In for Peace', locationName: 'Amsterdam, Netherlands', description: 'He and Yoko Ono held a honeymoon protest against the Vietnam War from their hotel bed.' },
      { year: 1980, title: 'Assassination', locationName: 'New York, USA', description: 'Shot outside the Dakota building in New York City by Mark David Chapman.' },
    ],
  },
  {
    name: 'Stephen Hawking', bornYear: 1942, diedYear: 2018,
    bornCity: 'Oxford', bornCountry: 'England', wikidataId: 'Q22989',
    events: [
      { year: 1963, title: 'Diagnosed with ALS', locationName: 'Oxford, England', description: 'Given two years to live at age 21; he lived another 55 years.' },
      { year: 1974, title: 'Hawking Radiation', locationName: 'Cambridge, England', description: 'Proposed that black holes emit thermal radiation, a landmark of theoretical physics.' },
      { year: 1988, title: 'A Brief History of Time', locationName: 'Cambridge, England', description: 'Published the best-selling science book that spent 237 weeks on the Sunday Times bestseller list.' },
    ],
  },

  // ── Late 20th Century ──────────────────────────────────────────────────────
  {
    name: 'Steve Jobs', bornYear: 1955, diedYear: 2011,
    bornCity: 'San Francisco', bornCountry: 'USA', wikidataId: 'seed_jobs',
    events: [
      { year: 1976, title: 'Founded Apple', locationName: 'Los Altos, USA', description: 'Co-founded Apple Computer with Steve Wozniak in his parents\' garage.' },
      { year: 1984, title: 'Launched the Macintosh', locationName: 'Cupertino, USA', description: 'Introduced the first mass-market personal computer with a graphical interface.' },
      { year: 2007, title: 'Launched the iPhone', locationName: 'San Francisco, USA', description: 'Unveiled the iPhone, beginning the smartphone era and transforming multiple industries.' },
    ],
  },
  {
    name: 'Princess Diana', bornYear: 1961, diedYear: 1997,
    bornCity: 'Sandringham', bornCountry: 'England', wikidataId: 'seed_diana',
    events: [
      { year: 1981, title: 'Married Prince Charles', locationName: 'London, England', description: 'Watched by 750 million people on television, the largest royal wedding audience in history.' },
      { year: 1987, title: 'AIDS Awareness', locationName: 'London, England', description: 'Shook hands with an AIDS patient without gloves, helping to transform public perception of the disease.' },
      { year: 1997, title: 'Death in Paris', locationName: 'Paris, France', description: 'Killed in a car crash in the Pont de l\'Alma tunnel. Her funeral drew 2.5 billion viewers worldwide.' },
    ],
  },
  {
    name: 'Freddie Mercury', bornYear: 1946, diedYear: 1991,
    bornCity: 'Stone Town', bornCountry: 'Zanzibar', wikidataId: 'seed_mercury',
    events: [
      { year: 1973, title: 'Queen\'s First Album', locationName: 'London, England', description: 'Released Queen\'s debut album, beginning one of rock\'s most theatrical careers.' },
      { year: 1985, title: 'Live Aid Performance', locationName: 'London, England', description: 'Delivered a 21-minute set at Wembley Stadium, widely considered the greatest live performance in rock history.' },
      { year: 1991, title: 'Death', locationName: 'London, England', description: 'Announced he had AIDS the day before dying; his bravery helped reduce the stigma of the disease.' },
    ],
  },
  {
    name: 'David Bowie', bornYear: 1947, diedYear: 2016,
    bornCity: 'London', bornCountry: 'England', wikidataId: 'seed_bowie',
    events: [
      { year: 1972, title: 'Ziggy Stardust', locationName: 'London, England', description: 'Introduced his alien rock-star persona, pioneering glam rock and reinventing pop performance.' },
      { year: 1983, title: 'Let\'s Dance', locationName: 'New York, USA', description: 'His most commercially successful album, produced by Nile Rodgers, reached number one worldwide.' },
      { year: 2016, title: 'Blackstar Released; Death', locationName: 'New York, USA', description: 'Released his final album on his 69th birthday. Died of liver cancer two days later.' },
    ],
  },
  {
    name: 'Nelson Mandela\'s jailer (F.W. de Klerk)', bornYear: 1936, diedYear: 2021,
    bornCity: 'Johannesburg', bornCountry: 'South Africa', wikidataId: 'seed_deklerk',
    events: [
      { year: 1989, title: 'Became President of South Africa', locationName: 'Pretoria, South Africa', description: 'Last leader of apartheid South Africa.' },
      { year: 1990, title: 'Released Mandela', locationName: 'Cape Town, South Africa', description: 'Ordered the release of Nelson Mandela and unbanned the ANC.' },
      { year: 1993, title: 'Nobel Peace Prize', locationName: 'Oslo, Norway', description: 'Shared the Nobel Peace Prize with Mandela for ending apartheid peacefully.' },
    ],
  },
]

async function main() {
  console.log(`Seeding ${PERSONS.length} persons...`)

  for (let i = 0; i < PERSONS.length; i++) {
    const p = PERSONS[i]
    const color = COLORS[i % COLORS.length]

    const person = await prisma.person.upsert({
      where: { wikidataId: p.wikidataId },
      update: {},
      create: {
        name: p.name,
        bornYear: p.bornYear,
        diedYear: p.diedYear,
        bornCity: p.bornCity,
        bornCountry: p.bornCountry,
        type: 'famous',
        wikidataId: p.wikidataId,
        isPublic: true,
        color,
      },
    })

    await prisma.lifeEvent.createMany({
      skipDuplicates: true,
      data: p.events.map((e) => ({
        personId: person.id,
        year: e.year,
        title: e.title,
        description: e.description ?? null,
        locationName: e.locationName ?? null,
        importance: e.importance ?? 1,
        source: 'wikidata',
      })),
    })

    process.stdout.write(`  ✓ ${p.name}\n`)
  }

  // Keep original 3 famous figures + grandmother demo (already in DB via earlier seed)
  console.log(`\n✓ Done — ${PERSONS.length} persons seeded.`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
