import { users, type User, type InsertUser, InsightData, CategoryInsights, TopInsightData, AnalyticsFullData, UrlsResponse } from "@shared/schema";

// Modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Insight operations
  getInsights(): Promise<CategoryInsights>;
  getMyInsights(): Promise<CategoryInsights>;
  getTopInsights(page: number, limit: number): Promise<TopInsightData>;
  getAnalytics(): Promise<AnalyticsFullData>;
  
  // URL operations
  getUrls(page: number, limit: number): Promise<UrlsResponse>;
  addUrl(url: string): Promise<any>;
  deleteUrl(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private wordCloudSvg: string;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
    
    // Initialize with a demo user
    this.createUser({
      username: "demo",
      password: "$2a$10$zHw3Nq3WubIX.H9YD7HBJ.aJ8yqXZy7s3s9QRKPRk3n9ZPtX5fhQ6", // "password"
    });
    
    // Define a word cloud SVG for visualization
    this.wordCloudSvg = `<svg width="500" height="300" xmlns="http://www.w3.org/2000/svg">
      <text x="250" y="150" font-size="50" text-anchor="middle" fill="#333">program</text>
      <text x="160" y="100" font-size="35" text-anchor="middle" fill="#444">karyawan</text>
      <text x="360" y="180" font-size="25" text-anchor="middle" fill="#555">peserta</text>
      <text x="150" y="200" font-size="28" text-anchor="middle" fill="#666">materi</text>
      <text x="320" y="80" font-size="22" text-anchor="middle" fill="#777">proses</text>
      <text x="100" y="160" font-size="20" text-anchor="middle" fill="#888">evaluasi</text>
      <text x="400" y="130" font-size="18" text-anchor="middle" fill="#999">manajemen</text>
      <text x="200" y="250" font-size="16" text-anchor="middle" fill="#aaa">perusahaan</text>
    </svg>`;
  }

  // User CRUD operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id, 
      role: "user", 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  // Insights operations
  async getInsights(): Promise<CategoryInsights> {
    // In a real application, this would fetch from a database
    return {
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
        {
          id: 3,
          title: "bonus tahunan hc",
          neutralPercentage: 35,
          negativePercentage: 0,
          positivePercentage: 65,
          views: 156,
          comments: 2,
        },
      ],
      negative: [
        {
          id: 4,
          title: "kritik konstruktif",
          neutralPercentage: 8,
          negativePercentage: 89,
          positivePercentage: 3,
          views: 189,
          comments: 16,
        },
        {
          id: 5,
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
          id: 6,
          title: "bonus tahunan hc",
          neutralPercentage: 33,
          negativePercentage: 0,
          positivePercentage: 67,
          views: 75,
          comments: 3,
        },
        {
          id: 7,
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
          id: 8,
          title: "kebijakan kenaikan gaji",
          neutralPercentage: 30,
          negativePercentage: 0,
          positivePercentage: 70,
          views: 67,
          comments: 1,
        },
        {
          id: 9,
          title: "evaluasi kebijakan bimbingan",
          neutralPercentage: 41,
          negativePercentage: 56,
          positivePercentage: 3,
          views: 86,
          comments: 5,
        },
        {
          id: 10,
          title: "kepegawaian hc",
          neutralPercentage: 4,
          negativePercentage: 0,
          positivePercentage: 96,
          views: 178,
          comments: 13,
        },
      ],
    };
  }

  async getMyInsights(): Promise<CategoryInsights> {
    // In a real application, this would filter insights based on the user
    return {
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
          id: 4,
          title: "kritik konstruktif",
          neutralPercentage: 8,
          negativePercentage: 89,
          positivePercentage: 3,
          views: 189,
          comments: 16,
        },
      ],
      positive: [
        {
          id: 6,
          title: "bonus tahunan hc",
          neutralPercentage: 33,
          negativePercentage: 0,
          positivePercentage: 67,
          views: 75,
          comments: 3,
        },
      ],
    };
  }

  async getTopInsights(page: number, limit: number): Promise<TopInsightData> {
    // In a real application, this would fetch from a database with pagination
    const insights = [
      {
        id: 1,
        location: "Ketapang",
        source: "Bud HC",
        employee: "M*** K***",
        sentiment: "Saya ingin memberika...",
        date: new Date("2024-08-18T22:44:53"),
      },
      {
        id: 2,
        location: "Marus",
        source: "Bud HC",
        employee: "S*** P***",
        sentiment: "Berikut adalah tangg...",
        date: new Date("2024-12-01T16:42:00"),
      },
      {
        id: 3,
        location: "Tambun",
        source: "HR",
        employee: "V*** S***",
        sentiment: "Dengan berat hati sa...",
        date: new Date("2025-03-28T07:45:56"),
      },
      {
        id: 4,
        location: "Bekasi",
        source: "Bud HC",
        employee: "R*** D***",
        sentiment: "Berikut adalah tangg...",
        date: new Date("2025-01-10T23:15:22"),
      },
      {
        id: 5,
        location: "Sorong",
        source: "IT",
        employee: "L*** S***",
        sentiment: "Saya ingin menyampai...",
        date: new Date("2025-03-19T22:41:47"),
      },
      {
        id: 6,
        location: "Tebing Tinggi",
        source: "Bud HC",
        employee: "J*** A***",
        sentiment: "Saya ingin memberika...",
        date: new Date("2025-02-02T04:12:35"),
      },
    ];

    // Simple pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedInsights = insights.slice(startIndex, endIndex);

    return {
      insights: paginatedInsights,
      totalCount: 500, // Total count for pagination
      wordCloudSvg: this.wordCloudSvg,
    };
  }

  async getAnalytics(): Promise<AnalyticsFullData> {
    // In a real application, this would fetch analytics data from a database
    return {
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
  }

  // URL operations
  async getUrls(page: number, limit: number): Promise<UrlsResponse> {
    // In a real application, this would fetch URLs from a database
    const urls = [
      {
        id: 1,
        url: "http://15.235.147.1:4000/api/companies",
        totalNumbers: 5,
        totalInsights: 500,
        totalSentiment: "500/500",
        totalClassified: "500/500",
        date: new Date("2025-04-10T08:41:52"),
        status: "SUCCESS" as const,
      },
      {
        id: 2,
        url: "http://15.235.147.1:4000/api/feedback",
        totalNumbers: 8,
        totalInsights: 750,
        totalSentiment: "750/750",
        totalClassified: "750/750",
        date: new Date("2025-05-12T10:23:45"),
        status: "SUCCESS" as const,
      },
      {
        id: 3,
        url: "http://15.235.147.1:4000/api/survey",
        totalNumbers: 12,
        totalInsights: 320,
        totalSentiment: "320/320",
        totalClassified: "320/320",
        date: new Date("2025-05-14T09:15:30"),
        status: "SUCCESS" as const,
      },
    ];

    // Simple pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUrls = urls.slice(startIndex, endIndex);

    return {
      urls: paginatedUrls,
      total: 10, // Total count for pagination
    };
  }

  async addUrl(url: string): Promise<any> {
    // In a real application, this would add a URL to the database
    return {
      id: this.currentId++,
      url,
      totalNumbers: 0,
      totalInsights: 0,
      totalSentiment: "0/0",
      totalClassified: "0/0",
      date: new Date(),
      status: "PENDING" as const,
    };
  }

  async deleteUrl(id: number): Promise<void> {
    // In a real application, this would delete a URL from the database
    return;
  }
}

export const storage = new MemStorage();
