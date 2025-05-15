import { users, type User, type InsertUser, InsightData, CategoryInsights, TopInsightData, AnalyticsFullData, UrlsResponse, EmployeeInsightType, InsertEmployeeInsight, employeeInsights, surveyDashboardSummary, SurveyDashboardSummary, InsertSurveyDashboardSummary } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, like, sql, or } from "drizzle-orm";

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
  
  // Insights Data operations (from database)
  getInsightsData(page: number, limit: number, filter?: object): Promise<{data: EmployeeInsightType[], total: number}>;
  addInsightData(data: InsertEmployeeInsight): Promise<EmployeeInsightType>;
  getInsightDataById(id: number): Promise<EmployeeInsightType | undefined>;
  updateInsightData(id: number, data: Partial<InsertEmployeeInsight>): Promise<EmployeeInsightType | undefined>;
  deleteInsightData(id: number): Promise<void>;
  getInsightStats(): Promise<{
    totalInsights: number,
    positiveCount: number,
    negativeCount: number,
    neutralCount: number,
    bySource: {source: string, count: number}[],
    byWitel: {witel: string, count: number}[],
    byWord: {word: string, count: number}[]
  }>;
  
  // Survey Dashboard Summary operations
  generateSurveyDashboardSummary(): Promise<void>;
  getSurveyDashboardSummary(page: number, limit: number): Promise<{
    data: SurveyDashboardSummary[],
    total: number
  }>;
}

export class DatabaseStorage implements IStorage {
  private wordCloudSvg: string;

  constructor() {
    // Initialize word cloud SVG
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

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Insights Data operations from database
  async getInsightsData(page: number, limit: number, filter?: any): Promise<{data: EmployeeInsightType[], total: number}> {
    let query = db.select().from(employeeInsights);
    
    if (filter) {
      const conditions = [];
      
      if (filter.sourceData) {
        conditions.push(eq(employeeInsights.sourceData, filter.sourceData));
      }
      
      if (filter.witel) {
        conditions.push(eq(employeeInsights.witel, filter.witel));
      }
      
      if (filter.kota) {
        conditions.push(eq(employeeInsights.kota, filter.kota));
      }
      
      if (filter.sentimen) {
        conditions.push(eq(employeeInsights.sentimen, filter.sentimen));
      }
      
      if (filter.wordInsight) {
        conditions.push(eq(employeeInsights.wordInsight, filter.wordInsight));
      }
      
      if (filter.search) {
        conditions.push(
          or(
            like(employeeInsights.originalInsight, `%${filter.search}%`),
            like(employeeInsights.sentenceInsight, `%${filter.search}%`),
            like(employeeInsights.employeeName, `%${filter.search}%`)
          )
        );
      }

      if (filter.dateFrom && filter.dateTo) {
        conditions.push(
          and(
            sql`${employeeInsights.date} >= ${filter.dateFrom}`,
            sql`${employeeInsights.date} <= ${filter.dateTo}`
          )
        );
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    // Get total count
    const totalCountResult = await db.select({ count: sql`COUNT(*)` }).from(employeeInsights);
    const total = Number(totalCountResult[0].count);
    
    // Apply pagination
    const data = await query
      .orderBy(desc(employeeInsights.date))
      .limit(limit)
      .offset((page - 1) * limit);
      
    return { data, total };
  }
  
  async addInsightData(data: InsertEmployeeInsight): Promise<EmployeeInsightType> {
    const [result] = await db
      .insert(employeeInsights)
      .values(data)
      .returning();
    return result;
  }
  
  async getInsightDataById(id: number): Promise<EmployeeInsightType | undefined> {
    const [result] = await db
      .select()
      .from(employeeInsights)
      .where(eq(employeeInsights.id, id));
    return result;
  }
  
  async updateInsightData(id: number, data: Partial<InsertEmployeeInsight>): Promise<EmployeeInsightType | undefined> {
    const [result] = await db
      .update(employeeInsights)
      .set(data)
      .where(eq(employeeInsights.id, id))
      .returning();
    return result;
  }
  
  async deleteInsightData(id: number): Promise<void> {
    await db
      .delete(employeeInsights)
      .where(eq(employeeInsights.id, id));
  }
  
  async getInsightStats(): Promise<{
    totalInsights: number,
    positiveCount: number,
    negativeCount: number,
    neutralCount: number,
    bySource: {source: string, count: number}[],
    byWitel: {witel: string, count: number}[],
    byWord: {word: string, count: number}[]
  }> {
    // Get total counts
    const totalCountResult = await db.select({ count: sql`COUNT(*)` }).from(employeeInsights);
    const totalInsights = Number(totalCountResult[0].count);
    
    // Get sentiment counts
    const posCountResult = await db
      .select({ count: sql`COUNT(*)` })
      .from(employeeInsights)
      .where(eq(employeeInsights.sentimen, 'positif'));
    const positiveCount = Number(posCountResult[0].count);
    
    const negCountResult = await db
      .select({ count: sql`COUNT(*)` })
      .from(employeeInsights)
      .where(eq(employeeInsights.sentimen, 'negatif'));
    const negativeCount = Number(negCountResult[0].count);
    
    const neutCountResult = await db
      .select({ count: sql`COUNT(*)` })
      .from(employeeInsights)
      .where(eq(employeeInsights.sentimen, 'netral'));
    const neutralCount = Number(neutCountResult[0].count);
    
    // Get counts by source
    const bySourceResult = await db
      .select({
        source: employeeInsights.sourceData,
        count: sql`COUNT(*)`
      })
      .from(employeeInsights)
      .groupBy(employeeInsights.sourceData);
    
    const bySource = bySourceResult.map(r => ({
      source: r.source,
      count: Number(r.count)
    }));
    
    // Get counts by witel
    const byWitelResult = await db
      .select({
        witel: employeeInsights.witel,
        count: sql`COUNT(*)`
      })
      .from(employeeInsights)
      .groupBy(employeeInsights.witel);
    
    const byWitel = byWitelResult.map(r => ({
      witel: r.witel,
      count: Number(r.count)
    }));
    
    // Get counts by word insight
    const byWordResult = await db
      .select({
        word: employeeInsights.wordInsight,
        count: sql`COUNT(*)`
      })
      .from(employeeInsights)
      .groupBy(employeeInsights.wordInsight);
    
    const byWord = byWordResult.map(r => ({
      word: r.word,
      count: Number(r.count)
    }));
    
    return {
      totalInsights,
      positiveCount,
      negativeCount,
      neutralCount,
      bySource,
      byWitel,
      byWord
    };
  }
  
  // Legacy methods that we need to keep for compatibility
  
  async getInsights(): Promise<CategoryInsights> {
    try {
      // Get top words by sentiment
      const positiveData = await this.getInsightsBySentiment('positif', 10);
      const negativeData = await this.getInsightsBySentiment('negatif', 10);
      const neutralData = await this.getInsightsBySentiment('netral', 10);
      
      // Get additional insights (mix of all)
      const additionalData = await this.getTopInsightsByEngagement(6);
      
      return {
        positive: positiveData,
        negative: negativeData,
        neutral: neutralData,
        additional: additionalData
      };
    } catch (error) {
      console.error("Error fetching insights from database:", error);
      // Fallback in case of error
      return {
        neutral: [],
        negative: [],
        positive: [],
        additional: []
      };
    }
  }
  
  // Helper method to get insights by sentiment
  private async getInsightsBySentiment(sentiment: string, limit: number = 10): Promise<InsightData[]> {
    // Get word counts for this sentiment
    const wordCounts = await db
      .select({
        word: employeeInsights.wordInsight,
        count: sql`COUNT(*)`
      })
      .from(employeeInsights)
      .where(eq(employeeInsights.sentimen, sentiment))
      .groupBy(employeeInsights.wordInsight)
      .orderBy(desc(sql`COUNT(*)`))
      .limit(limit);
    
    const result: InsightData[] = [];
    
    // Process each word to create insights
    for (const item of wordCounts) {
      const word = item.word;
      
      // Get all insights with this word and sentiment
      const relatedInsights = await db
        .select()
        .from(employeeInsights)
        .where(and(
          eq(employeeInsights.sentimen, sentiment),
          sql`${employeeInsights.wordInsight} LIKE ${`%${word}%`}`
        ))
        .limit(20);
      
      if (relatedInsights.length === 0) continue;
      
      // Calculate percentages based on sentiment counts in the related data
      const totalCount = relatedInsights.length;
      const posCount = relatedInsights.filter(i => i.sentimen === 'positif').length;
      const negCount = relatedInsights.filter(i => i.sentimen === 'negatif').length;
      const neutCount = relatedInsights.filter(i => i.sentimen === 'netral').length;
      
      const positivePercentage = Math.round((posCount / totalCount) * 100);
      const negativePercentage = Math.round((negCount / totalCount) * 100);
      const neutralPercentage = Math.round((neutCount / totalCount) * 100);
      
      result.push({
        id: result.length + 1,
        title: word,
        positivePercentage,
        negativePercentage,
        neutralPercentage,
        views: Math.floor(Math.random() * 100) + 50, // Random number for views
        comments: Math.floor(Math.random() * 20) + 1 // Random number for comments
      });
    }
    
    return result;
  }
  
  // Helper method to get insights sorted by "engagement" (we'll use word frequency)
  private async getTopInsightsByEngagement(limit: number = 6): Promise<InsightData[]> {
    // Get the most frequently occurring word insights across all sentiments
    const topWords = await db
      .select({
        word: employeeInsights.wordInsight,
        count: sql`COUNT(*)`
      })
      .from(employeeInsights)
      .groupBy(employeeInsights.wordInsight)
      .orderBy(desc(sql`COUNT(*)`))
      .limit(limit);
    
    const result: InsightData[] = [];
    
    for (const item of topWords) {
      const word = item.word;
      
      // Get related insights for this word
      const relatedInsights = await db
        .select()
        .from(employeeInsights)
        .where(sql`${employeeInsights.wordInsight} LIKE ${`%${word}%`}`)
        .limit(20);
      
      if (relatedInsights.length === 0) continue;
      
      // Calculate percentages
      const totalCount = relatedInsights.length;
      const posCount = relatedInsights.filter(i => i.sentimen === 'positif').length;
      const negCount = relatedInsights.filter(i => i.sentimen === 'negatif').length;
      const neutCount = relatedInsights.filter(i => i.sentimen === 'netral').length;
      
      const positivePercentage = Math.round((posCount / totalCount) * 100);
      const negativePercentage = Math.round((negCount / totalCount) * 100);
      const neutralPercentage = Math.round((neutCount / totalCount) * 100);
      
      result.push({
        id: result.length + 1,
        title: word,
        positivePercentage,
        negativePercentage,
        neutralPercentage,
        views: Math.floor(Math.random() * 200) + 50,
        comments: Math.floor(Math.random() * 15) + 1
      });
    }
    
    return result;
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

    const wordCloudData = [
      { tag: "program", weight: 80 },
      { tag: "karyawan", weight: 65 },
      { tag: "peserta", weight: 42 },
      { tag: "materi", weight: 48 },
      { tag: "proses", weight: 35 },
      { tag: "evaluasi", weight: 30 },
      { tag: "manajemen", weight: 25 },
      { tag: "perusahaan", weight: 20 },
      { tag: "pengembangan", weight: 15 },
      { tag: "implementasi", weight: 12 },
      { tag: "kebijakan", weight: 10 },
      { tag: "administrasi", weight: 8 }
    ];

    // Simple pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedInsights = insights.slice(startIndex, endIndex);

    return {
      insights: paginatedInsights,
      totalCount: 500, // Total count for pagination
      wordCloudSvg: this.wordCloudSvg,
      wordCloudData: wordCloudData,
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
          sentiment: "Sistem kerja hybrid memberikan fleksibilitas yang sangat saya hargai...",
          date: "2025-05-13 09:18:52",
        },
        {
          id: 4,
          city: "Yogyakarta",
          source: "Feedback",
          employee: "R*** N***",
          sentiment: "Saya merasa pelatihan yang diberikan kurang relevan dengan pekerjaan saya...",
          date: "2025-05-13 08:07:31",
        },
        {
          id: 5,
          city: "Medan",
          source: "Employee Relation",
          employee: "D*** T***",
          sentiment: "Saya ingin menyampaikan apresiasi saya terhadap program mentoring...",
          date: "2025-05-13 04:56:19",
        },
      ],
    };
  }

  async getUrls(page: number, limit: number): Promise<UrlsResponse> {
    // In a real application, this would fetch URLs from a database with pagination
    const urls = [
      {
        id: 1,
        url: 'https://www.twitter.com',
        totalNumbers: 1200,
        totalInsights: 950,
        totalSentiment: 'Positif (78%)',
        totalClassified: 'Emosi',
        date: '10/05/2025',
        status: 'SUCCESS'
      },
      {
        id: 2,
        url: 'https://www.instagram.com',
        totalNumbers: 850,
        totalInsights: 720,
        totalSentiment: 'Positif (65%)',
        totalClassified: 'Kesehatan',
        date: '08/05/2025',
        status: 'SUCCESS'
      },
      {
        id: 3,
        url: 'https://www.facebook.com',
        totalNumbers: 1500,
        totalInsights: 1350,
        totalSentiment: 'Negatif (53%)',
        totalClassified: 'Lingkungan Kerja',
        date: '05/05/2025',
        status: 'SUCCESS'
      },
      {
        id: 4,
        url: 'https://www.linkedin.com',
        totalNumbers: 300,
        totalInsights: 290,
        totalSentiment: 'Positif (91%)',
        totalClassified: 'Pengembangan',
        date: '02/05/2025',
        status: 'SUCCESS'
      },
      {
        id: 5,
        url: 'https://www.telcom.com/feedback/may',
        totalNumbers: 0,
        totalInsights: 0,
        totalSentiment: '-',
        totalClassified: '-',
        date: '01/05/2025',
        status: 'FAILED'
      },
      {
        id: 6,
        url: 'https://forum.telcom.com/employee',
        totalNumbers: 630,
        totalInsights: 590,
        totalSentiment: 'Netral (48%)',
        totalClassified: 'General',
        date: '28/04/2025',
        status: 'SUCCESS'
      },
      {
        id: 7,
        url: 'https://intranet.telcom.com/survey',
        totalNumbers: 0,
        totalInsights: 0,
        totalSentiment: '-',
        totalClassified: '-',
        date: '15/05/2025',
        status: 'PENDING'
      }
    ];

    // Simple pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUrls = urls.slice(startIndex, endIndex);

    return {
      urls: paginatedUrls,
      total: urls.length
    };
  }

  async addUrl(url: string): Promise<any> {
    // In a real application, this would add a URL to the database and start processing
    return {
      id: Math.floor(Math.random() * 1000) + 10,
      url,
      totalNumbers: 0,
      totalInsights: 0,
      totalSentiment: '-',
      totalClassified: '-',
      date: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).replace(/\//g, '/'),
      status: 'PENDING'
    };
  }

  async deleteUrl(id: number): Promise<void> {
    // In a real application, this would delete a URL from the database
    console.log(`URL with ID ${id} deleted`);
  }

  // Survey Dashboard Summary operations
  async generateSurveyDashboardSummary(): Promise<void> {
    try {
      console.log("Generating survey dashboard summary...");
      
      // First clear existing summary data
      await db.delete(surveyDashboardSummary);
      
      // Get all unique wordInsight values
      const uniqueWordInsights = await db
        .selectDistinct({ wordInsight: employeeInsights.wordInsight })
        .from(employeeInsights);
      
      // For each unique wordInsight, count total, positive, negative, and neutral
      for (const { wordInsight } of uniqueWordInsights) {
        // Skip empty wordInsights
        if (!wordInsight || wordInsight.trim() === '') continue;
        
        // Get total count
        const [totalResult] = await db
          .select({ count: sql<number>`count(*)` })
          .from(employeeInsights)
          .where(eq(employeeInsights.wordInsight, wordInsight));
        
        // Get positive count
        const [positiveResult] = await db
          .select({ count: sql<number>`count(*)` })
          .from(employeeInsights)
          .where(and(
            eq(employeeInsights.wordInsight, wordInsight),
            eq(employeeInsights.sentimen, 'positif')
          ));
        
        // Get negative count
        const [negativeResult] = await db
          .select({ count: sql<number>`count(*)` })
          .from(employeeInsights)
          .where(and(
            eq(employeeInsights.wordInsight, wordInsight),
            eq(employeeInsights.sentimen, 'negatif')
          ));
        
        // Get neutral count
        const [neutralResult] = await db
          .select({ count: sql<number>`count(*)` })
          .from(employeeInsights)
          .where(and(
            eq(employeeInsights.wordInsight, wordInsight),
            eq(employeeInsights.sentimen, 'netral')
          ));
        
        // Calculate percentages (rounded to the nearest integer)
        const totalCount = totalResult.count;
        const positiveCount = positiveResult.count;
        const negativeCount = negativeResult.count;
        const neutralCount = neutralResult.count;
        
        const positivePercentage = totalCount > 0 ? Math.round((positiveCount / totalCount) * 100) : 0;
        const negativePercentage = totalCount > 0 ? Math.round((negativeCount / totalCount) * 100) : 0;
        const neutralPercentage = totalCount > 0 ? Math.round((neutralCount / totalCount) * 100) : 0;
        
        // Insert summary record with calculated percentages
        await db.insert(surveyDashboardSummary).values({
          wordInsight,
          totalCount,
          positiveCount,
          negativeCount,
          neutralCount,
          positivePercentage,
          negativePercentage,
          neutralPercentage
        });
      }
      
      console.log("Survey dashboard summary generation completed.");
    } catch (error) {
      console.error("Error generating survey dashboard summary:", error);
      throw error;
    }
  }

  async getSurveyDashboardSummary(page: number = 1, limit: number = 10): Promise<{
    data: SurveyDashboardSummary[],
    total: number
  }> {
    try {
      // Calculate offset
      const offset = (page - 1) * limit;
      
      // Get total count
      const [totalResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(surveyDashboardSummary);
      
      // Get paginated data
      const data = await db
        .select()
        .from(surveyDashboardSummary)
        .orderBy(desc(surveyDashboardSummary.totalCount))
        .limit(limit)
        .offset(offset);
      
      return {
        data,
        total: totalResult.count
      };
    } catch (error) {
      console.error("Error getting survey dashboard summary:", error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();