import path from 'path';
import url from 'url';
import fs from 'fs/promises';
import querystring from 'querystring';
import { burgers, zorg, appointments } from '../data/index.js';
import { renderTemplate, handleError } from './utils.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GET handler
export async function handleGet(req, res) {
    let filePath;
    if (req.url === '/vaccinatie/') {
        filePath = path.join(__dirname, '../public/index.html');
    } else if (req.url.startsWith('/zorg.html')) {
        filePath = path.join(__dirname, '../public/zorg.html');
    } else if (req.url.startsWith('/burger.html')) {
        filePath = path.join(__dirname, '../public/burger.html');
    } else if (req.url.startsWith('/readme.html')) {
        filePath = path.join(__dirname, '../public/documentation.html');
    } else {
        return handleError(res, 404, 'Not Found');
    }

    try {
        const data = await fs.readFile(filePath);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
    } catch (err) {
        console.error('File read error:', err);
        handleError(res, 500, 'Error loading page');
    }
}

// Burger API
export async function handleBurgerApi(req, res) {
    try {
        const urlData = new URL(req.url, `http://${req.headers.host}`);
        const email = urlData.searchParams.get('email');
        const user = burgers.find(b => b.email === email);

        if (!user) return handleError(res, 404, 'Burger not found');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ name: user.name, bsn: user.bsn }));
    } catch (err) {
        console.error('Burger API error:', err);
        handleError(res, 500, 'Error retrieving burger data');
    }
}

// Zorg API
export async function handleZorgApi(req, res) {
    try {
        const urlData = new URL(req.url, `http://${req.headers.host}`);
        const email = urlData.searchParams.get('email');
        const user = zorg.find(z => z.email === email);

        if (!user) return handleError(res, 404, 'Nurse not found');

        const userAppointments = appointments
            .filter(appointment => appointment.zsn === user.zsn)
            .map(appointment => {
                const patient = burgers.find(b => b.bsn === appointment.bsn);
                return {
                    ...appointment,
                    patient: patient
                        ? { name: patient.name, email: patient.email }
                        : { name: 'Unknown', email: 'Unknown' }
                };
            });

        const data = {
            name: user.name,
            zsn: user.zsn,
            appointments: userAppointments
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));

    } catch (err) {
        console.error('Zorg API error:', err);
        handleError(res, 500, 'Error retrieving data');
    }
}

// Login POST
export function handlePostLogin(req, res) {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });

    req.on('end', async () => {
        const parsed = querystring.parse(body);
        const email = parsed.email;

        let user = null;

        // Zorg login
        if (email.endsWith('@zorg.com')) {
            user = zorg.find(z => z.email === email);
            if (user) {
                res.writeHead(302, { Location: `/zorg.html?email=${encodeURIComponent(user.email)}` });
                res.end();
                return;
            }
        }

        // Burger login
        if (!user) {
            user = burgers.find(b => b.email === email);
            if (user) {
                res.writeHead(302, { Location: `/burger.html?email=${encodeURIComponent(user.email)}` });
                res.end();
                return;
            }
        }

        handleError(res, 200, `Hello ${email}, but I don't know you`);
    });
}
