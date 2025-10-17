import { createServer } from 'http';
const PORT = process.env.PORT;

const burgers = [
    { bsn: 1, name: 'John Doe' },
    { bsn: 2, name: 'Jane Doe' },
    { bsn: 3, name: 'Jim Doe' }
];

const zorg = [
    { zsn: 1, name: 'Jack Doe' },
    { zsn: 2, name: 'Jill Doe' },
    { zsn: 3, name: 'Ju Doe' },
    { zsn: 4, name: 'Su Doe Koe' }
];

const server = createServer((req, res) => {
    // GET all burgers
    if (req.url === '/vaccinatie/burgers' && req.method === 'GET') {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(burgers));

    // GET burger by BSN
    } else if (req.url.match(/^\/vaccinatie\/burgers\/([0-9]+)$/) && req.method === 'GET') {
        const bsn = req.url.split('/')[3];
        const burger = burgers.find(b => b.bsn === parseInt(bsn));
        if (burger) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(burger));
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('User Not Found');
        }

    // GET zorg list
    } else if (req.url === '/vaccinatie/zorg' && req.method === 'GET') {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(zorg));

    // GET zorg by ZSN
    } else if (req.url.match(/^\/vaccinatie\/zorg\/([0-9]+)$/) && req.method === 'GET') {
        const zsn = req.url.split('/')[3];
        const zorgItem = zorg.find(z => z.zsn === parseInt(zsn));
        if (zorgItem) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(zorgItem));
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('User Not Found');
        }

    // Default 404
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Route Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
