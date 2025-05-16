import { pgTable, text, serial, integer, boolean, timestamp, json, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default("user"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Employee Insights data table
export const employeeInsights = pgTable("employee_insights", {
  id: serial("id").primaryKey(),
  sourceData: text("sourceData").notNull(),
  employeeName: text("employeeName").notNull(),
  date: timestamp("date").notNull(),
  witel: text("witel").notNull(),
  kota: text("kota").notNull(),
  originalInsight: text("originalInsight").notNull(),
  sentenceInsight: text("sentenceInsight").notNull(),
  wordInsight: text("wordInsight").notNull(),
  sentimen: text("sentimen").notNull(), // 'positif', 'negatif', 'netral'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEmployeeInsightSchema = createInsertSchema(employeeInsights).omit({
  id: true,
  createdAt: true,
});

// Insights table schema (legacy, keeping for reference)
export const insights = pgTable("insights", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  neutralCount: integer("neutral_count").notNull(),
  negativeCount: integer("negative_count").notNull(),
  positiveCount: integer("positive_count").notNull(),
  views: integer("views").default(0),
  comments: integer("comments").default(0),
  isPinned: boolean("is_pinned").default(false),
  category: text("category").notNull(), // 'neutral', 'negative', 'positive'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInsightSchema = createInsertSchema(insights).omit({
  id: true,
  createdAt: true,
});

// URLs table schema
export const urls = pgTable("urls", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  totalNumbers: integer("total_numbers").default(0),
  totalInsights: integer("total_insights").default(0),
  totalSentiment: text("total_sentiment").default("0/0"),
  totalClassified: text("total_classified").default("0/0"),
  date: timestamp("date").defaultNow(),
  status: text("status").default("PENDING"), // 'SUCCESS', 'FAILED', 'PENDING'
});

export const insertUrlSchema = createInsertSchema(urls).omit({
  id: true,
  date: true,
});

// Analytics Data schema
export const analyticsData = pgTable("analytics_data", {
  id: serial("id").primaryKey(),
  totalEmployees: integer("total_employees").default(0),
  totalInsights: integer("total_insights").default(0),
  totalNegative: integer("total_negative").default(0),
  totalPositive: integer("total_positive").default(0),
  monthlyData: json("monthly_data").$type<Array<{
    name: string;
    positive: number;
    negative: number;
    neutral: number;
  }>>(),
  pieData: json("pie_data").$type<Array<{
    name: string;
    value: number;
  }>>(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Top insights table schema for storing top word insights based on total count
export const topInsights = pgTable("top_insights", {
  id: serial("id").primaryKey(),
  wordInsight: text("word_insight").notNull(),
  totalCount: integer("total_count").notNull(),
  // Kolom berikut hanya untuk kompatibilitas dengan struktur database lama
  location: text("location").notNull().default('n/a'),
  source: text("source").notNull().default('n/a'),
  employee: text("employee").notNull().default('n/a'),
  sentiment: text("sentiment").notNull().default('n/a'),
  date: timestamp("date").defaultNow(),
});

export const insertTopInsightSchema = createInsertSchema(topInsights).omit({
  id: true,
  date: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Insight = typeof insights.$inferSelect;
export type InsertInsight = z.infer<typeof insertInsightSchema>;

export type Url = typeof urls.$inferSelect;
export type InsertUrl = z.infer<typeof insertUrlSchema>;

export type AnalyticsData = typeof analyticsData.$inferSelect;

export type TopInsight = typeof topInsights.$inferSelect;
export type InsertTopInsight = z.infer<typeof insertTopInsightSchema>;

export type EmployeeInsightType = typeof employeeInsights.$inferSelect;
export type InsertEmployeeInsight = z.infer<typeof insertEmployeeInsightSchema>;

// Tabel baru untuk menyimpan 10 word insight dengan total count terbanyak
// Tabel ini lebih sederhana dari top_insights yang lama, hanya berisi word_insight dan total_count
export const topWordInsights = pgTable("top_word_insights", {
  id: serial("id").primaryKey(),
  wordInsight: text("word_insight").notNull(),
  totalCount: integer("total_count").notNull(),
});

export const insertTopWordInsightSchema = createInsertSchema(topWordInsights).omit({
  id: true,
});

export type TopWordInsight = typeof topWordInsights.$inferSelect;
export type InsertTopWordInsight = z.infer<typeof insertTopWordInsightSchema>;

// Custom types for frontend
export interface InsightData {
  id: number;
  title: string;
  neutralPercentage: number;
  negativePercentage: number;
  positivePercentage: number;
  views: number;
  comments: number;
}

export interface CategoryInsights {
  neutral: InsightData[];
  negative: InsightData[];
  positive: InsightData[];
  additional?: InsightData[];
}

export interface TopInsightData {
  insights: TopInsight[];
  totalCount: number;
  wordCloudSvg: string;
  wordCloudData?: Array<{
    tag: string;
    weight: number;
  }>;
}

export interface AnalyticsFullData {
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

export interface UrlsResponse {
  urls: Url[];
  total: number;
}

// Survey dashboard summary table
export const surveyDashboardSummary = pgTable("survey_dashboard_summary", {
  id: serial("id").primaryKey().notNull(),
  wordInsight: text("word_insight").notNull(),
  totalCount: integer("total_count").notNull(),
  positiveCount: integer("positive_count").notNull(),
  negativeCount: integer("negative_count").notNull(),
  neutralCount: integer("neutral_count").notNull(),
  positivePercentage: integer("positive_percentage").default(0),
  negativePercentage: integer("negative_percentage").default(0),
  neutralPercentage: integer("neutral_percentage").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSurveyDashboardSummarySchema = createInsertSchema(surveyDashboardSummary).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type SurveyDashboardSummary = typeof surveyDashboardSummary.$inferSelect;
export type InsertSurveyDashboardSummary = z.infer<typeof insertSurveyDashboardSummarySchema>;

// Tabel untuk menyimpan data geografis untuk peta Indonesia
export const mapGeoData = pgTable("map_geo_data", {
  id: serial("id").primaryKey().notNull(),
  regionId: text("region_id").notNull().unique(), // ID provinsi (ID-JK, ID-JB, dll)
  regionName: text("region_name").notNull(), // Nama provinsi
  witel: text("witel").notNull(), // Wilayah telekomunikasi
  latitude: text("latitude").notNull(), // Latitude untuk penempatan label
  longitude: text("longitude").notNull(), // Longitude untuk penempatan label
  totalCount: integer("total_count").notNull().default(0), // Total data
  positiveCount: integer("positive_count").notNull().default(0), // Jumlah data positif
  negativeCount: integer("negative_count").notNull().default(0), // Jumlah data negatif
  neutralCount: integer("neutral_count").notNull().default(0), // Jumlah data netral
  dominantSentiment: text("dominant_sentiment").notNull().default("neutral"), // Sentimen dominan (positive, negative, neutral)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMapGeoDataSchema = createInsertSchema(mapGeoData).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type MapGeoData = typeof mapGeoData.$inferSelect;
export type InsertMapGeoData = z.infer<typeof insertMapGeoDataSchema>;
