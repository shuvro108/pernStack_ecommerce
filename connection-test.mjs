import "dotenv/config";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

console.log("═══════════════════════════════════════════════════");
console.log("   NEON DATABASE CONNECTION DIAGNOSTIC TEST");
console.log("═══════════════════════════════════════════════════\n");

const connectionString = process.env.DATABASE_URL;
console.log("1️⃣  CONNECTION STRING CHECK:");
console.log("   DATABASE_URL exists:", !!connectionString);
console.log("   Length:", connectionString?.length || 0);
console.log("   Host contains:", connectionString?.includes("neon.tech") ? "✓ Neon host" : "✗ Wrong host");
console.log("   Port included:", connectionString?.includes(":") ? "✓ Yes" : "✗ No");

console.log("\n2️⃣  CONFIGURATION CHECK:");
neonConfig.webSocketConstructor = ws;
neonConfig.fetchConnectionCache = true;
console.log("   WebSocket constructor: ✓ Set");
console.log("   Fetch cache enabled: ✓ Yes");

console.log("\n3️⃣  POOL CREATION:");
try {
  const pool = new Pool({ connectionString });
  console.log("   Pool created: ✓ Success");
  console.log("   Pool type:", pool.constructor.name);
  
  console.log("\n4️⃣  CONNECTION ATTEMPT:");
  console.log("   Attempting query in 3 seconds...\n");
  
  setTimeout(async () => {
    try {
      const result = await pool.query("SELECT 1 as test");
      console.log("   ✅ CONNECTION SUCCESSFUL!");
      console.log("   Query result:", result.rows);
      process.exit(0);
    } catch (err) {
      console.log("   ❌ CONNECTION FAILED");
      console.log("   Error type:", err.name);
      console.log("   Error message:", err.message);
      console.log("   Error code:", err.code);
      
      if (err.message?.includes("ETIMEDOUT")) {
        console.log("\n   🔴 ROOT CAUSE: Network Timeout");
        console.log("   This means the firewall is blocking connection to Neon.");
        console.log("   Required action: Contact network admin to enable:");
        console.log("   • Port 443 (WebSocket)");
        console.log("   • Port 5432 (PostgreSQL TCP)");
      }
      
      process.exit(1);
    }
  }, 3000);
  
} catch (err) {
  console.log("   ❌ Pool creation failed:", err.message);
  process.exit(1);
}
