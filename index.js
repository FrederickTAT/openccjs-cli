import fg from 'fast-glob';
import fs from 'fs/promises';
import { program } from 'commander';
import { convertText } from './open-cc.js';

program
    .name('openccjs')
    .description('Convert Simplified Chinese to Traditional (or vice versa) across files matched by glob patterns')
    .showHelpAfterError()
    .addHelpText(
        'after',
        '\nExample:\n  openccjs --from cn --to tw \"./**/*.{js,ts}\"\n'
    )
    .option('--from <locale>', 'Source locale', 'cn')
    .option('--to <locale>', 'Target locale', 'tw')
    .option('--ex-dict <dict>', 'Extra dictionary: inline \"a b|c d\" or path to a JSON file')
    .option('--verbose', 'Show processed file paths', false)
    .argument('<glob...>', 'Glob patterns to match files')
    .action(async (patterns, options) => {
        const { from, to, verbose, exDict: exDictRaw } = options;

        const files = await fg(patterns, {
            onlyFiles: true,
            followSymbolicLinks: false
        });

        if (files.length === 0) {
            console.warn('No files matched.');
            return;
        }

        let exDict = exDictRaw;
        if (exDictRaw && !exDictRaw.includes('|')) {
            try {
                const jsonText = await fs.readFile(exDictRaw, 'utf8');
                exDict = JSON.parse(jsonText);
            } catch (e) {
                console.warn(`Failed to load extra dictionary: ${e.message}`);
            }
        }

        let convertedCount = 0;
        let skippedCount = 0;

        for (const file of files) {
            try {
                const content = await fs.readFile(file, 'utf8');
                const converted = convertText(content, { from, to, exDict });
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
    });

program.parseAsync(process.argv);
