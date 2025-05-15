import { db } from "./db";
import { users } from "@shared/schema";
import { hashSync } from "bcryptjs";
import { eq } from "drizzle-orm";

async function addAdminUser() {
  console.log("Adding admin user to database...");
  
  try {
    // Check if admin user already exists
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.username, "admin@nlp"));
    
    if (existingUsers.length > 0) {
      console.log("Admin user already exists.");
      return;
    }
    
    // Create admin user with hardcoded credentials
    const hashedPassword = hashSync("12345", 10);
    
    await db.insert(users)
      .values({
        username: "admin@nlp",
        password: hashedPassword,
        role: "admin"
      });
    
    console.log("Admin user created successfully!");
  } catch (error) {
    console.error("Error adding admin user:", error);
  }
}

// Run the function
addAdminUser().finally(() => process.exit());