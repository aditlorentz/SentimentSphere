import { pgTable, serial, integer, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Tabel baru untuk menyimpan 10 word insight dengan total count terbanyak
 * Tabel ini lebih sederhana dari top_insights yang lama, hanya berisi word_insight dan total_count
 */
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