
// Export all conference feedbacks to CSV (ESM syntax)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function toCsvRow(obj, fields) {
	return fields.map(f => {
		let val = obj[f];
		if (val === null || val === undefined) return '';
		if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
			return '"' + val.replace(/"/g, '""') + '"';
		}
		return val;
	}).join(',');
}

export async function exportConferenceFeedbacks() {
	const feedbacks = await prisma.conferenceFeedbacks.findMany();
	if (!feedbacks.length) {
		console.log('No feedbacks found.');
		return;
	}
	const fields = Object.keys(feedbacks[0]);
	const csvRows = [fields.join(',')];
	for (const fb of feedbacks) {
		csvRows.push(toCsvRow(fb, fields));
	}
	const outPath = path.join(__dirname, 'conference_feedbacks_export.csv');
	fs.writeFileSync(outPath, csvRows.join('\n'));
	console.log(`Exported ${feedbacks.length} feedbacks to ${outPath}`);
	await prisma.$disconnect();
}

// Run export if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
	exportConferenceFeedbacks();
}
