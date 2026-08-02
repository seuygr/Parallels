import { config } from 'dotenv'
config({ path: '.env.local' })
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

type Event = {
  year: number
  title: string
  titleZh: string
  description?: string
  descriptionZh?: string
  locationName?: string
  locationNameZh?: string
  importance?: number
}

const CURATED: Record<string, { nameEn: string; events: Event[] }> = {

  Q10061: {
    nameEn: 'Wanli Emperor',
    events: [
      {
        year: 1572,
        title: 'Ascended to the throne aged 9',
        titleZh: '登基，年仅9岁',
        description: 'Became the 14th Emperor of the Ming Dynasty after his father Longqing died. Grand Secretary Zhang Juzheng acted as regent and implemented sweeping reforms.',
        descriptionZh: '隆庆帝驾崩后，年仅九岁的万历皇帝即位，成为明朝第十四位皇帝。大学士张居正出任辅政，推行一系列重大改革。',
        locationName: 'Beijing, China',
        locationNameZh: '北京，中国',
        importance: 1,
      },
      {
        year: 1578,
        title: 'Zhang Juzheng\'s One Whip Reform',
        titleZh: '张居正推行一条鞭法',
        description: 'Grand Secretary Zhang Juzheng implemented the Single Whip tax reform, unifying hundreds of taxes into a single silver payment. It revitalised Ming finances and filled the treasury.',
        descriptionZh: '大学士张居正推行"一条鞭法"，将繁杂的税收并为统一征收白银，极大充实了国库，明朝财政为之一振。',
        locationName: 'Beijing, China',
        locationNameZh: '北京，中国',
        importance: 1,
      },
      {
        year: 1582,
        title: 'Death of Zhang Juzheng — Emperor takes personal control',
        titleZh: '张居正去世，皇帝亲政',
        description: 'Zhang Juzheng died after ten years as regent. The Wanli Emperor, now 19, took personal control and soon reversed many of Zhang\'s reforms, confiscating his family\'s property.',
        descriptionZh: '张居正摄政十年后去世，万历帝时年十九岁，开始亲政，随后推翻张居正多项改革举措，并抄没其家产。',
        locationName: 'Beijing, China',
        locationNameZh: '北京，中国',
        importance: 1,
      },
      {
        year: 1582,
        title: 'Matteo Ricci enters China',
        titleZh: '利玛窦进入中国',
        description: 'Italian Jesuit Matteo Ricci arrived in Macau, beginning his mission to bring Western science and Christianity to China. He would later reach Beijing in 1601.',
        descriptionZh: '意大利耶稣会士利玛窦抵达澳门，开始在中国传播西方科学与基督教。他于1601年抵达北京。',
        locationName: 'Macau, China',
        locationNameZh: '澳门，中国',
        importance: 2,
      },
      {
        year: 1592,
        title: 'Imjin War — Japan invades Korea',
        titleZh: '万历朝鲜之役——日本入侵朝鲜',
        description: 'Toyotomi Hideyoshi launched a massive invasion of Korea. The Wanli Emperor sent 200,000 Ming troops to defend China\'s Korean vassal. The war lasted seven years and drained the Ming treasury.',
        descriptionZh: '丰臣秀吉大举入侵朝鲜，万历皇帝派遣约二十万明军援朝御倭。这场战争持续七年，极大消耗了明朝国力。',
        locationName: 'Korea',
        locationNameZh: '朝鲜',
        importance: 1,
      },
      {
        year: 1596,
        title: 'The Great Withdrawal — Emperor retreats from court',
        titleZh: '万历帝深居后宫，不理朝政',
        description: 'Embroiled in the succession dispute over his heir (the Guoben Controversy), the Wanli Emperor began a 30-year seclusion. He refused to attend court, issue edicts, or fill government vacancies.',
        descriptionZh: '因"国本之争"（继承人问题）与朝臣决裂，万历帝从此深居宫中，长达三十年不临朝、不批奏，朝政陷入瘫痪。',
        locationName: 'Forbidden City, Beijing',
        locationNameZh: '北京紫禁城',
        importance: 1,
      },
      {
        year: 1601,
        title: 'Matteo Ricci reaches Beijing',
        titleZh: '利玛窦抵达北京',
        description: 'Matteo Ricci became the first Westerner allowed to enter the Forbidden City. He presented clocks, maps, and books to the Emperor, sparking interest in Western knowledge.',
        descriptionZh: '利玛窦成为第一位获准进入紫禁城的西方人，向皇帝献上自鸣钟、地图和书籍，引发宫廷对西学的兴趣。',
        locationName: 'Beijing, China',
        locationNameZh: '北京，中国',
        importance: 2,
      },
      {
        year: 1615,
        title: 'Guoben Controversy resolved',
        titleZh: '国本之争终结',
        description: 'After 15 years of dispute, the Emperor\'s third son Zhu Changluo was finally confirmed as Crown Prince. The prolonged conflict had paralysed the Ming bureaucracy.',
        descriptionZh: '历时十五年的国本之争终告结束，皇三子朱常洛被正式立为太子，但朝廷内耗已使明朝元气大伤。',
        locationName: 'Beijing, China',
        locationNameZh: '北京，中国',
        importance: 2,
      },
      {
        year: 1618,
        title: 'Nurhaci raises the banner against Ming',
        titleZh: '努尔哈赤起兵反明',
        description: 'Nurhaci of the Jurchen proclaimed his Seven Grievances against the Ming Dynasty and launched open war. This marked the beginning of the end for the Ming Empire.',
        descriptionZh: '女真首领努尔哈赤以"七大恨"告天，正式起兵反明，明朝在辽东的统治岌岌可危，盛衰之势由此逆转。',
        locationName: 'Manchuria',
        locationNameZh: '满洲',
        importance: 1,
      },
      {
        year: 1619,
        title: 'Battle of Sarhu — Ming defeated by Nurhaci',
        titleZh: '萨尔浒之战——明军大败',
        description: 'The Ming Dynasty\'s massive four-pronged offensive against Nurhaci\'s Later Jin was crushed at the Battle of Sarhu. Over 45,000 Ming soldiers were killed. The balance of power in the northeast shifted irreversibly.',
        descriptionZh: '明军四路出击讨伐后金，在萨尔浒遭到努尔哈赤的致命打击，伤亡逾四万五千人，辽东局势从此急转直下。',
        locationName: 'Liaoning, China',
        locationNameZh: '辽宁，中国',
        importance: 1,
      },
    ],
  },

  Q7918: {
    nameEn: 'Qianlong Emperor',
    events: [
      {
        year: 1735,
        title: 'Ascended to the throne aged 24',
        titleZh: '登基，年仅24岁',
        description: 'Became the fourth Qing emperor to rule over China at age 24 following his father Yongzheng\'s death. He would go on to reign for 60 years — the longest de facto reign in Chinese history.',
        descriptionZh: '雍正帝驾崩后，乾隆继位，时年二十四岁，成为清朝第四位入主中原的皇帝，在位六十年，是中国历史上实际执政时间最长的皇帝。',
        locationName: 'Beijing, China',
        locationNameZh: '北京，中国',
        importance: 1,
      },
      {
        year: 1747,
        title: 'First Jinchuan Campaign',
        titleZh: '大小金川之役（第一次）',
        description: 'Launched a military campaign against the chieftains of Jinchuan in Sichuan. Though eventually successful, the campaign exposed weaknesses in the Qing military.',
        descriptionZh: '对四川金川土司用兵，历经数年方才平定，此役暴露出清军战力不足的问题。',
        locationName: 'Sichuan, China',
        locationNameZh: '四川，中国',
        importance: 2,
      },
      {
        year: 1755,
        title: 'Conquered Dzungaria',
        titleZh: '平定准噶尔',
        description: 'Destroyed the Dzungar Khanate in a decisive campaign, ending a century of Mongol rivalry. This doubled the size of the Qing Empire and secured control over Central Asia.',
        descriptionZh: '彻底消灭准噶尔汗国，终结了百年蒙古之患，清朝版图由此翻倍，对中亚的控制得以巩固。',
        locationName: 'Xinjiang, China',
        locationNameZh: '新疆，中国',
        importance: 1,
      },
      {
        year: 1762,
        title: 'Annexed Xinjiang',
        titleZh: '新疆并入版图',
        description: 'Following the conquest of Dzungaria and the Muslim rebellion of Altishahr, the Qing Empire formally incorporated Xinjiang ("New Frontier") into its territory.',
        descriptionZh: '平定准噶尔及回部叛乱后，清朝正式将新疆（意为"新领土"）纳入版图，奠定了中国现代西部边界的基础。',
        locationName: 'Xinjiang, China',
        locationNameZh: '新疆，中国',
        importance: 1,
      },
      {
        year: 1793,
        title: 'Rejected the Macartney Mission',
        titleZh: '拒绝马戛尔尼使团',
        description: 'Received British Ambassador Lord Macartney but refused all his requests for trade access, writing to King George III: "We possess all things. I set no value on objects strange or ingenious."',
        descriptionZh: '英国使臣马戛尔尼觐见，乾隆拒绝一切通商要求，致函英王乔治三世称："天朝物产丰盛，无所不有，原不藉外夷货物以通有无。"',
        locationName: 'Chengde, China',
        locationNameZh: '承德，中国',
        importance: 1,
      },
      {
        year: 1796,
        title: 'Abdicated after 60 years',
        titleZh: '禅位，在位整整六十年',
        description: 'Abdicated in favour of his son the Jiaqing Emperor, having vowed not to surpass his grandfather Kangxi\'s 61-year reign. He retained real power as Retired Emperor until his death in 1799.',
        descriptionZh: '为不超越祖父康熙皇帝六十一年的在位纪录，乾隆禅位于嘉庆帝，但仍以太上皇身份掌握实权，直至1799年去世。',
        locationName: 'Beijing, China',
        locationNameZh: '北京，中国',
        importance: 1,
      },
    ],
  },
}

async function main() {
  for (const [wikidataId, data] of Object.entries(CURATED)) {
    const person = await prisma.person.findUnique({ where: { wikidataId } })
    if (!person) {
      console.log(`  ? ${data.nameEn} (${wikidataId}) not in DB, skipping`)
      continue
    }

    // Remove existing wikidata events (keep Born/Died and user events)
    await prisma.lifeEvent.deleteMany({
      where: {
        personId: person.id,
        source: 'wikidata',
        title: { notIn: ['Born', 'Died'] },
      },
    })

    await prisma.lifeEvent.createMany({
      data: data.events.map((e) => ({
        personId: person.id,
        year: e.year,
        title: e.title,
        titleZh: e.titleZh,
        description: e.description ?? null,
        descriptionZh: e.descriptionZh ?? null,
        locationName: e.locationName ?? null,
        locationNameZh: e.locationNameZh ?? null,
        importance: e.importance ?? 1,
        source: 'wikidata',
      })),
      skipDuplicates: true,
    })

    console.log(`  ✓ ${data.nameEn}: ${data.events.length} events added`)
  }

  console.log('\nDone.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
