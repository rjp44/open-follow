const config = require('config');
const axios = require('axios');
const uuid = require('uuid');
const BlobStorage = require('../lib/blobstorage');


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
      credentials = data.data;
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


  req.session.mastodon = {
    uid: uuid.v4(),
    client_id: credentials.client_id,
    client_secret: credentials.client_secret,
    state: 'initial',
    url,
    host: server
  };
  res.json({ url });


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
      await storage.save('serverList', JSON.stringify(serverList));
      setTimeout(() => (serverList = []), 86400 * 1000);
    }
    catch (err) {
      console.log('server list', err);
      res.status(500).json(err);
      return;
    }
  }
  res.json(serverList);

}



async function callback(req, res) {
  console.log(req.originalUrl, req.session.mastodon);
  const redirect_uri = config.get("mastodon.redirect_uri");
  const scopes = "read follow";

  const { state, url, host, client_id, client_secret, uid } = req.session.mastodon || {};

  const { code } = req.query;

  if (!code) {
    return res.status(400).send('You denied the app or your session expired!');
  }

  if (!state || !state === 'initial' || !host) {
    return res.status(400).send({ msg: 'Bad session cookie!', state, host, session: req.session.mastodon });
  }

  try {
    res.status(200);
    let { data: token } = await axios.post(`https://${host}/oauth/token`, {
      code, client_id, client_secret, redirect_uri, grant_type: 'authorization_code', scope: scopes
    });

    console.log('got token', { token });

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
    res.send(`Invalid verifier or access tokens!\n${error}\nclose this window and retry`);
  };
}

async function checkStatus(req, res) {
  let { state, token, host, uid } = req.session.mastodon || {};
  if (state !== 'showtime') {
    res.json({ state });
  }
  else {
    try {
      if (token && host) {
        let { data } = await axios.get({
          url: `https://${host}/api/v1/accounts/verify_credentials`, body,
          headers: { "Authorization": `${token.token_type} ${token.access_token}` }
        });
        res.json({ state, user: data });
      }
      else {
        throw new Error('no valid state');
      }

    }
    catch (err) {
      state = 'initial';
      req.session.twitter = { state };
      res.json(state);
    }
  }


}

async function checkLogin(req, res) {
  let { state, token, uid } = req.session.mastodon || {};
  try {
    if (uid && !token) {
      (req.session.mastodon = await new Promise((resolve, reject) => {
        waiting[uid] = [...(waiting[uid] || []), resolve];

        setTimeout(() => {
          reject();
        }, 60000);
      }));
    }
    ({ state, token } = req.session.mastodon || {});
    if (token)
      res.json({ state });
    else
      res.status(400).send('not authenticated');
  }
  catch (err) {
    console.log(req.originalUrl, err);
    res.status(500).send('request timeout');
  }
}

async function passthru(req, res) {
  let { state, token, uid, host } = req.session.mastodon || {};
  let { baseUrl, originalUrl, method, protocol, body } = req;
  let url = originalUrl.slice(baseUrl.length);

try{
    if (!token || state != 'showtime')
      throw new Error(`bad auth ${state} ${token && token.length} ${uid}, ${host}`);

    let api = axios.create(
      {
        headers: { "Authorization": `${token.token_type} ${token.access_token}` }
      }
    );
    api.interceptors.response.use(async (res) => {
      let [remaining, resetTime] = [parseInt(res.headers['x-ratelimit-remaining']), res.headers['x-ratelimit-reset']];
      if (remaining && resetTime) {
        let timeUntil = (new Date(resetTime)).valueOf() - (new Date()).valueOf();
        let delay = timeUntil / remaining;
        console.log('ratelimit', { remaining, timeUntil, delay });
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      return res;
    });

    let result = await api({
      method, url: `${protocol}://${host}${url}`, body,
      headers: { "Authorization": `${token.token_type} ${token.access_token}` }
    });
  result.headers.link && res.set(result.headers);

  res.status(result.status).json(result.data);

  }
  catch (err) {
    console.log(err);
    res.status(403).send(err);
  }

}

async function logout(req, res) {


  const { state, host, client_id, client_secret, uid, token } = req.session.mastodon || {};

  if (!state || !state === 'showtime' || !host || !client_id || !client_secret || !token) {
    console.log('bad session cookie', { state, host, client_id, client_secret, uid, token });
    return res.status(400).send('Bad session cookie!');
    return;
  }

  try {
    axios.post(`https://${host}/oauth/revoke`, {
      client_id, client_secret, token
    });

    req.session.mastodon = { state: 'initial' };
    res.json(true);
  }
  catch (error) {
    console.log(error);
  };

}



module.exports = {
  authUrl,
  servers,
  callback,
  checkLogin,
  checkStatus,
  logout,
  passthru,

};
