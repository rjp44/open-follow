import { createContext } from 'react';
import Twitter from './twitter';
import Mastodon from './mastodon';



let mastodon, twitter;


export default class SocialInterface {

  static init = false;

  static SocialContext = createContext({});

  static initialState = {
    mastodon: {},
    twitter: {},
    lists: {},
    errors: []
  };

  static state = {};

  constructor(globalState, globalImmer) {
    Object.assign(this, { ...SocialInterface.state, setState: SocialInterface.setState });
    if (!globalState || !globalImmer) {
      return;
    }
    if (SocialInterface.init) {
      this.setState = SocialInterface.setState = globalImmer;
      SocialInterface.init = true;
      this.setState((draft) => SocialInterface.initialState);
      this.setState((draft) => {
        draft.lists = ['followers', 'following', 'blocked', 'muted'].map(entry => ({
          entries: [],
          loaded: 'not-started'
        }));
      });
      SocialInterface.state = globalState;
      Object.assign(this, { ...SocialInterface.state, setState: SocialInterface.setState });
      twitter = new Twitter(this.twitterTransition);
      mastodon = new Mastodon(this.mastodonTransition);
    }

  }

  async #twitterTransition(newState, oldState) {
    this.setState((draft) => { draft.twitter.state = newState; })
    try {
      if (newState === 'initial' && oldState !== newState) {
        await twitter.startLogin();
      }
      if (newState === 'authenticating' && oldState !== newState) {
        let url = await twitter.getUrl(this.mastodon.host);
        this.setState((draft) => { draft.twitter.url = url; });
      }
      if (newState === 'showtime' && oldState !== newState) {
        let userInfo = await twitter.getUserInfo();
        this.setState((draft) => { draft.twitter.userInfo = userInfo; });
        for (const [name, list] of Object.entries(this.lists)) {
          if (list.loaded !== 'not-started') {
            break;
          }
          this.setState((draft) => draft.lists[name] = { loaded: 'loading', entries: [] });
          for await (const data of twitter.getList(name)) {
            this.setState((draft) => { draft.lists[name].entries.push(...data); });
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
    this.setState((draft) => { draft.mastodon.state = newState; })
    try {
      if (newState === 'initial' && (oldState !== newState || !this.mastodon.url)) {
        if (this.mastodon.host) {
          let url = await mastodon.getUrl(this.mastodon.host);
          this.setState((draft) => { draft.mastodon.url = url; })
        }
      }
      if (newState === 'initial' && oldState !== newState) {
        await mastodon.startLogin();
      }
      if (newState === 'showtime' && oldState !== newState) {
        let userInfo = await mastodon.getUserInfo();
        this.setState((draft) => { draft.mastodon.userInfo = userInfo; });
      }
    }
    catch (err) {
      console.log(err);
      this.setState((draft) => { draft.errors.push(err); });
    }
  }

  async setMastodonHost(host) {
    if (host !== this.mastodon.host) {
      this.setState((draft) => {
        draft.mastodon.host = host;
        draft.mastodon.url = undefined;
      })
      this.setMastodonState('initial');
    }
  }

  setMastodonState(state) {
    this.mastodonTransition(state, this.mastodon.state);
  }

  setTwitterState(state) {
    this.twitterTransition(state, this.twitter.state);
  }

}

export const { state, setState, SocialContext, initialState } = SocialInterface;
