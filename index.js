import fg from 'fast-glob';
import fs from 'fs/promises';
import { convertText } from './open-cc.js';

async function main() {
    const args = process.argv.slice(2);
    const patterns = [];
    let from = 'cn';
    let to = 'tw';
    let verbose = false;

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--from') {
            if (i + 1 < args.length) {
                from = args[++i];
            } else {
                console.error('Error: --from argument expects a value');
                process.exit(1);
            }
        } else if (arg === '--to') {
            if (i + 1 < args.length) {
                to = args[++i];
            } else {
                console.error('Error: --to argument expects a value');
                process.exit(1);
            }
        } else if (arg === '--verbose') {
            verbose = true;
        } else {
            patterns.push(arg);
        }
    }

    if (patterns.length === 0) {
        console.error('Usage: openccjs [options] "<glob>" [more patterns...]');
        console.error('Options:');
        console.error('  --from <locale>  Source locale (default: "cn")');
        console.error('  --to <locale>    Target locale (default: "tw")');
        console.error('  --verbose        Show processed file paths');
        console.error('Example: openccjs --from cn --to tw "./**/*.{js,ts}"');
        process.exit(1);
    }

    const files = await fg(patterns, {
        onlyFiles: true,
        followSymbolicLinks: false
    });

    if (files.length === 0) {
        console.warn('No files matched.');
        return;
    }

    let convertedCount = 0;
    let skippedCount = 0;

    for (const file of files) {
        try {
            const content = await fs.readFile(file, 'utf8');
            const converted = convertText(content, { from, to });
            if (converted !== content) {
                await fs.writeFile(file, converted, 'utf8');
                convertedCount++;
                if (verbose) {
                    console.log(`Converted: ${file}`);
                }
            }
        } catch (err) {
            skippedCount++;
            if (verbose) {
                console.warn(`Skipped: ${file} (${err.message})`);
            }
        }
    }

    console.log(`Converted: ${convertedCount}, Skipped: ${skippedCount}`);
}

main();
