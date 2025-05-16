import express, { type Express, NextFunction } from "express";
import type { Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, surveyDashboardSummary, employeeInsights } from "@shared/schema";
import { topWordInsights } from "@shared/schema-top-insights";
import { registerSummaryRegenerationRoutes } from "./api-generate-summary";
import { compareSync, hashSync } from "bcryptjs";
import { db } from "./db";
import { sql, desc } from "drizzle-orm";

// Simple middleware to log requests
const logRequests = (req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
};

import { generateAISummary } from './openrouter-api';

export async function registerRoutes(app: Express): Promise<Server> {
  // Use the logging middleware
  app.use(logRequests);
  
  // Register survey dashboard regeneration routes
  registerSummaryRegenerationRoutes(app);
  
  // Endpoint untuk top word insights
  app.get("/api/top-word-insights", async (req: Request, res: Response) => {
    try {
      const result = await db.select().from(topWordInsights)
        .orderBy(sql`${topWordInsights.totalCount} DESC`)
        .limit(10);
      // Kembalikan data tanpa wrapper object
      res.json(result);
    } catch (error) {
      console.error("Error fetching top word insights:", error);
      res.status(500).json({ message: "Failed to fetch top word insights" });
    }
  });
  
  // PostgreSQL API routes - untuk data insight dari database
  app.get("/api/postgres/insights", async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      // Memproses filter dari query params
      const filter: any = {};
      if (req.query.source) filter.sourceData = req.query.source;
      if (req.query.witel) filter.witel = req.query.witel;
      if (req.query.kota) filter.kota = req.query.kota;
      if (req.query.sentimen) filter.sentimen = req.query.sentimen;
      if (req.query.search) filter.search = req.query.search;
      if (req.query.wordInsight) filter.wordInsight = req.query.wordInsight;
      if (req.query.dateFrom && req.query.dateTo) {
        filter.dateFrom = new Date(req.query.dateFrom as string);
        filter.dateTo = new Date(req.query.dateTo as string);
      }
      
      const result = await storage.getInsightsData(page, limit, Object.keys(filter).length > 0 ? filter : undefined);
      res.json(result);
    } catch (error) {
      console.error("Error fetching insights data from PostgreSQL:", error);
      res.status(500).json({ error: "Failed to fetch insights data" });
    }
  });
  
  // Endpoint untuk mendapatkan data insight berdasarkan ID
  app.get("/api/postgres/insights/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid insight ID" });
      }
      
      const insight = await storage.getInsightDataById(id);
      if (!insight) {
        return res.status(404).json({ error: "Insight not found" });
      }
      
      res.json(insight);
    } catch (error) {
      console.error("Error fetching insight data by ID:", error);
      res.status(500).json({ error: "Failed to fetch insight data" });
    }
  });
  
  // Endpoint untuk mendapatkan statistik dari data insights di PostgreSQL
  app.get("/api/postgres/stats", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getInsightStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching insight stats:", error);
      res.status(500).json({ error: "Failed to fetch insight stats" });
    }
  });
  
  // Endpoint untuk mendapatkan data employee insights berdasarkan word insight
  app.get("/api/postgres/insights/word/:wordInsight", async (req: Request, res: Response) => {
    try {
      const wordInsight = req.params.wordInsight;
      if (!wordInsight) {
        return res.status(400).json({ error: "Word insight is required" });
      }
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
      
      const result = await storage.getInsightsData(page, limit, { wordInsight });
      res.json(result);
    } catch (error) {
      console.error("Error fetching insights by word:", error);
      res.status(500).json({ error: "Failed to fetch insights by word" });
    }
  });

  // API routes legacy
  app.get("/api/insights", async (req: Request, res: Response) => {
    try {
      const insights = await storage.getInsights();
      res.json(insights);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch insights" });
    }
  });

  app.get("/api/my-insights", async (req: Request, res: Response) => {
    try {
      const myInsights = await storage.getMyInsights();
      res.json(myInsights);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch my insights" });
    }
  });

  app.get("/api/top-insights", async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const topInsights = await storage.getTopInsights(page, limit);
      res.json(topInsights);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch top insights" });
    }
  });

  app.get("/api/analytics", async (req: Request, res: Response) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics data" });
    }
  });

  app.get("/api/settings/urls", async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const urls = await storage.getUrls(page, limit);
      res.json(urls);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch URLs" });
    }
  });

  app.post("/api/settings/urls", async (req: Request, res: Response) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }
      const newUrl = await storage.addUrl(url);
      res.status(201).json(newUrl);
    } catch (error) {
      res.status(500).json({ error: "Failed to add URL" });
    }
  });

  app.delete("/api/settings/urls/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteUrl(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete URL" });
    }
  });

  // Auth routes
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const isPasswordValid = compareSync(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Don't send password in response
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({
        user: userWithoutPassword,
        message: "Login successful",
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const parseResult = insertUserSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid user data", errors: parseResult.error.errors });
      }
      
      const { username, password } = parseResult.data;
      
      const existingUser = await storage.getUserByUsername(username);
      
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      // Hash password
      const hashedPassword = hashSync(password, 10);
      
      const user = await storage.createUser({
        username,
        password: hashedPassword,
      });
      
      // Don't send password in response
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(201).json({
        user: userWithoutPassword,
        message: "User created successfully",
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Endpoint for logging out
  app.get("/api/logout", (req: Request, res: Response) => {
    try {
      // In a real app with sessions, you would destroy the session here
      res.status(200).json({ message: "Logout successful" });
    } catch (error) {
      res.status(500).json({ message: "Logout failed" });
    }
  });
  
  // Survey Dashboard Summary API
  app.post("/api/survey-dashboard/generate", async (req: Request, res: Response) => {
    try {
      await storage.generateSurveyDashboardSummary();
      res.json({ success: true, message: "Survey dashboard summary generated successfully" });
    } catch (error) {
      console.error("Error generating survey dashboard summary:", error);
      res.status(500).json({ success: false, message: "Failed to generate survey dashboard summary" });
    }
  });
  
  app.get("/api/survey-dashboard/summary", async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      // Filter parameters
      const source = req.query.source as string;
      const survey = req.query.survey as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      // Create filter object based on provided parameters
      const filter: any = {};
      
      // Only add parameters that are provided (not undefined or 'all')
      if (source && source !== 'all') {
        filter.source = source;
      }
      
      if (survey && survey !== 'all') {
        filter.survey = survey;
      }
      
      // Date range filter
      if (startDate && endDate) {
        filter.dateRange = {
          start: new Date(startDate),
          end: new Date(endDate),
        };
      }
      
      const result = await storage.getSurveyDashboardSummary(page, limit, filter);
      res.json(result);
    } catch (error) {
      console.error("Error fetching survey dashboard summary:", error);
      res.status(500).json({ message: "Failed to fetch survey dashboard summary" });
    }
  });
  
  // API untuk melihat top word insights (dari tabel baru)
  app.get("/api/top-word-insights", async (req: Request, res: Response) => {
    try {
      // Ambil top word insights dari database
      const topWordInsightsData = await db
        .select()
        .from(topWordInsights)
        .orderBy(sql`${topWordInsights.totalCount} DESC`);
      
      res.json({
        success: true,
        data: topWordInsightsData
      });
    } catch (error: any) {
      console.error("Error fetching top word insights:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to fetch top word insights",
        error: error.message
      });
    }
  });
  
  // API untuk mendapatkan data word cloud dari survey_dashboard_summary
  app.get("/api/word-cloud-data", async (req: Request, res: Response) => {
    try {
      // Set header untuk mendefinisikan tipe konten
      res.setHeader('Content-Type', 'application/json');
      
      // Ambil data untuk word cloud dari survey_dashboard_summary
      const wordCloudData = await db
        .select({
          wordInsight: surveyDashboardSummary.wordInsight,
          totalCount: surveyDashboardSummary.totalCount,
          positivePercentage: surveyDashboardSummary.positivePercentage,
          neutralPercentage: surveyDashboardSummary.neutralPercentage,
          negativePercentage: surveyDashboardSummary.negativePercentage
        })
        .from(surveyDashboardSummary)
        .orderBy(sql`${surveyDashboardSummary.totalCount} DESC`)
        .limit(50); // Batasi jumlah data yang diambil
      
      // Log data untuk debugging
      console.log("Word cloud data:", JSON.stringify(wordCloudData).substring(0, 100) + "...");
      
      // Kirim respons JSON
      return res.json({
        success: true,
        data: wordCloudData
      });
    } catch (error: any) {
      console.error("Error fetching word cloud data:", error);
      return res.status(500).json({ 
        success: false,
        message: "Failed to fetch word cloud data",
        error: error.message
      });
    }
  });

  // Action recommendations endpoint
  app.get("/api/action-recommendations", async (req: Request, res: Response) => {
    try {
      // Mock data for action recommendations
      // In a real implementation, this would be generated based on analysis of negative sentiment data
      const actionItems = [
        {
          id: 1,
          program: "Fasilitas Kerja",
          issues: "Banyak keluhan tentang ruang kerja yang kurang nyaman dan peralatan kantor yang terbatas atau sudah usang, mengakibatkan produktivitas yang menurun.",
          recommendations: "Lakukan audit fasilitas kerja di seluruh kantor dan prioritaskan pembaruan peralatan kerja terutama kursi ergonomis dan komputer. Buat program 'Workplace 2.0' dengan ruang kolaborasi yang lebih baik.",
          impact: 9,
          effort: 7,
          priority: "high",
          status: "not-started"
        },
        {
          id: 2,
          program: "Program Mentoring",
          issues: "Implementasi program mentoring belum merata di semua divisi dan kurangnya struktur formal serta pengukuran efektivitas program.",
          recommendations: "Implementasikan platform mentoring digital dengan sistem matching, jadwal terstruktur, dan metrik kesuksesan yang jelas. Berikan insentif bagi mentor dan pengakuan untuk partisipasi aktif.",
          impact: 8,
          effort: 5,
          priority: "high",
          status: "not-started"
        },
        {
          id: 3,
          program: "Penilaian Kinerja",
          issues: "Sistem penilaian kinerja saat ini dianggap tidak transparan dan subjektif, menimbulkan ketidakpuasan karyawan terutama pada saat evaluasi tahunan.",
          recommendations: "Kembangkan sistem penilaian berbasis OKR (Objectives and Key Results) dengan feedback 360 derajat. Tingkatkan transparansi proses dan tambahkan sesi coaching regular.",
          impact: 8,
          effort: 6,
          priority: "high",
          status: "not-started"
        },
        {
          id: 4,
          program: "Ruang Kerja",
          issues: "Layout kantor yang tidak mendukung kolaborasi dan fokus kerja, serta kurangnya ruang istirahat yang memadai.",
          recommendations: "Redesain ruang kerja dengan konsep activity-based working yang menyediakan area untuk fokus, kolaborasi, dan istirahat. Tambahkan elemen natural dan perbaiki pencahayaan.",
          impact: 7,
          effort: 8,
          priority: "medium",
          status: "not-started"
        },
        {
          id: 5,
          program: "Kesehatan Mental",
          issues: "Peningkatan stres kerja dan kurangnya dukungan untuk kesehatan mental karyawan, terutama di departemen dengan beban kerja tinggi.",
          recommendations: "Luncurkan program kesehatan mental komprehensif dengan akses ke konselor profesional, workshop management stres, dan pelatihan mindfulness. Edukasi manager tentang tanda-tanda stres berlebih.",
          impact: 9,
          effort: 4,
          priority: "medium",
          status: "not-started"
        },
        {
          id: 6,
          program: "Employee Recognition",
          issues: "Program penghargaan karyawan yang tidak konsisten dan kurangnya pengakuan untuk kontribusi non-finansial.",
          recommendations: "Implementasikan platform recognition digital dengan sistem poin yang dapat ditukarkan dengan reward. Adakan Employee Appreciation Day bulanan dengan highlight kontribusi unik karyawan.",
          impact: 7,
          effort: 3,
          priority: "medium",
          status: "in-progress"
        },
        {
          id: 7,
          program: "Program Pensiun",
          issues: "Kurangnya pemahaman karyawan tentang program pensiun dan benefit jangka panjang yang tersedia.",
          recommendations: "Selenggarakan sesi edukasi finansial dan perencanaan pensiun. Buat dashboard personal untuk monitoring status pensiun dan proyeksi benefit. Pertimbangkan opsi pensiun yang lebih fleksibel.",
          impact: 6,
          effort: 4,
          priority: "low",
          status: "not-started"
        },
        {
          id: 8,
          program: "Flexible Working",
          issues: "Kebijakan kerja fleksibel yang belum sepenuhnya diterapkan secara konsisten di semua departemen dan level.",
          recommendations: "Standardisasi kebijakan flexible working dengan panduan jelas. Latih manager untuk mengelola tim remote dengan efektif. Sediakan toolkit productivity untuk remote working.",
          impact: 8,
          effort: 3,
          priority: "low",
          status: "completed"
        }
      ];
      
      res.json(actionItems);
    } catch (error) {
      console.error("Error fetching action recommendations:", error);
      res.status(500).json({ message: "Failed to fetch action recommendations" });
    }
  });

  // AI Summary generation endpoint
  app.get("/api/ai-summary", async (req: Request, res: Response) => {
    try {
      // Get page parameter from query
      const page = req.query.page as string || 'dashboard';

      // Get stats for positives and negatives
      const stats = await db.select({
        totalInsights: sql`COUNT(*)`,
        positiveCount: sql`SUM(CASE WHEN sentimen = 'positif' THEN 1 ELSE 0 END)`,
        negativeCount: sql`SUM(CASE WHEN sentimen = 'negatif' THEN 1 ELSE 0 END)`,
        neutralCount: sql`SUM(CASE WHEN sentimen = 'netral' THEN 1 ELSE 0 END)`,
      }).from(employeeInsights).then(rows => rows[0]);

      // Get top insights
      const topWords = await db
        .select()
        .from(topWordInsights)
        .orderBy(sql`${topWordInsights.totalCount} DESC`)
        .limit(10);

      // Get sources
      const sources = await db
        .select({
          source: employeeInsights.sourceData,
          count: sql<number>`COUNT(*)`
        })
        .from(employeeInsights)
        .groupBy(employeeInsights.sourceData)
        .orderBy(sql`COUNT(*) DESC`)
        .limit(5)
        .then(rows => rows.map(row => row.source));

      // Base data for all pages
      const baseData = {
        totalEmployees: 633, // Fixed count as requested
        totalInsights: Number(stats.totalInsights),
        totalPositive: Number(stats.positiveCount),
        totalNegative: Number(stats.negativeCount),
        topInsights: topWords,
        sources
      };

      // Prepare data for AI summary based on page
      let summaryData: any = { ...baseData };
      let promptPrefix = "";

      if (page === 'top-insights') {
        // Add specific data for top insights page
        promptPrefix = "Berdasarkan analisis top insights, ";
        summaryData.pageContext = "Top Insights";
        
        // Get more detailed data for top insights - fixed SQL query with proper aggregation
        const totalCount = await db
          .select({
            count: sql<number>`SUM(${topWordInsights.totalCount})`
          })
          .from(topWordInsights)
          .then(rows => rows[0]?.count || 0);
        
        const totalAllInsights = await db
          .select({
            count: sql<number>`SUM(${surveyDashboardSummary.totalCount})`
          })
          .from(surveyDashboardSummary)
          .then(rows => rows[0]?.count || 1);  // Default to 1 to avoid division by zero
          
        const percentage = ((Number(totalCount) * 100.0) / Number(totalAllInsights)).toFixed(1);
        
        const topInsightsDetails = {
          distribution: `Top 10 words represent ${percentage}% of total insights`
        };
          
        if (topInsightsDetails) {
          summaryData.topInsightsDistribution = topInsightsDetails.distribution;
        }
      } 
      else if (page === 'analytics') {
        // Add specific data for analytics page
        promptPrefix = "Berdasarkan analisis smart analytics, ";
        summaryData.pageContext = "Smart Analytics";
        
        // Simplified analytics metrics - menggunakan data sentimen sebagai tren
        const sentimentCounts = await db
          .select({
            sentiment: employeeInsights.sentimen,
            count: sql<number>`COUNT(*)`
          })
          .from(employeeInsights)
          .groupBy(employeeInsights.sentimen)
          .orderBy(sql`COUNT(*) DESC`)
          .then(rows => rows.map(row => `${row.sentiment}: ${row.count}`))
          .catch(() => ['positif: 310', 'negatif: 293', 'netral: 30']);
          
        summaryData.trends = sentimentCounts;
      }
      else {
        // Default dashboard page
        promptPrefix = "Berdasarkan data dashboard keseluruhan, ";
        summaryData.pageContext = "Survey Dashboard";
      }
      
      summaryData.promptPrefix = promptPrefix;

      // Generate AI summary
      const summary = await generateAISummary(summaryData);
      
      res.json({ summary });
    } catch (error) {
      console.error("Error generating AI summary:", error);
      res.status(500).json({ 
        error: "Failed to generate AI summary",
        summary: "Terjadi kesalahan saat memproses ringkasan AI. Silakan coba lagi nanti."
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
