import { PrismaClient } from "@prisma/client";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

// ============================================
// CONFIGURATION - Edit these paths for your event
// ============================================
const CREDITS_CSV_PATH = join(process.cwd(), "prisma/credits.csv");
const USERS_CSV_PATH = join(process.cwd(), "prisma/users.csv");

// Example files (used if main files don't exist)
const CREDITS_EXAMPLE_PATH = join(process.cwd(), "prisma/credits.csv");
const USERS_EXAMPLE_PATH = join(process.cwd(), "prisma/guests.csv");

/**
 * Parse CSV file and return array of objects
 */
function parseCSV(filepath: string): Record<string, string>[] {
	if (!existsSync(filepath)) {
		console.log(`   ⚠️  File not found: ${filepath}`);
		return [];
	}

	const content = readFileSync(filepath, "utf-8");
	const lines = content.trim().split("\n").filter(line => line.trim());

	if (lines.length < 2) return [];

	const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/"/g, ""));
	const rows: Record<string, string>[] = [];

	for (let i = 1; i < lines.length; i++) {
		const values = lines[i].split(",").map(v => v.trim().replace(/"/g, ""));
		const row: Record<string, string> = {};

		headers.forEach((header, index) => {
			row[header] = values[index] || "";
		});

		rows.push(row);
	}

	return rows;
}

/**
 * Extract referral code from Cursor link
 */
function extractCode(link: string): string {
	const match = link.match(/code=([A-Za-z0-9]+)/);
	return match ? match[1] : link.replace(/[^A-Za-z0-9]/g, "").substring(0, 12);
}

/**
 * Main seed function
 */
async function main() {
	console.log("🌱 Starting Cafe Cursor database seed...\n");

	// Clean existing data
	console.log("🗑️  Cleaning existing data...");
	await prisma.eligibleUser.deleteMany();
	await prisma.credit.deleteMany();

	// ============================================
	// 1. LOAD CREDITS FROM CSV
	// ============================================
	console.log("\n📦 Loading credits...");

	const creditsPath = existsSync(CREDITS_CSV_PATH) ? CREDITS_CSV_PATH : CREDITS_EXAMPLE_PATH;
	const creditsData = parseCSV(creditsPath);

	let creditsCreated = 0;

	for (const row of creditsData) {
		const link = row.link || row.url || "";
		if (!link) continue;

		const code = extractCode(link);
		const isUsed = (row.status || "").toLowerCase() === "taken";

		try {
			await prisma.credit.create({
				data: {
					code,
					link: link.startsWith("http") ? link : `https://cursor.com/referral?code=${code}`,
					isUsed,
					isTest: false,
					assignedAt: isUsed ? new Date() : null,
				},
			});
			creditsCreated++;
		} catch (e) {
			console.log(`   ⚠️  Skipping duplicate: ${code}`);
		}
	}

	console.log(`   ✅ ${creditsCreated} credits loaded from CSV`);

	// ============================================
	// 2. LOAD ELIGIBLE USERS FROM CSV
	// ============================================
	console.log("\n👥 Loading eligible users...");

	const usersPath = existsSync(USERS_CSV_PATH) ? USERS_CSV_PATH : USERS_EXAMPLE_PATH;
	const usersData = parseCSV(usersPath);

	let usersCreated = 0;

	for (const row of usersData) {
		const email = (row.email || "").toLowerCase().trim();
		const name = row.name || "Unknown";
		const status = row.approval_status || row.status || "approved";

		if (!email || !email.includes("@")) continue;
		if (status.toLowerCase() !== "approved") continue;

		try {
			await prisma.eligibleUser.create({
				data: {
					email,
					name,
					company: row.company || null,
					role: row.role || null,
					approvalStatus: "approved",
					hasClaimed: false,
				},
			});
			usersCreated++;
		} catch (e) {
			console.log(`   ⚠️  Skipping duplicate: ${email}`);
		}
	}

	console.log(`   ✅ ${usersCreated} eligible users loaded from CSV`);

	// ============================================

	// ============================================
	// FINAL STATISTICS
	// ============================================
	const stats = {
		totalCredits: await prisma.credit.count(),
		availableCredits: await prisma.credit.count({ where: { isUsed: false, isTest: false } }),
		testCredits: await prisma.credit.count({ where: { isTest: true } }),
		usedCredits: await prisma.credit.count({ where: { isUsed: true } }),
		totalEligibleUsers: await prisma.eligibleUser.count(),
		testUsers: await prisma.eligibleUser.count({ where: { company: "Test Company" } }),
	};

	console.log("\n" + "=".repeat(50));
	console.log("📊 FINAL STATISTICS");
	console.log("=".repeat(50));
	console.log(`   Total credits:        ${stats.totalCredits}`);
	console.log(`   Available credits:    ${stats.availableCredits}`);
	console.log(`   Test credits:         ${stats.testCredits}`);
	console.log(`   Used credits:         ${stats.usedCredits}`);
	console.log(`   Eligible users:       ${stats.totalEligibleUsers}`);
	console.log(`   Test users:           ${stats.testUsers}`);
	console.log("=".repeat(50));
	console.log("\n🎉 Seed completed successfully!");
}

main()
	.catch((e) => {
		console.error("❌ Seed error:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
