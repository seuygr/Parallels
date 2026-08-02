const translations = {
  en: {
    // Canvas topbar
    back: '← Back',
    addPerson: '+ Add person',
    timeline: 'Timeline',
    map: 'Map',
    signIn: 'Sign in',
    signOut: 'Sign out',
    scrollHint: 'Scroll or pinch to zoom · Drag to pan',
    zoom: 'zoom',

    // Empty state
    emptyCanvas: 'Your canvas is empty. Search for someone to get started.',

    // Add person modal
    searchTab: '🔍 Search',
    createTab: '+ Create profile',
    searchPlaceholder: 'Search for a person…',
    searching: 'Searching…',
    noResults: 'No results found.',
    typeToSearch: 'Type at least 2 characters to search.',
    adding: 'Adding…',
    added: 'Added',
    add: '+ Add',
    nameLabel: 'Name *',
    namePlaceholder: 'e.g. Grandmother Wei',
    bornLabel: 'Born *',
    bornPlaceholder: 'e.g. 1928',
    birthplaceLabel: 'Birthplace',
    birthplacePlaceholder: 'e.g. Shanghai',
    stillAlive: 'Still alive?',
    yes: 'Yes',
    no: 'No',
    passedAway: 'Passed away',
    diedPlaceholder: 'e.g. 2005',
    creating: 'Creating…',
    addToCanvas: 'Add to canvas →',

    // Add event modal
    addEventTitle: (name: string) => `Add event — ${name}`,
    yearLabel: 'Year *',
    yearPlaceholder: 'e.g. 1949',
    monthLabel: 'Month',
    whatHappenedLabel: 'What happened? *',
    whatHappenedPlaceholder: 'e.g. Moved to Hong Kong',
    locationLabel: 'Location',
    locationPlaceholder: 'e.g. Hong Kong',
    storyLabel: 'Story',
    storyPlaceholder: 'Tell the story behind this moment…',
    saving: 'Saving…',
    saveEvent: 'Save event',

    // Intersection panel
    yearsOld: (name: string, start: number, end: number) =>
      `${name} was ${start}–${end} years old.`,
    geographicOverlap: 'GEOGRAPHIC OVERLAP',
    noSharedCity: 'No shared city found in this period.',
    duringThisTime: 'DURING THIS TIME',
    loadingEvents: 'Loading events…',
    noNotableEvents: 'No notable events found.',
    shareThisMoment: 'Share this moment',
    linkCopied: '✓ Link copied!',

    // Story card
    noPhoto: 'No photo',
    alsoIn: (city: string, year: number) => `ALSO IN ${city} · ${year}`,
    geoV2: 'Geographic intersections available in v2',
    meanwhile: 'MEANWHILE',
    notYetBorn: (name: string) => `${name} hadn't been born yet.`,
    alreadyPassed: (name: string) => `${name} had already passed away.`,
    noNearbyRecord: (name: string) => `No recorded events near this time for ${name}.`,
    approxNote: (n: number, direction: 'earlier' | 'later') =>
      n === 0 ? '(this same year)' : `(closest record: ${n} yr${n === 1 ? '' : 's'} ${direction})`,
  },

  zh: {
    // Canvas topbar
    back: '← 返回',
    addPerson: '+ 添加人物',
    timeline: '时间轴',
    map: '地图',
    signIn: '登录',
    signOut: '退出登录',
    scrollHint: '滚动或捏合缩放 · 拖动平移',
    zoom: '缩放',

    // Empty state
    emptyCanvas: '画布为空，搜索一个人物开始探索。',

    // Add person modal
    searchTab: '🔍 搜索',
    createTab: '+ 创建档案',
    searchPlaceholder: '搜索人物…',
    searching: '搜索中…',
    noResults: '未找到结果。',
    typeToSearch: '请输入至少2个字符进行搜索。',
    adding: '添加中…',
    added: '已添加',
    add: '+ 添加',
    nameLabel: '姓名 *',
    namePlaceholder: '例：外祖母',
    bornLabel: '出生年份 *',
    bornPlaceholder: '例：1928',
    birthplaceLabel: '出生地',
    birthplacePlaceholder: '例：上海',
    stillAlive: '仍然在世？',
    yes: '是',
    no: '否',
    passedAway: '逝世年份',
    diedPlaceholder: '例：2005',
    creating: '创建中…',
    addToCanvas: '添加到画布 →',

    // Add event modal
    addEventTitle: (name: string) => `添加事件 — ${name}`,
    yearLabel: '年份 *',
    yearPlaceholder: '例：1949',
    monthLabel: '月份',
    whatHappenedLabel: '发生了什么？*',
    whatHappenedPlaceholder: '例：移居香港',
    locationLabel: '地点',
    locationPlaceholder: '例：香港',
    storyLabel: '故事',
    storyPlaceholder: '讲述这一时刻背后的故事…',
    saving: '保存中…',
    saveEvent: '保存事件',

    // Intersection panel
    yearsOld: (name: string, start: number, end: number) =>
      `${name}当时${start}至${end}岁。`,
    geographicOverlap: '地理交叉',
    noSharedCity: '在此期间未发现共同城市。',
    duringThisTime: '同一时期大事',
    loadingEvents: '加载中…',
    noNotableEvents: '未找到重大历史事件。',
    shareThisMoment: '分享这一时刻',
    linkCopied: '✓ 链接已复制！',

    // Story card
    noPhoto: '暂无照片',
    alsoIn: (city: string, year: number) => `同在 ${city} · ${year}`,
    geoV2: '地理交叉功能即将推出',
    meanwhile: '与此同时',
    notYetBorn: (name: string) => `${name}尚未出生。`,
    alreadyPassed: (name: string) => `${name}此时已经去世。`,
    noNearbyRecord: (name: string) => `未找到${name}在此时期附近的记录。`,
    approxNote: (n: number, direction: 'earlier' | 'later') =>
      n === 0 ? '（同一年）' : `（最接近的记录：${n}年${direction === 'earlier' ? '前' : '后'}）`,
  },
} as const

export type Lang = keyof typeof translations
export function tr(lang: Lang) { return translations[lang] }
