
const express = require("express");
const session = require('express-session');
const cors = require("cors");
const morgan = require("morgan");
const handleErrors = require("./middleware/errors");
const twitter = require("./handlers/twitter");
const mastodon = require("./handlers/mastodon");

const server = express();

server.set('trust proxy', 1);
server.use(session({
  secret: 'veedEX2zkPNyMs9YeBgO',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true,
    sameSite: 'none',
    httpOnly: false,
  }
}));
server.use(express.json());
server.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);
server.use(cors({
  origin: ['http://localhost:3000', 'https://twitter.com', 'https://openfollow.openshare.me'],
  allowedHeaders: ['Cookie', 'Link'],
  exposedHeaders: ['Link'],
  credentials: true,

}));
server.get("/", (req, res) => res.json({ message: "Hello world" }));
server.get("/twitter/authUrl", twitter.authUrl);
server.get("/twitter/callback", twitter.callback);
server.get("/twitter/:list(followers|following|blocked|muted|users)", twitter.lists);
server.get(["/twitter/checkLogin", "/twitter/userInfo"], twitter.checkLogin);
server.get("/twitter/checkStatus", twitter.checkStatus);
server.get("/twitter/logout", twitter.logout);

server.get("/mastodon/authUrl", mastodon.authUrl);
server.get("/mastodon/servers", mastodon.servers);
server.get("/mastodon/callback", mastodon.callback);
server.get("/mastodon/checkLogin", mastodon.checkLogin);
server.get("/mastodon/checkStatus", mastodon.checkStatus);
server.get("/mastodon/logout", mastodon.logout);
server.use("/mastodon/passthru", mastodon.passthru);

server.use((req, res, next) => {
  const error = new Error(`Path '${req.url}' does not exist`);
  error.status = 404;
  next(error);
});

server.use(handleErrors);

module.exports = server;
