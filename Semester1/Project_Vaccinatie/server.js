import http from 'http';
import { handleGet, handlePostLogin, handleZorgApi } from './lib/handlers.js';
import { serveStatic } from './lib/utils.js';

const PORT = process.env.PORT;

const server = http.createServer(async (req, res) => {
    try {
        // Serve static files first
        const served = await serveStatic(req, res);
        if (served) return;

        // API route for nurse data
        if (req.method === 'GET' && req.url.startsWith('/api/zorg')) {
            return handleZorgApi(req, res);
        }

        // API route for burger data
        if (req.method === 'GET' && req.url.startsWith('/api/burger')) {
            return handleBurgerApi(req, res);
        }

        // Regular GET requests (pages)
        if (req.method === 'GET') {
            return handleGet(req, res);
        }

        // Login POST
        if (req.method === 'POST' && req.url === '/login') {
            return handlePostLogin(req, res);
        }

        // Fallback for unsupported methods
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Method Not Allowed');

    } catch (error) {
        console.error('Server error:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server Error');
    }
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
