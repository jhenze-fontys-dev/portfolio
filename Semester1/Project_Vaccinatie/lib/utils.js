import fs from 'fs/promises';
import path from 'path';
import url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function renderTemplate(filePath, placeholders = {}) {
    let data = await fs.readFile(filePath, 'utf8');
    for (const key in placeholders) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        data = data.replace(regex, placeholders[key]);
    }
    return data;
}

export async function handleError(res, status, message) {
    const filePath = path.join(__dirname, '../public/error.html');

    try {
        const html = await renderTemplate(filePath, { STATUS: status, MESSAGE: message });
        res.writeHead(status, { 'Content-Type': 'text/html' });
        res.end(html);
    } catch (err) {
        console.error('Error rendering error page:', err);
        res.writeHead(status, { 'Content-Type': 'text/plain' });
        res.end(`${status} - ${message}`);
    }
}

export async function serveStatic(req, res) {
    let requestPath = decodeURIComponent(req.url);

    requestPath = requestPath.split('?')[0];

    const filePath = path.join(__dirname, '../public', requestPath);

    try {
        const data = await fs.readFile(filePath);

        const ext = path.extname(filePath).toLowerCase();
        let contentType = 'text/plain';
        switch (ext) {
            case '.html': contentType = 'text/html'; break;
            case '.css': contentType = 'text/css'; break;
            case '.js': contentType = 'application/javascript'; break;
            case '.png': contentType = 'image/png'; break;
            case '.jpg':
            case '.jpeg': contentType = 'image/jpeg'; break;
            case '.gif': contentType = 'image/gif'; break;
            case '.svg': contentType = 'image/svg+xml'; break;
        }

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
        return true;
    } catch (err) {
        return false;
    }
}
