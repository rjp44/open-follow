const express = require("express");
const session = require('express-session');
const cors = require("cors");
const morgan = require("morgan");
const handleErrors = require("./middleware/errors");
const twitter = require("./handlers/twitter");

const server = express();

server.set('trust proxy', 1);
server.use(session({
  secret: 'veedEX2zkPNyMs9YeBgO',
  resave: true,
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
  allowedHeaders: ['cookie'],
  credentials: true,

}));
server.get("/", (req, res) => res.json({ message: "Hello world" }));
server.get("/twitter/authUrl", twitter.authUrl);
server.get("/twitter/callback", twitter.callback);
server.get("/twitter/:list(followers|following|blocked|muted)", twitter.lists);

server.use((req, res, next) => {
  const error = new Error(`Path '${req.url}' does not exist`);
  error.status = 404;
  next(error);
});

server.use(handleErrors);

module.exports = server;
