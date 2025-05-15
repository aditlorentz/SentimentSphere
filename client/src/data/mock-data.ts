// Insight types
export interface Insight {
  id: number;
  title: string;
  neutralPercentage: number;
  negativePercentage: number;
  positivePercentage: number;
  views: number;
  comments: number;
}

export interface CategoryInsights {
  neutral: Insight[];
  negative: Insight[];
  positive: Insight[];
  additional?: Insight[];
}

// Insights data for Survey Dashboard and other pages
export const insightsData: CategoryInsights = {
  neutral: [
    {
      id: 1,
      title: "masukan remote working",
      neutralPercentage: 55,
      negativePercentage: 5,
      positivePercentage: 40,
      views: 125,
      comments: 5,
    },
    {
      id: 2,
      title: "kritik konstruktif",
      neutralPercentage: 45,
      negativePercentage: 10,
      positivePercentage: 45,
      views: 88,
      comments: 7,
    },
  ],
  negative: [
    {
      id: 3,
      title: "kritik konstruktif",
      neutralPercentage: 8,
      negativePercentage: 89,
      positivePercentage: 3,
      views: 189,
      comments: 16,
    },
    {
      id: 4,
      title: "kritik konstruktif",
      neutralPercentage: 11,
      negativePercentage: 79,
      positivePercentage: 10,
      views: 134,
      comments: 9,
    },
  ],
  positive: [
    {
      id: 5,
      title: "bonus tahunan hc",
      neutralPercentage: 33,
      negativePercentage: 0,
      positivePercentage: 67,
      views: 75,
      comments: 3,
    },
    {
      id: 6,
      title: "kepegawaian hc",
      neutralPercentage: 4,
      negativePercentage: 0,
      positivePercentage: 96,
      views: 178,
      comments: 13,
    },
  ],
  additional: [
    {
      id: 7,
      title: "kebijakan kenaikan gaji",
      neutralPercentage: 30,
      negativePercentage: 0,
      positivePercentage: 70,
      views: 67,
      comments: 1,
    },
    {
      id: 8,
      title: "evaluasi kebijakan bimbingan",
      neutralPercentage: 41,
      negativePercentage: 56,
      positivePercentage: 3,
      views: 86,
      comments: 5,
    },
    {
      id: 9,
      title: "kepegawaian hc",
      neutralPercentage: 4,
      negativePercentage: 0,
      positivePercentage: 96,
      views: 178,
      comments: 13,
    },
  ],
};

// Top insights for Top Insights page
export interface TopInsight {
  id: number;
  location: string;
  source: string;
  employee: string;
  sentiment: string;
  date: string;
}

export const topInsightsList: TopInsight[] = [
  {
    id: 1,
    location: "Ketapang",
    source: "Bud HC",
    employee: "M*** K***",
    sentiment: "Saya ingin memberika...",
    date: "2024-08-18 22:44:53"
  },
  {
    id: 2,
    location: "Marus",
    source: "Bud HC",
    employee: "S*** P***",
    sentiment: "Berikut adalah tangg...",
    date: "2024-12-01 16:42:00"
  },
  {
    id: 3,
    location: "Tambun",
    source: "HR",
    employee: "V*** S***",
    sentiment: "Dengan berat hati sa...",
    date: "2025-03-28 07:45:56"
  },
  {
    id: 4,
    location: "Bekasi",
    source: "Bud HC",
    employee: "R*** D***",
    sentiment: "Berikut adalah tangg...",
    date: "2025-01-10 23:15:22"
  },
  {
    id: 5,
    location: "Sorong",
    source: "IT",
    employee: "L*** S***",
    sentiment: "Saya ingin menyampai...",
    date: "2025-03-19 22:41:47"
  },
  {
    id: 6,
    location: "Tebing Tinggi",
    source: "Bud HC",
    employee: "J*** A***",
    sentiment: "Saya ingin memberika...",
    date: "2025-02-02 04:12:35"
  }
];

// Analytics data for Smart Analytics page
export interface AnalyticsData {
  totalEmployees: number;
  totalInsights: number;
  totalNegative: number;
  totalPositive: number;
  monthlyData: Array<{
    name: string;
    positive: number;
    negative: number;
    neutral: number;
  }>;
  pieData: Array<{
    name: string;
    value: number;
  }>;
  trendInsights: Array<{
    id: number;
    city: string;
    source: string;
    employee: string;
    sentiment: string;
    date: string;
  }>;
}

export const analyticsData: AnalyticsData = {
  totalEmployees: 373,
  totalInsights: 500,
  totalNegative: 118,
  totalPositive: 194,
  monthlyData: [
    {
      name: "Jan",
      positive: 160,
      negative: 110,
      neutral: 180,
    },
    {
      name: "Feb",
      positive: 165,
      negative: 112,
      neutral: 185,
    },
    {
      name: "Mar",
      positive: 170,
      negative: 115,
      neutral: 190,
    },
    {
      name: "Apr",
      positive: 180,
      negative: 116,
      neutral: 192,
    },
    {
      name: "May",
      positive: 194,
      negative: 118,
      neutral: 188,
    },
  ],
  pieData: [
    { name: "Positive", value: 194 },
    { name: "Negative", value: 118 },
    { name: "Neutral", value: 188 },
  ],
  trendInsights: [
    {
      id: 1,
      city: "Surabaya",
      source: "Dikleum",
      employee: "G*** I***",
      sentiment: "Dengan ini saya ingin mengemukakan kepada manajemen tentang kebijakan baru...",
      date: "2025-05-14 13:56:02",
    },
    {
      id: 2,
      city: "Bandung",
      source: "Dikleum",
      employee: "S*** Y***",
      sentiment: "Program pengembangan karir yang ditawarkan sangat membantu saya...",
      date: "2025-05-14 12:45:19",
    },
    {
      id: 3,
      city: "Jakarta",
      source: "Feedback",
      employee: "A*** B***",
      sentiment: "Sistem kerja hybrid memberikan fleksibilitas yang baik...",
      date: "2025-05-14 11:30:45",
    },
    {
      id: 4,
      city: "Surabaya",
      source: "Dikleum",
      employee: "M*** N***",
      sentiment: "Perlu adanya peningkatan fasilitas kerja di kantor cabang...",
      date: "2025-05-14 10:15:33",
    },
  ],
};

// Settings data for Settings page
export interface URLData {
  id: number;
  url: string;
  totalNumbers: number;
  totalInsights: number;
  totalSentiment: string;
  totalClassified: string;
  date: string;
  status: "SUCCESS" | "FAILED" | "PENDING";
}

export const urlList: URLData[] = [
  {
    id: 1,
    url: "http://15.235.147.1:4000/api/companies",
    totalNumbers: 5,
    totalInsights: 500,
    totalSentiment: "500/500",
    totalClassified: "500/500",
    date: "2025-04-10 08:41:52",
    status: "SUCCESS",
  },
  {
    id: 2,
    url: "http://15.235.147.1:4000/api/feedback",
    totalNumbers: 8,
    totalInsights: 750,
    totalSentiment: "750/750",
    totalClassified: "750/750",
    date: "2025-05-12 10:23:45",
    status: "SUCCESS",
  },
  {
    id: 3,
    url: "http://15.235.147.1:4000/api/survey",
    totalNumbers: 12,
    totalInsights: 320,
    totalSentiment: "320/320",
    totalClassified: "320/320",
    date: "2025-05-14 09:15:30",
    status: "SUCCESS",
  },
];
