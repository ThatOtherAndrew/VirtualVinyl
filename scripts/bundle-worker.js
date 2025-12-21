import fs from 'node:fs';
import path from 'node:path';

const input = path.resolve('src/lib/vinyl-processor.js');
const output = path.resolve('src/lib/vinyl-processor-string.ts');

const code = fs.readFileSync(input, 'utf-8');
const content = `const code = ${JSON.stringify(code)};\nexport default code;`;

fs.writeFileSync(output, content);

