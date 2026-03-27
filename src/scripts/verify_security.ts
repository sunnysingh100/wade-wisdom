import * as crypto from "crypto";

function compareSecure(provided: string, expected: string): boolean {
  const providedHash = crypto.createHash("sha256").update(provided).digest();
  const expectedHash = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(providedHash, expectedHash);
}

const testCases = [
  { provided: "secret", expected: "secret", expectedResult: true },
  { provided: "wrong", expected: "secret", expectedResult: false },
  { provided: "secre", expected: "secret", expectedResult: false },
  { provided: "secret123", expected: "secret", expectedResult: false },
  { provided: "", expected: "secret", expectedResult: false },
  { provided: "a".repeat(100), expected: "a".repeat(100), expectedResult: true },
  { provided: "a".repeat(100), expected: "b".repeat(100), expectedResult: false },
];

console.log("🧪 Running security logic verification...");

let failed = false;
for (const { provided, expected, expectedResult } of testCases) {
  const result = compareSecure(provided, expected);
  if (result !== expectedResult) {
    console.error(`❌ FAILED: provided="${provided}", expected="${expected}". Got ${result}, expected ${expectedResult}`);
    failed = true;
  } else {
    console.log(`✅ PASSED: provided="${provided}", expected="${expected}"`);
  }
}

if (failed) {
  process.exit(1);
} else {
  console.log("\n✨ All security logic tests passed!");
}
