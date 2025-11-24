#!/usr/bin/env tsx

/**
 * Test script to verify Late API key is working
 * Run with: npm run test:key
 */

const LATE_KEY = "sk_8df0f8a562160cf0bb0dcec76a546a734b720bae3123743bf098af6521facaf5";

async function testLateKey() {
  console.log("Testing Late API key...\n");

  try {
    const response = await fetch("https://getlate.dev/api/v1/usage-stats", {
      headers: {
        Authorization: `Bearer ${LATE_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();

    console.log("✅ Late API key is WORKING!\n");
    console.log("Usage Stats:");
    console.log(JSON.stringify(data, null, 2));
    console.log("\n🎉 You're ready to build Pulse Social!");
  } catch (error) {
    console.error("❌ Late API key test FAILED:");
    console.error(error);
    process.exit(1);
  }
}

testLateKey();

