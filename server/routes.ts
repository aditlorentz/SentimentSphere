import express, { type Express, NextFunction } from "express";
import type { Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import { compareSync, hashSync } from "bcryptjs";

// Simple middleware to log requests
const logRequests = (req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Use the logging middleware
  app.use(logRequests);
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

  const httpServer = createServer(app);
  return httpServer;
}
