/** ----------------------------------------------------- /
/* ------------------- Custom Server ------------------- /
/* ----------------------------------------------------- */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';

const port = parseInt(process.env.PORT, 10) || 3000;

// Create the Express-Next App
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
    /* eslint-disable no-console */
    console.log(
      `> Server listening at http://localhost:${port} as ${
        dev ? 'development' : process.env.NODE_ENV
      }`,
    );
  });
} else {
  server.listen();
}
});
