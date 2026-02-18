import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT, 10) || 3000;

const app = next({ dev });
const handle = app.getRequestHandler();

app
    .prepare()
    .then(() => {
        const server = createServer((req, res) => {
            const parsedUrl = parse(req.url, true);
            handle(req, res, parsedUrl);
        });

        if (dev) {
            server.listen(port, (err) => {
                if (err) throw err;
                console.log(
                    `> Server listening at http://localhost:${port} as ${dev ? 'development' : process.env.NODE_ENV
                    }`,
                );
            });
        } else {
            server.listen(port, () => {
                console.log(`> Server listening on port ${port}`);
            });
        }
    })
    .catch((err) => {
        console.error('Error starting server:', err);
        process.exit(1);
    });