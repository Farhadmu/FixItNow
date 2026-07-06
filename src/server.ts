import app from "./app";
import { env } from "./config/env";
import { prisma } from "./lib/prisma";

async function main() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");

    app.listen(env.PORT, () => {
      console.log(`🚀 FixItNow API is running on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});
