import axios from 'axios';


/**
 * Class which encapsulates Mastodon API
 * Limited functionality for now as this application is just interested in OAuth2 flow and getting certain lists
 */
export default class Mastodon {

  /**
   * 
   */
  constructor() {
    this.state = 'initial';
    this.api = axios.create({
      baseURL: `${process.env.REACT_APP_BACKEND_HOST}/`,
      withCredentials: true
    });
  }

  #_state;

  set state(value) {
    let last = { ...this._state };
    this._state = {
      state: value,
      time: new Date(),
      last
    };
  }
  get state() {
    return this._state.state;
  }
  checkstate(state) {
    if (this.state !== state)
      throw new Error(`Mastodon API: wrong state. Wanted ${state} but API in ${JSON.stringify(this._state)}`);
  }

  /**
   * Signal to API that app has started the login process 
   * (e.g. by launching OAuth login page)
   * @returns {Promise<boolean>} Resolves to __true__ if login succeeds, __false__ if it fails
   */
  async startLogin() {
    this.checkstate('initial');
    this.state = 'authenticating';
    try {
      ({ token: this.token } = await this.api.get('/mastodon/token'));
      this.state = 'showtime';
      return this.state;
    }
    catch (err) {
      this.state = 'initial';
      return this.state;
    }
    
  }
  /**
   * The current list of Mastodon servers ordered by active user count
   * @returns {Promise<Array.<String>>} list of Mastodon
   */
  async getServers() {
    return (await this.api.get('mastodon/servers')).data;
  }

/**
 * Get the OAuth login screen URL for this Mastodon instance
 * @param {String} host The Mastodon host
 * @param {[Function]} callback 
 * @returns {Promise<String>} The OAuth login screen URL
 */
  async getUrl(host, callback = null) {
    if (!host || !host.length)
      return '';
    this.host = host;
    let { data: { url } } = await this.api.get(`/mastodon/authUrl?server=${host}`);
    console.log({ url });
    callback && callback(url);
    return url;
  }

/**
 * 
 * @returns {Promise<Object>} Mastodon user into structure for logged in user
 */
  async getUserInfo() {
    this.checkstate('showtime');
    this.mastodon = axios.create({
      baseURL: `${process.env.REACT_APP_BACKEND_HOST}/mastodon/passthru/api/v1`,
      withCredentials: true
    });
    try {
      ({ data: this.userInfo} = await this.mastodon.get('accounts/verify_credentials'));
      return this.userInfo;
    }
    catch (err) {
      return false;
    }
 
  }

  /**
 * 
 * @returns {Promise<Object>} Mastodon user into structure for logged in user
 */
  async logout(callback) {
    this.checkstate('showtime');
    let { data } = await this.api.get(`/mastodon/logout`);

    console.log({ data });
    this.state = 'initial';
    callback && callback(data);
    return data;
  }

};


