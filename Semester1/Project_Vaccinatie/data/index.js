import fs from 'fs';
import path from 'path';
import url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load JSON files
const burgers = JSON.parse(fs.readFileSync(path.join(__dirname, 'burgers.json'), 'utf-8'));
const zorg = JSON.parse(fs.readFileSync(path.join(__dirname, 'zorg.json'), 'utf-8'));
const appointments = JSON.parse(fs.readFileSync(path.join(__dirname, 'appointments.json'), 'utf-8'));

export { burgers, zorg, appointments };
