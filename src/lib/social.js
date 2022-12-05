
/**
 * 
 * Superclass for social media providers
 * 
 */
export default class Social {
  /**
   *
   */
  constructor({ onStateChange } = {}) {
    
    this.onStateChange = async (state, lastState) => (onStateChange && onStateChange(state, lastState));
  }

  async callback(path, args) {
    let query = new URLSearchParams(args)
    let res = await this.api.get(`/callback?${query.toString()}`);
    res.status === 200 && (this.state = 'showtime');
    return res.data;
  }

  async start() {
    await this.checkStatus();
  }

  #_state;

  set state(value) {
    let last = { ...this._state };
    this._state = {
      state: value,
      time: new Date(),
      last,
    };
    console.log(`state change ${this.constructor.name}: ${last.state} => ${this._state.state}`)
    this.onStateChange && this.onStateChange(this._state.state, last.state);
  }
  get state() {
    return this._state.state;
  }
  checkstate(state) {
    if (this.state !== state)
      throw new Error(
        `Twitter API: wrong state. Wanted ${state} but API in ${JSON.stringify(
          this._state
        )}`
      );
  }

  /**
   * Signal to API that app has started the login process
   * (e.g. by launching OAuth login page)
   * @returns {Promise<boolean>} Resolves to __true__ if login succeeds, __false__ if it fails
   */
  async startLogin() {
    this.checkstate("initial");
    this.state = "authenticating";

  }

  /**
 *
 * @param [function] callback
 * @returns {string} Twitter OAUTH2 URL
 */
  async getUrl(callback = null) {
    let {
      data: { url },
    } = await this.api.get("/authUrl");
    this.state = 'initial';
    
    callback && callback(url);
    return url;
  }

  /**
   *
   * @returns {Promise<Object>} Mastodon user into structure for logged in user
   */
  async getUserInfo(callback) {
    this.checkstate("showtime");
    let {
      data: info 
    } = await this.api.get("/userInfo");
    
    callback && callback(info);
    return info;
  }

  

  async checkStatus() {
    let { data } = await this.api.get(`/checkStatus`);
    
    this.host = data.host;
    this.state = data.state || 'initial';
    return data.state;
  }

  /**
   *
   * @returns {Promise<Object>} Mastodon user into structure for logged in user
   */
  async logout(callback) {
    this.checkstate("showtime");
    try {
      let { data } = await this.api.get(`/logout`);
      
      callback && callback(data);
    }
    catch (err) {
      
    }
    finally {
      this.state = "initial";
      return;
    }
  }
};


