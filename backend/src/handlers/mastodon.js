const config = process.env;
const uuid = require('uuid');
const OAUTH_CONFIG = { client_id: config.MASTODON_CLIENT_KEY, client_secret: config.MASTODON_CLIENT_SECRET, callback: config.CALLBACK_URL, scopes: ['follows.read', 'block.read', 'mute.read', 'users.read', 'tweet.read', 'offline.access'] };

console.log({ env: process.env, config });


waiting = {};

async function callback(req, res) {

  const authClient = new auth.OAuth2User(OAUTH_CONFIG);
  const client = new Client(authClient);

  const { state, code } = req.query;
  const { state: sessionState, codeVerifier } = req.session.mastodon || {};

  if (!state || !sessionState || !code) {
    return res.status(400).send('You denied the app or your session expired!');
  }
  if (state !== sessionState) {
    return res.status(400).send('Stored tokens didnt match!');
  }
  // This is crap, it turns out that the only method that can set the private code_challenge property
  // is generateAuthURL, so we call it here to make things work. 
  authClient.generateAuthURL({
    state,
    code_challenge_method: "plain",
    code_challenge: codeVerifier
  });

  authClient.requestAccessToken(code)
    .then(async ({ token }) => {

      req.session.mastodon.token = token;
      req.session.mastodon.state = 'online';

      // Example request
      const myUser = await client.users.findMyUser();
      req.session.mastodon = {
        ...req.session.mastodon,
        token,
        state: 'online',
        id: myUser.data.id
      };
      waiting[codeVerifier] && waiting[codeVerifier].forEach(resolver => resolver(req.session.mastodon));
      waiting[codeVerifier] = undefined;
      res.send('<script>window.close();</script>');
      //res.json(followers.data);
    })
    .catch((error) => {
      console.log(error);
      res.status(403).send(`Invalid verifier or access tokens!\n${error}`);
    });
};


async function lists(req, res) {

  let items;

  try {

    let { state, codeVerifier, token, id } = req.session.mastodon;
    const { list } = req.params;

    console.log(req.session);  
    if (state === 'initial')
      ({ state, codeVerifier, token, id } = await new Promise((resolve, reject) => {
        waiting[codeVerifier] = [...(waiting[codeVerifier] || []), resolve];
        console.log('pushed', waiting);
        setTimeout(() => {
          resolve("foo");
        }, 30000);
      }));

    console.log('have auth', { state, codeVerifier, token, id });
    req.session.mastodon = { state, codeVerifier, token, id };


    const authClient = new auth.OAuth2Bearer(token.access_token );
    const client = new Client(authClient);
    const listMap = {
      followers: client.users.usersIdFollowers,
      following: client.users.usersIdFollowing,
      blocked: client.users.usersIdBlocking,
      muted: client.users.usersIdMuting,
    };
    let listOperation = listMap[list];

    console.log({ list });
    if (!listOperation) {
      res.status(400).send(`no handler for ${list}`);
      return;
    }

    
    items = listOperation(id, { max_results: 1000 }, { max_results: 1000 });
    res.type('txt');
    for await (const page of items) {
      console.log({ page });
      res.write(JSON.stringify(page));
    }
    res.end();
  }
  catch (err) {
    console.log('lists', err);
    if (err.status == 429) {
      res.write('], truncated: true}');
      res.end();
    }
    else {
      return res.status(400).json(err);
    }
  }

};


module.exports = {
  authUrl,
  callback,
  lists,
};
