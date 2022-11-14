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
      xrefed: 'not-started'
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
          )
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
          this.setState((draft) => { draft.lists[name] = { loaded: 'loading', entries: [] }; });
          for await (const slice of this.twitter.getList(name)) {
            console.log('got slice', {  length: slice.length });
            this.setState((draft) => { draft.lists[name].entries.push(...slice); });
          }
          
          this.setState((draft) => { draft.lists[name].loaded = 'done'; });

        }
      }
    }
    catch (err) {
      console.log(err);
      this.setState((draft) => { draft.errors.push(err); });
    }


  }

  async #mastodonTransition(newState, oldState) {
    console.log('mastodon transition', { newState, oldState })
    try {
      if (newState !== 'showtime' && oldState !== newState) {
        this.setState((draft) => {
          draft.mastodon.userInfo = undefined;
        });
      }
      if (newState === 'initial' && oldState !== newState) {
        if (!this.mastodon.servers) {
          let servers = await this.mastodon.getServers();
          this.setState((draft) => {
            draft.mastodon.state = newState;
            draft.mastodon.servers = servers;
          });
        }
      }
      else if (newState === 'showtime' && oldState !== newState) {
        let userInfo = await this.mastodon.getUserInfo();
        this.setState((draft) => {
          draft.mastodon.state = newState;
          draft.mastodon.userInfo = userInfo;
          draft.uiState = (SocialInterface.state.globalState.twitter.state !== 'showtime') ? 'twitterLogin' : 'main';
        });
        this.xrefLists();
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
      /*
      if (list.xrefed !== 'not-started') {
        break;
      }
      */
      this.setState((draft) => { draft.lists[name].xrefed = 'progress'; });
      for (let [index, entry] of Object.entries(list.entries)) {
  
        let matches = await this.mastodon.search(`@${entry.username}@`, 'accounts')
        let accounts = matches?.accounts?.filter(m => m.acct.replace(/@.*/, '').toLowerCase() === entry.username.toLowerCase())
        console.log('match', { entry, accounts });
        if (accounts?.length) {

          this.setState((draft) => {
            draft.lists[name].entries[index].matches = accounts;
            draft.lists[name].entries[index].strongMatches = accounts.filter(m => m.displayname === entry.name);
          });
        }
      }
      this.setState((draft) => { draft.lists[name].xrefed = 'done'; });
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
