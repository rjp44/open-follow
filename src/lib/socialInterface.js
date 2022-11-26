import { createContext } from 'react';
import Twitter from './twitter';
import Mastodon from './mastodon';
import Session from './session';

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
    status: { global: { current: 0, steps: 8 }, task: { current: 0, steps: 0 }, text: 'Logon to twitter' },
    errors: []
  };

  static twitterLoginDone = new Promise((resolve) => SocialInterface.twitterLoginResolve = resolve);
  static mastodonLoginDone = new Promise((resolve) => SocialInterface.mastodonLoginResolve = resolve);

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
        SocialInterface.init = true;
      }

    }
  }

  async twitterAuthenticate() {
    await this.twitter.startLogin();
  }

  async #twitterTransition(newState, oldState) {
    try {
      if (newState !== 'showtime' && oldState !== newState) {
        this.setState((draft) => {
          draft.twitter.userInfo = undefined;
          draft.status.global.current++;
        });
      }
      if (newState === 'initial' && oldState !== newState) {
        let url = await this.twitter.getUrl();
        this.setState((draft) => {
          draft.twitter.state = newState;
          draft.twitter.url = url;
        });
        if (oldState === 'showtime') {
          SocialInterface.twitterLoginDone = new Promise((resolve) => SocialInterface.twitterLoginResolve = resolve);
        }
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
        SocialInterface.twitterLoginResolve(true);

      }
    }
    catch (err) {
      
      this.setState((draft) => { draft.errors.push(err); });
    }


  }

  async mainWaitLoop() {

    let session = new Session();
    await session.initSession();
    await this.twitter.start();
    await this.mastodon.start();
    new Promise((resolve) => SocialInterface.twitterLogin = resolve);
    new Promise((resolve) => SocialInterface.mastodonLogin = resolve);
    
    this.setState((draft) => {
      draft.status = { global: { current: 0, steps: 3 }, task: { current: 0, steps: Object.entries(SocialInterface.state.globalState.lists).length }, text: 'Waiting for twitter login' };
    });
    await SocialInterface.twitterLoginDone;
    this.setState((draft) => {
      draft.status = { global: { current: 0, steps: 3 }, task: { current: 0, steps: Object.entries(SocialInterface.state.globalState.lists).length }, text: 'Waiting for mastodon login' };
    });
    await SocialInterface.mastodonLoginDone;
    while (Object.entries(SocialInterface.state.globalState.lists).reduce((ag, [, entry]) => (ag || entry.loaded !== 'done'), false)) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await SocialInterface.twitterLoginDone;
      
      for (const [name, list] of Object.entries(SocialInterface.state.globalState.lists)) {
        
        if (list.loaded !== 'not-started' && list.loaded !== 'failed') {
          continue;
        }
        try {
          let fetched = 0;
          this.setState((draft) => {
            draft.lists[name] = { loaded: 'loading', entries: [] };
            draft.status.task.current++; 
            draft.status.text = `fetching ${name} list ${fetched}/?`;
          });
          for await (const slice of this.twitter.getList(name)) {
            fetched += slice.length;
            this.setState((draft) => {
              draft.lists[name].entries.push(...slice);
              draft.status.text = `fetching ${name} list ${fetched}/?`;
            });
          }
          this.setState((draft) => { draft.lists[name].loaded = 'done'; });
        }
        catch (err) {
          this.setState((draft) => {
            draft.lists[name].loaded = 'failed';
            draft.lists[name].loadedCount = draft.lists[name].entries.length;
          });
        }
      }
    }

    this.setState((draft) => {
      draft.status = { global: { current: 1, steps: 3 }, task: { current: 0, steps: 0}, text: 'Waiting for mastodon login' };
    });

    
    this.setState((draft) => {
      draft.status = { global: { current: 1, steps: 3 }, task: { current: 0, steps: 10000 }, text: 'Getting mastodon following' };
    });
    for await (const slice of SocialInterface.mastodon.getList('following')) {
      slice.forEach(m => m.acct && !m.acct.includes('@') && (m.acct = `${m.acct}@${SocialInterface.mastodon.host}`))
      this.setState((draft) => {
        draft.mastodon.following.push(...slice);
        draft.status.task.current += slice.length;
        draft.status.text = `Getting mastodon following ${draft.status.task.current}/?`;

      });
    }
    while (!await this.xrefLists(Object.entries(SocialInterface.state.globalState.lists).reduce((c, [, list]) => (c + list?.entries?.length), 0))) {
      
    }
  }


  async #mastodonTransition(newState, oldState) {
    
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
          if (oldState === 'showtime') {
            new Promise((resolve) => SocialInterface.doneMastodonFetch = resolve);
          }
        }
      }
      else if (newState === 'showtime' && oldState !== newState) {
        let userInfo = await SocialInterface.mastodon.getUserInfo();

        let servers;
        if (!this.mastodon.servers) {
          this.mastodon.servers = servers = await SocialInterface.mastodon.getServers();
        }
        let host = this.mastodon.host;

        this.setState((draft) => {
          draft.mastodon.state = newState;
          draft.mastodon.userInfo = userInfo;
          draft.mastodon.host = host;
          draft.mastodon.following = [];
          servers && (draft.mastodon.servers = servers);
          draft.uiState = (SocialInterface.state.globalState.twitter.state !== 'showtime') ? 'twitterLogin' : 'main';
        });
        SocialInterface.mastodonLoginResolve(true);
      }
      else if (oldState !== newState) {
        this.setState((draft) => {
          draft.mastodon.state = newState;
        });
      }
    }
    catch (err) {
      
      this.setState((draft) => { draft.errors.push(err); });
    }
  }

  async xrefLists(count) {
    this.setState((draft) => {
      draft.status = { global: { current: 2, steps: 3 }, task: { current: 0, steps: count }, text: 'Searching for accounts ' };
    });
    for (const [name, list] of Object.entries(SocialInterface.state.globalState.lists)) {
      
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
        this.setState((draft) => {
          draft.status.text = `Searching for ${name} ${index}/${list.entries.length}`;
          draft.status.task.current ++;
        });
        if (index < skip) {
          continue;
        }
        let profileMatches = SocialInterface.findFedi(`${entry.name} ${entry.description} ${entry.entities}`).filter(p =>
          (SocialInterface.state.globalState.mastodon.servers.find(s => (s.toLowerCase() === p.host))));
        let searchString = profileMatches.length ? `@${profileMatches[0].user}@${profileMatches[0].host}` : `@${entry.username}`;
        let certainty = profileMatches.length ? { desc: 'found via link in twitter bio', tier: 1 } : { desc: 'match for twitter handle', tier: 3 };
        
        let matches;
        try {
          matches = await this.mastodon.searchAccount(searchString);
        }
        catch (err) {
          return false;
        }

        let accounts = (certainty.tier === 1) ? matches?.accounts : matches?.accounts?.filter(m => m.acct.replace(/@?([a-zA-Z0-9_-]+)@?.*/, '$1').toLowerCase() === entry.username.toLowerCase());
        if (profileMatches.length && !accounts?.length) {
          accounts = profileMatches.map(p => ({
            acct: `${p.user}@${p.host}`,
            name: p.user,
            url: `https://${p.host}/${p.user}}`,
            orphan: true,
            display_name: 'Unknown',
            note: 'Valid looking Mastodon URL in twitter profile, but not found on Mastodon'
          }));
          certainty = { desc: 'link in twitter handle not found', tier: 0 };

        }
        
        accounts?.length && accounts.forEach(account => {
          !account.acct.includes('@') && (account.acct = `${account.acct}@${SocialInterface.state.globalState.mastodon.host}`);
          let acct = account.acct.toLowerCase();
          if (SocialInterface.state.globalState.mastodon.following.find(f => f.acct && f.acct.toLowerCase() === acct)) {
            account.alreadyFollowing = true;
          }
          account.certainty = { ...certainty };
          if (certainty.tier === 3 && entry.name.toLowerCase() === account.display_name.toLowerCase()) {
            account.certainty = { desc: 'match for twitter handle & exact name match', tier: 2 };
          }
        });
        
        this.setState((draft) => {
          accounts?.length && (draft.lists[name].entries[index].matches = accounts);
          draft.lists[name].xrefCount = parseInt(index) + 1;
        });
      }
      this.setState((draft) => { draft.lists[name].xrefed = 'done'; });
    }
    this.setState((draft) => {
      draft.status = { global: { current: 3, steps: 3 }, task: { current: 1, steps: 1 }, text: `fetch complete ${count} ids processed` };
    });
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
    
    SocialInterface.setState((draft) => {
      draft.lists[listName].entries.forEach(entry => {
        (!contact || contact === entry.username) && entry.matches && entry.matches.forEach(match => {
          
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
    
    const target = {
      followers: 'follow',
      following: 'follow',
      blocked: 'block',
      muted: 'mute'
    };
    let list = SocialInterface.state.globalState.lists[listName];
    SocialInterface.setState((draft) => {
      draft.saving = list.entries.reduce((c, contact) => (c + (contact?.matches?.filter(m => m.selected).length || 0)), 0);
    });
    for (let contactIndex in list.entries) {
      for (let matchIndex in list.entries[contactIndex].matches) {
        let match = list.entries[contactIndex].matches[matchIndex];
        if (match.selected) {
          await SocialInterface.mastodon.add(target[listName], match.id);
          this.select({ listName, contact: list.entries[contactIndex].username, acct: match.acct, alreadyFollowing: true }, false);
          SocialInterface.setState((draft) => {
            draft.saving--;
          });
        }
      }
    }
    SocialInterface.setState((draft) => {
      draft.saving = 0;
      draft.haveSavedData = true;
    });
  }


  async logout() {
    await SocialInterface.twitter.logout();
    await SocialInterface.mastodon.logout();
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

  callback(service, { code, state }) {
    let res = false;
    service === 'twitter' && code && state && (res = this.twitter.callback({ code, state }));
    service === 'mastodon' && code && (res = this.mastodon.callback({ code }));
    return res;
  }

  setMastodonState(state) {
    this.#mastodonTransition(state, this.mastodon.state);
  }

  setTwitterState(state) {
    this.#twitterTransition(state, this.twitter.state);
  }

}

export const { state, setState, SocialContext, initialState } = SocialInterface;
