export type Confidence = 'rumored' | 'confirmed' | 'public'
export type FOStatus = 'active' | 'dormant' | 'unknown'

export interface FamilyOffice {
  id: string
  name: string
  family: string
  country: string
  city: string
  estAumUsd: number | null
  status: FOStatus
  tags: string[]
  lastContactedAt: string | null
  summary: string
  sourceUrl: string | null
  confidence: Confidence
}

export const familyOffices: FamilyOffice[] = [
  {
    id: 'olayan-group',
    name: 'Olayan Group',
    family: 'Olayan',
    country: 'Saudi Arabia',
    city: 'Riyadh',
    estAumUsd: 15_000_000_000,
    status: 'active',
    tags: ['LP', 'Direct', 'Consumer', 'Real Estate'],
    lastContactedAt: null,
    summary:
      'One of the largest private conglomerates in the Middle East, with interests spanning consumer goods, real estate, and financial services. Known for long-term LP positions in global private equity and VC funds.',
    sourceUrl: 'https://www.olayangroup.com',
    confidence: 'rumored',
  },
  {
    id: 'mansour-group',
    name: 'Mansour Group',
    family: 'Mansour',
    country: 'Egypt',
    city: 'Cairo',
    estAumUsd: 10_000_000_000,
    status: 'active',
    tags: ['LP', 'Direct', 'Consumer', 'Tech'],
    lastContactedAt: null,
    summary:
      'Egyptian multinational conglomerate controlling General Motors distribution in Africa and key retail brands. Has made direct technology investments and participates as an LP in growth-stage funds.',
    sourceUrl: 'https://www.mansourgroup.com',
    confidence: 'rumored',
  },
  {
    id: 'al-futtaim-group',
    name: 'Al-Futtaim Group',
    family: 'Al-Futtaim',
    country: 'UAE',
    city: 'Dubai',
    estAumUsd: 6_000_000_000,
    status: 'active',
    tags: ['LP', 'Real Estate', 'Consumer', 'Fintech'],
    lastContactedAt: null,
    summary:
      'UAE-based conglomerate with retail, automotive, real estate, and financial services divisions. Actively deploys into regional VC funds focused on fintech and consumer technology.',
    sourceUrl: 'https://www.alfuttaim.com',
    confidence: 'rumored',
  },
  {
    id: 'easa-saleh-al-gurg-group',
    name: 'Easa Saleh Al Gurg Group',
    family: 'Al Gurg',
    country: 'UAE',
    city: 'Dubai',
    estAumUsd: 2_000_000_000,
    status: 'active',
    tags: ['LP', 'Real Estate', 'Consumer'],
    lastContactedAt: null,
    summary:
      'Dubai-based family business group with more than 30 companies spanning construction, consumer goods, and real estate. Selectively participates as an LP in regional private equity vehicles.',
    sourceUrl: 'https://www.algurg.com',
    confidence: 'rumored',
  },
  {
    id: 'al-habtoor-group',
    name: 'Al Habtoor Group',
    family: 'Al Habtoor',
    country: 'UAE',
    city: 'Dubai',
    estAumUsd: 3_500_000_000,
    status: 'active',
    tags: ['Real Estate', 'Direct', 'Consumer'],
    lastContactedAt: null,
    summary:
      'Major UAE conglomerate with flagship hotels, real estate developments, and automotive interests. Has explored direct co-investments alongside established fund managers.',
    sourceUrl: 'https://www.alhabtoor.com',
    confidence: 'rumored',
  },
  {
    id: 'kanoo-group',
    name: 'Kanoo Group',
    family: 'Kanoo',
    country: 'Bahrain',
    city: 'Manama',
    estAumUsd: 2_500_000_000,
    status: 'active',
    tags: ['LP', 'Direct', 'Tech', 'Real Estate'],
    lastContactedAt: null,
    summary:
      'One of the Gulf region\'s oldest and largest family-owned businesses, founded in 1890. Operates across shipping, travel, machinery, and real estate with growing interest in technology-focused LP positions.',
    sourceUrl: 'https://www.kanoo.com',
    confidence: 'rumored',
  },
  {
    id: 'suhail-bahwan-group',
    name: 'Suhail Bahwan Group',
    family: 'Bahwan',
    country: 'Oman',
    city: 'Muscat',
    estAumUsd: 4_000_000_000,
    status: 'active',
    tags: ['LP', 'Consumer', 'Real Estate'],
    lastContactedAt: null,
    summary:
      'One of Oman\'s largest private sector conglomerates, with operations in automotive, oil and gas services, information technology, and consumer products. Maintains LP interests in regional private equity.',
    sourceUrl: null,
    confidence: 'rumored',
  },
  {
    id: 'abdul-latif-jameel',
    name: 'Abdul Latif Jameel',
    family: 'Jameel',
    country: 'Saudi Arabia',
    city: 'Jeddah',
    estAumUsd: 5_000_000_000,
    status: 'active',
    tags: ['LP', 'Direct', 'Tech', 'Climate', 'Healthcare'],
    lastContactedAt: null,
    summary:
      'Saudi diversified conglomerate best known as the Toyota distributor in Saudi Arabia and parts of MENA. ALJ Community, the family\'s philanthropic and investment arm, actively invests in climate tech and AI.',
    sourceUrl: 'https://www.alj.com',
    confidence: 'rumored',
  },
  {
    id: 'saraya-holdings',
    name: 'Saraya Holdings',
    family: 'Abu-Ghazaleh',
    country: 'Jordan',
    city: 'Amman',
    estAumUsd: null,
    status: 'active',
    tags: ['Real Estate', 'Direct', 'Healthcare'],
    lastContactedAt: null,
    summary:
      'Jordan-based hospitality and real estate developer behind the Saraya Aqaba resort project. Exploring diversification into healthcare and direct technology investments in the Levant.',
    sourceUrl: null,
    confidence: 'rumored',
  },
  {
    id: 'alghanim-industries',
    name: 'Alghanim Industries',
    family: 'Alghanim',
    country: 'Kuwait',
    city: 'Kuwait City',
    estAumUsd: 3_000_000_000,
    status: 'active',
    tags: ['LP', 'Direct', 'Consumer', 'Fintech', 'Tech'],
    lastContactedAt: null,
    summary:
      'One of the largest privately-owned businesses in the Gulf, with interests in consumer electronics, food and beverage, engineering, and financial services. A known LP in regional and global VC funds.',
    sourceUrl: 'https://www.alghanim.com',
    confidence: 'rumored',
  },
  {
    id: 'crescent-enterprises',
    name: 'Crescent Enterprises',
    family: 'Al Qasimi',
    country: 'UAE',
    city: 'Sharjah',
    estAumUsd: 1_500_000_000,
    status: 'active',
    tags: ['LP', 'Direct', 'Tech', 'Climate', 'Fintech'],
    lastContactedAt: null,
    summary:
      'Sharjah-based investment and enterprise development company with a strong track record in venture capital. CE-Ventures, its dedicated VC arm, invests in emerging tech companies and acts as an LP in sub-$100M funds.',
    sourceUrl: 'https://www.crescententerprises.com',
    confidence: 'rumored',
  },
  {
    id: 'lulu-group',
    name: 'Lulu Group International',
    family: 'Yusuff Ali',
    country: 'UAE',
    city: 'Abu Dhabi',
    estAumUsd: 5_500_000_000,
    status: 'active',
    tags: ['Consumer', 'Real Estate', 'Direct'],
    lastContactedAt: null,
    summary:
      'Abu Dhabi-headquartered hypermarket and retail chain operating across the Middle East, Asia, and beyond. Selectively pursues direct investments in consumer and retail technology companies.',
    sourceUrl: 'https://www.lulugroupinternational.com',
    confidence: 'rumored',
  },
  {
    id: 'al-babtain-group',
    name: 'Al-Babtain Group',
    family: 'Al-Babtain',
    country: 'Kuwait',
    city: 'Kuwait City',
    estAumUsd: 1_200_000_000,
    status: 'active',
    tags: ['LP', 'Consumer', 'Real Estate'],
    lastContactedAt: null,
    summary:
      'Kuwaiti family conglomerate active in automotive distribution, power and telecommunications, and real estate. Has taken LP positions in select regional private equity and infrastructure funds.',
    sourceUrl: null,
    confidence: 'rumored',
  },
  {
    id: 'al-mazrui-group',
    name: 'Al-Mazrui Group',
    family: 'Al-Mazrui',
    country: 'UAE',
    city: 'Abu Dhabi',
    estAumUsd: null,
    status: 'unknown',
    tags: ['Direct', 'Real Estate', 'Healthcare'],
    lastContactedAt: null,
    summary:
      'Abu Dhabi family group with interests in healthcare, real estate, and industrial services. Relatively lower public profile with selective direct co-investments in healthcare technology.',
    sourceUrl: null,
    confidence: 'rumored',
  },
  {
    id: 'al-naboodah-group',
    name: 'Saeed & Mohammed Al Naboodah Group',
    family: 'Al Naboodah',
    country: 'UAE',
    city: 'Dubai',
    estAumUsd: 2_000_000_000,
    status: 'active',
    tags: ['LP', 'Real Estate', 'Consumer', 'Tech'],
    lastContactedAt: null,
    summary:
      'One of Dubai\'s oldest and most diversified family conglomerates, with operations across construction, travel, and consumer trading. Participates as an LP in established regional PE and emerging VC funds.',
    sourceUrl: null,
    confidence: 'rumored',
  },
]
