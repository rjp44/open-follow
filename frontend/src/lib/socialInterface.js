import { createContext } from 'react';
import Twitter from './twitter';
import Mastodon from './mastodon';



export default class SocialInterface {

  static init = false;

  static SocialContext = createContext({});

  static initialState = {
    mastodon: {},
    twitter: {},
    lists: Object.fromEntries(['followers', 'following', 'blocked', 'muted'].map(entry => ([entry, {
      entries: [],
      loaded: 'not-started',
      xrefed: 'not-started',
      xrefCount: 0,
    }]))),
    uiState: 'twitterLogin',
    status: { global: 0, task: 0, text: 'Logon to twitter to proceed' },
    errors: []
  };

  static state = {};

  constructor(globalState, globalImmer) {

    if (!globalState || !globalImmer) {
      Object.assign(this, { ...SocialInterface.state.globalState, ...Object.fromEntries(Object.entries(SocialInterface)) });
      return;
    }
    else {
      SocialInterface.setState = globalImmer;
      SocialInterface.state = { globalState };
      Object.assign(this, { ...SocialInterface.state.globalState, ...Object.fromEntries(Object.entries(SocialInterface)) });
      if (!SocialInterface.init) {
        SocialInterface.twitter = new Twitter({ onStateChange: (...args) => this.#twitterTransition(...args) });
        SocialInterface.mastodon = new Mastodon({ onStateChange: (...args) => this.#mastodonTransition(...args) });
        Object.assign(this, { ...Object.fromEntries(Object.entries(SocialInterface)) });
        // important to chain these otherwise the backed creates two different session cookies and things go horribly wrong
        this.twitter.start().then(
          () => this.mastodon.start()
        );
        SocialInterface.init = true;
      }
    }
  }

  async twitterLogout() {
    return this.twitter.logout();
  }
  async twitterAuthenticate() {
    await this.twitter.startLogin();
  }

  async #twitterTransition(newState, oldState) {
    try {
      if (newState !== 'showtime' && oldState !== newState) {
        this.setState((draft) => {
          draft.twitter.userInfo = undefined;
        });
      }
      if (newState === 'initial' && oldState !== newState) {
        let url = await this.twitter.getUrl();
        this.setState((draft) => {
          draft.twitter.state = newState;
          draft.twitter.url = url;
        });
      }
      if (newState === 'authenticating' && oldState !== newState) {
        this.setState((draft) => {
          draft.twitter.state = newState;
        });
      }
      if (newState === 'showtime' && oldState !== newState) {
        let userInfo = await this.twitter.getUserInfo();
        this.setState((draft) => {
          draft.twitter.state = newState;
          draft.twitter.userInfo = userInfo;
          draft.uiState = (SocialInterface.state.globalState.mastodon.state !== 'showtime') ? 'mastodonLogin' : 'main';
        });


        for (const [name, list] of Object.entries(SocialInterface.state.globalState.lists)) {
          console.log('processing', { name, list });
          if (list.loaded !== 'not-started') {
            break;
          }
          try {
            this.setState((draft) => { draft.lists[name] = { loaded: 'loading', entries: [] }; });
            for await (const slice of this.twitter.getList(name)) {
              console.log('got slice', { length: slice.length });
              this.setState((draft) => { draft.lists[name].entries.push(...slice); });
            }

            this.setState((draft) => { draft.lists[name].loaded = 'done'; });
          }
          catch (err) {
            this.setState((draft) => {
              draft.lists[name].loaded = 'not-started';
            });
          }
        }
      }


    }
    catch (err) {
      console.log(err);
      this.setState((draft) => { draft.errors.push(err); });
    }


  }

  async #mastodonTransition(newState, oldState) {
    console.log('mastodon transition', { newState, oldState });
    try {
      if (newState !== 'showtime' && oldState !== newState) {
        this.setState((draft) => {
          draft.mastodon.userInfo = undefined;
          draft.uiState = (SocialInterface.state.globalState.twitter.state !== 'showtime') ? 'twitterLogin' : 'mastodonLogin';
        });
      }
      if (newState === 'initial' && oldState !== newState) {
        if (!this.mastodon.servers) {
          let servers = await SocialInterface.mastodon.getServers();
          this.setState((draft) => {
            draft.mastodon.state = newState;
            draft.mastodon.servers = servers;
          });
        }
      }
      else if (newState === 'showtime' && oldState !== newState) {
        let userInfo = await SocialInterface.mastodon.getUserInfo();

        this.setState((draft) => {
          draft.mastodon.state = newState;
          draft.mastodon.userInfo = userInfo;
          draft.mastodon.following = [];
          draft.uiState = (SocialInterface.state.globalState.twitter.state !== 'showtime') ? 'twitterLogin' : 'main';
        });
        for await (const slice of SocialInterface.mastodon.getList('following')) {
          console.log('following', { slice });
          this.setState((draft) => {
            draft.mastodon.following.push(...slice);
          });
        }
        while (!await this.xrefLists()) {
          console.log('looping xref');
        }
      }
      else if (oldState !== newState) {
        this.setState((draft) => {
          draft.mastodon.state = newState;
        });
      }
    }
    catch (err) {
      console.log(err);
      this.setState((draft) => { draft.errors.push(err); });
    }
  }

  async xrefLists() {
    for (const [name, list] of Object.entries(SocialInterface.state.globalState.lists)) {
      console.log('processing', { name, list });
      let skip = 0;
      if (list.xrefed && list.xrefed !== 'not-started') {
        if (list.xrefed && list.xrefed === 'failed') {
          skip = list.xrefCount - 1;
        }
        else {
          break;
        }
      }
      this.setState((draft) => { draft.lists[name].xrefed = 'progress'; });
      for (let [index, entry] of Object.entries(list.entries)) {
        if (SocialInterface.mastodon.state !== 'showtime') {
          this.setState((draft) => { draft.lists[name].xrefed = 'failed'; });
          break;
        }
        if (index < skip) {
          continue;
        }
        let profileMatches = SocialInterface.findFedi(`${entry.name} ${entry.description}`).filter(p =>
          (SocialInterface.state.globalState.mastodon.servers.find(s => (s.toLowerCase() === p.host))));
        let searchString = profileMatches.length ? `@${profileMatches[0].user}@${profileMatches[0].host}` : `@${entry.username}@`;
        let certainty = profileMatches.length ? { desc: 'found via link in twitter bio', tier: 1 } : { desc: 'match for twitter handle', tier: 3 };
        console.log('finding', entry.name, { profileMatches, searchString, certainty });
        let matches;
        try {
          matches = await this.mastodon.search(searchString, 'accounts');
        }
        catch (err) {
          return false;
        }

        let accounts = (certainty.tier === 1) ? matches?.accounts : matches?.accounts?.filter(m => m.acct.replace(/@?([a-zA-Z0-9_-]+)@?.*/, '$1').toLowerCase() === entry.username.toLowerCase());
        if (profileMatches.length && !accounts?.length) {
          accounts = profileMatches.map(p => ({ acct: `@${p.user}@${p.host}`, orphan: true, display_name: 'Unknown', note: 'Valid looking Mastodon URL in twitter profile, but not found on Mastodon' }));
        }
        console.log('match', { entry, accounts });
        accounts?.length && accounts.forEach(account => {
          !account.acct.includes('@') && (account.acct = `${account.acct}@${SocialInterface.state.globalState.mastodon.host}`);
          if (SocialInterface.state.globalState.mastodon.following.find(f => f.id === account.id)) {
            account.alreadyFollowing = true;
          }
          account.certainty = { ...certainty };
          if (certainty.tier === 3 && entry.name.toLowerCase() === account.display_name.toLowerCase()) {
            account.certainty = { desc: 'match for twitter handle & exact name match', tier: 2 };
          }
        });
        console.log('index', { index });
        this.setState((draft) => {
          accounts?.length && (draft.lists[name].entries[index].matches = accounts);
          draft.lists[name].xrefCount = parseInt(index) + 1;
        });
      }
      this.setState((draft) => { draft.lists[name].xrefed = 'done'; });
    }
    return true;
  }


  static findFedi(str) {
    return [...(str.matchAll(/@?([a-zA-Z0-9_]+)@([a-zA-Z0-9_\-.]+)/g) || []),
    ...([...str.matchAll(/([a-zA-Z0-9_\-.]+)\/@([a-zA-Z0-9_]+)/g)] || []).map(r => {
      let temp = r[1];
      r[1] = r[2];
      r[2] = temp;
      return r;
    })].map(([match, user, host]) => ({ match, user, host: host.toLowerCase() }));

  }


  select({ listName, contact, acct, alreadyFollowing }, state) {
    console.log('selectAll', { listName, contact, acct, state });
    SocialInterface.setState((draft) => {
      draft.lists[listName].entries.forEach(entry => {
        (!contact || contact === entry.username) && entry.matches && entry.matches.forEach(match => {
          console.log(`setting`, { match, state });
          if (!acct || acct === match.acct) {
            if (state instanceof Function) {
              state(match) && (match.selected = true);
            }
            else {
              match.selected = state;
              (alreadyFollowing !== undefined) && (match.alreadyFollowing = alreadyFollowing);
            }
          }
        });
      });
    });
  }

  async saveList(listName) {
    console.log('saveList', { listName });
    const target = {
      followers: 'follow',
      following: 'follow',
      bloked: 'block',
      muted: 'mute'
    };
    let list = SocialInterface.state.globalState.lists[listName];
    for (let contactIndex in list.entries) {
      for (let matchIndex in list.entries[contactIndex].matches) {
        let match = list.entries[contactIndex].matches[matchIndex];
        if (match.selected) {
          let result = await SocialInterface.mastodon.add(target[listName], match.id);
          console.log({ result });
          this.select({ listName, contact: list.entries[contactIndex].username, acct: match.acct, alreadyFollowing: true }, false);
        }
      }
    }
  }

  async mastodonLogout() {
    return this.mastodon.logout();
  }
  async mastodonAuthenticate() {
    await this.mastodon.startLogin();
  }


  async setMastodonHost(host) {
    if (host !== this.mastodon.host) {
      let url = await this.mastodon.getUrl(host);
      this.setState((draft) => {
        draft.mastodon.host = host;
        draft.mastodon.url = url;
      });

    }
  }

  setMastodonState(state) {
    this.#mastodonTransition(state, this.mastodon.state);
  }

  setTwitterState(state) {
    this.#twitterTransition(state, this.twitter.state);
  }

}

export const { state, setState, SocialContext, initialState } = SocialInterface;
