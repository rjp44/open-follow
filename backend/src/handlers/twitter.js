const TwitterApi = require('twitter-api-v2');
const { defaultConfiguration } = require('../server');
const config = require('dotenv').config();
const CALLBACK_URL = `${config.CALLBACK_URL}/twitter/callback`;

const client = new TwitterApi({ clientId: config.TWITTER_CLIENT_KEY, clientSecret: config.TWITTER_CLIENT_SECRET });

function authUrl(req, res, next) {
  client.generateOAuth2AuthLink(CALLBACK_URL, { scope: ['users.read'] })
    .then(({ url, codeVerifier, state }) => {
      req.session.twitter = { codeVerifier, state };
      res.json({ url });
    })
    .catch(next);
}

function callback(req, res) {
  // Extract state and code from query string
  const { state, code } = req.query;
  // Get the saved codeVerifier from session
  const { codeVerifier, state: sessionState } = req.session.twitter;

  if (!codeVerifier || !state || !sessionState || !code) {
    return res.status(400).send('You denied the app or your session expired!');
  }
  if (state !== sessionState) {
    return res.status(400).send('Stored tokens didnt match!');
  }

  // Obtain access token
  const client = new TwitterApi({ clientId: config.TWITTER_CLIENT_ID, clientSecret: config.TWITTER_CLIENT_SECRET });

  client.loginWithOAuth2({ code, codeVerifier, redirectUri: config.CALLBACK_URL })
    .then(async ({ client: loggedClient, accessToken, refreshToken, expiresIn }) => {
      // {loggedClient} is an authenticated client in behalf of some user
      // Store {accessToken} somewhere, it will be valid until {expiresIn} is hit.
      // If you want to refresh your token later, store {refreshToken} (it is present if 'offline.access' has been given as scope)

      // Example request
      const { data: userObject } = await loggedClient.v2.me();
      res.send(`<PRE>${JSON_stringify(userObject, null, "  ")}`);
    })
    .catch(() => res.status(403).send('Invalid verifier or access tokens!'));
};


module.exports = {
  authUrl,
  callback,
};
