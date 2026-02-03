const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const root = process.cwd();

function checkRealtimeCleanup() {
	console.log('🔍 Checking Realtime Cleanup patterns...');
	const srcPath = path.join(root, 'src');
	const files = getFiles(srcPath, ['.tsx', '.ts']);

	let issues = 0;
	for (const file of files) {
		const content = fs.readFileSync(file, 'utf8');
		if (content.includes('.subscribe(') && !content.includes('removeChannel')) {
			console.log(`⚠️  Potential missing cleanup in: ${path.relative(root, file)}`);
			issues++;
		}
	}

	if (issues === 0) console.log('✅ All Realtime subscriptions seem to have cleanup.');
}

function checkGpsAccuracy() {
	console.log('🔍 Checking GPS Accuracy thresholds...');
	const srcPath = path.join(root, 'src');
	const files = getFiles(srcPath, ['.tsx', '.ts']);

	let found = false;
	for (const file of files) {
		const content = fs.readFileSync(file, 'utf8');
		if (content.includes('getCurrentPosition') && !content.includes('accuracy > 50')) {
			console.log(`⚠️  Missing accuracy threshold check in: ${path.relative(root, file)}`);
			found = true;
		}
	}
	if (!found) console.log('✅ GPS accuracy checks found where expected.');
}

function getFiles(dir, exts) {
	let results = [];
	const list = fs.readdirSync(dir);
	for (let file of list) {
		file = path.join(dir, file);
		const stat = fs.statSync(file);
		if (stat?.isDirectory()) {
			results = results.concat(getFiles(file, exts));
		} else {
			if (exts.some((ext) => file.endsWith(ext))) {
				results.push(file);
			}
		}
	}
	return results;
}

console.log('--- RALLI CODE ANALYSIS ---');
try {
	checkRealtimeCleanup();
	checkGpsAccuracy();
	console.log('\n--- EXTERNAL TOOLS ---');
	console.log('Running Biome...');
	execSync('npm run biome', { stdio: 'inherit' });
} catch (_e) {
	console.log('\n❌ Analysis finished with findings or errors.');
}
