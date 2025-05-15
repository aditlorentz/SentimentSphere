import express, { type Express } from "express";
import type { Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import { compareSync, hashSync } from "bcryptjs";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
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

  const httpServer = createServer(app);
  return httpServer;
}
