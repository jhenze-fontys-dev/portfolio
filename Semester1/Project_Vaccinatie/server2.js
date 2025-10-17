import http from 'http';
import fs from 'fs/promises';
import url from 'url';
import path from 'path';
import querystring from 'querystring';
import { json } from 'stream/consumers';

const PORT = process.env.PORT;

const burgers = [
    { name: 'John Doe', email: 'johndoe@burger.com', bsn: '123' },
    { name: 'Jane Doe', email: 'janedoe@burger.com', bsn: '234' },
    { name: 'Jim Doe', email: 'jimdoe@burger.com', bsn: '345' }
];

const zorg = [
    { name: 'Jack Doe', email: 'jackdoe@zorg.com', zsn: '123' },
    { name: 'Jill Doe' , email: 'jilldoe@zorg.com', zsn: '234' },
    { name: 'Ju Doe' , email: 'judoe@zorg.com', zsn: '345' },
    { name: 'Su Doe Koe' , email: 'sudoekoe@zorg.com', zsn: '456' }
];

// Get current path
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = http.createServer(async (req, res) => {
    try {
        // Handle GET
        if (req.method === 'GET') {
            let filePath;
            if (req.url === '/vaccinatie/') {
                filePath = path.join(__dirname, 'public', 'index.html');
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
                return;
            }

            const data = await fs.readFile(filePath);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);

        // Handle POST /login
        } else if (req.method === 'POST' && req.url === '/login') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', async () => {
                const parsed = querystring.parse(body);
                const email = parsed.email;
                const password = parsed.password;

                let user, filePath;

                user = burgers.find(b => b.email == email);
                if (user) {
                    filePath = path.join(__dirname, 'public', 'burger.html');
                } else if (email === 'zorg') {
                    filePath = path.join(__dirname, 'public', 'zorg.html');
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.end(`Hello ${email}, but I don’t know you.`);
                    return;
                }

                try {
                    let data = await fs.readFile(filePath, 'utf8');

                    data = data.replace('{{BSN}}', user.bsn).replace('{{NAME}}', user.name);

                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(data);
                } catch (err) {
                    console.error('File read error:', err);
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Error loading page');
                }
            });

        } else {
            res.writeHead(405, { 'Content-Type': 'text/plain' });
            res.end('Method Not Allowed');
        }

    } catch (error) {
        console.error('Server error:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server Error');
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
