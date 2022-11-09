const config = require('config');
const axios = require('axios');
const uuid = require('uuid');
const BlobStorage = require('../lib/blobstorage');

const OAUTH_CONFIG = { client_id: config.MASTODON_CLIENT_KEY, client_secret: config.MASTODON_CLIENT_SECRET, callback: config.REDIRECT_URI, scopes: ['follows.read', 'block.read', 'mute.read', 'users.read', 'tweet.read', 'offline.access'] };

console.log({ env: process.env, config });

const storage = new BlobStorage();

let waiting = {};

let serverList = [];

async function authUrl(req, res) {
  let { server } = req.query;
  let blob = await storage.fetch(server);
  let credentials = undefined;
  const client_name = config.get("mastodon.client_name");
  const redirect_uri = encodeURIComponent(config.get("mastodon.redirect_uri"));
  const scopes = encodeURIComponent("read follow");
  let url;
  console.log('authUrl called with...', req.session.mastodon);
  if (!server || !server.length) {
    res.status(400).send('No server');
    return;
  }
  if (req.session.mastodon && req.session.mastodon.url && req.session.mastodon?.host === server) {
    url = req.session.mastodon.url;
    res.json({ url });
    return;
  }

  if (blob) {
    try {
      credentials = JSON.parse(blob);
      console.log('using old credentials', { credentials });
    }
    catch (err) {
      credentials = undefined;
    }
  }
  if (!credentials) {
    try {
      let request = `https://${server}/api/v1/apps?client_name=${client_name}&redirect_uris=${redirect_uri}&scopes=${scopes}`;
      console.log('getting credentials', { request });
      let data = await axios.post(request);
      let credentials = data.data;
      console.log('got new credentials', { data, credentials });
      await storage.save(server, JSON.stringify(credentials));
    }
    catch (err) {
      console.log(err);
      res.status(400).send('Server doesnt support credentials');
      return;
    }
  }

  url = `https://${server}//oauth/authorize?response_type=code&scope=${scopes}&client_id=${encodeURIComponent(credentials.client_id)}&redirect_uri=${redirect_uri}`;
  
  req.session.regenerate(() => {
    req.session.mastodon = {
      uid: uuid.v4(),
      client_id: credentials.client_id,
      client_secret: credentials.client_secret,
      state: 'initial',
      url,
      host: server
    };
    res.json({ url });
  });

  
}


async function servers(req, res) {

  const secret = config.get('mastodon.lists_key');

  if (!serverList.length) {
    let blob = await storage.fetch('serverList');
    blob && (serverList = JSON.parse(blob));
    setTimeout(() => (storage.remove('serverList')), 86400 * 1000);
  }
  if (!serverList.length) {
    try {
      let instances = await axios.get('https://instances.social/api/1.0/instances/list?count=0&sort_by=active_users&sort_order=desc',
        {
          headers: { "Authorization": `Bearer ${secret}` }
        }
      );

      serverList = instances.data.instances.map(instance => instance.name);
      console.log('Saving', 'serverList', JSON.stringify(serverList));
      await storage.save('serverList', JSON.stringify(serverList));
      setTimeout(() => (serverList = []), 86400 * 1000);
    }
    catch (err) {
      console.log('server list', err);
      res.status(500).json(err);
      return;
    }
  }
  console.log({ serverList });
  res.json(serverList);

}



async function callback(req, res) {
  const redirect_uri = config.get("mastodon.redirect_uri");
  const scopes = "read follow";

  const { state, url, host, client_id, client_secret, uid } = req.session.mastodon || {};

  const { code } = req.query;

  if (!code) {
    return res.status(400).send('You denied the app or your session expired!');
  }

  if (!state || !state === 'initial' || !host) {
    return res.status(400).send('Bad session cookie!');
  }

  try {

    let { data: token } = await axios.post(`https://${host}/oauth/token`, {
      code, client_id, client_secret, redirect_uri, grant_type: 'authorization_code', scope:scopes });

    console.log('got token', { token })
    
    req.session.mastodon = {
      ...req.session.mastodon, token, state: 'showtime'
    };
    waiting[uid] && waiting[uid].forEach(resolver => resolver(req.session.mastodon));
    waiting[uid] = undefined;
    res.send('<script>window.close();</script>');
    //res.json(followers.data);
  }

  catch (error) {
    console.log(error);
    res.status(403).send(`Invalid verifier or access tokens!\n${error}`);
  };
}

async function token(req, res) {
  let { state, token, uid } = req.session.mastodon || {};
  
  if (uid && !token) {
    (req.session.mastodon = await new Promise((resolve, reject) => {
      waiting[uid] = [...(waiting[uid] || []), resolve];

      setTimeout(() => {
        resolve("foo");
      }, 30000);
    }));
  }
  ({ token } = req.session.mastodon || {});
  if (token)
    res.json(token);
  else
    res.status(400).send('not authenticated');
}

async function passthru(req, res) {
  let { state, token, uid, host, body } = req.session.mastodon || {};
  let { baseUrl, originalUrl, method, protocol } = req;
  let url = originalUrl.slice(baseUrl.length);
  console.log('PASSTHRU', { baseUrl, originalUrl, method, protocol, url, body });
  if (!token) {
    res.status(403).send('not authenticated');
    return;
  }
  let result = await axios({
    method, url: `${protocol}://${host}${url}`, body, 
      headers: { "Authorization": `${token.token_type} ${token.access_token}` }
  });
  res.status(result.status).json(result.data);
}

async function logout(req, res){


  const { state, host, client_id, client_secret, uid, token } = req.session.mastodon || {};

  if (!state || !state === 'showtime' || !host || !client_id || !client_secret || !token) {
    console.log('bad session cookie', { state, host, client_id, client_secret, uid, token });
    return res.status(400).send('Bad session cookie!');
  }

  try {

    let { data } = await axios.post(`https://${host}/oauth/revoke`, {
      client_id, client_secret, token
    });

    console.log('got data', { data });

    req.session.mastodon = { state: 'initial' };
    
    res.json(true);

  }

  catch (error) {
    console.log(error);
    res.status(403).send(`Invalid verifier or access tokens!\n${error}`);
  };
  
}



module.exports = {
  authUrl,
  servers,
  callback,
  token,
  logout,
  passthru,

};
