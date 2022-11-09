const defer = require('config/defer').deferConfig;

module.exports = {
  backend_host: 'https://be55-2a00-23c6-df97-9801-d9c2-7c49-abf8-2eb6.ngrok.io',
  port: process.env.PORT || 8888,
  twitter: {
    callback_url: defer(() => `${this.backend_host}/twitter/callback`),
    client_id: process.env.TWITTER_CLIENT_KEY,
    client_secret: process.env.TWITTER_CLIENT_SECRET,
  },
  mastodon: {
    redirect_uri: defer(function () { return `${this.backend_host}/mastodon/callback`; }),
    client_name: 'OpenFollow',
    lists_key: process.env.MASTODON_LISTS_SECRET,
    client_id: process.env.MASTODON_CLIENT_SECRET,
    vapid_key: process.env.MASTODON_VAPID_KEY,
  },
  storage: {
    url: 'local://credentials/storage?mode=700'
  },
};
