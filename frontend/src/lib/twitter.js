import axios from 'axios';

/**
 * Class which encapsulates Twitter v2 API
 * Limited functionality for now as this application is just interested in OAuth2 flow and getting certain lists
 */
export default class Twitter {
  /**
   *
   */
  constructor({ onStateChange } = {}) {
    this.onStateChange = async (state, lastState) => (onStateChange && onStateChange(state, lastState));
    this.state = "initial";
    this.api = axios.create({
      baseURL: `${process.env.REACT_APP_BACKEND_HOST}/`,
      withCredentials: true,
    });
  }

  #_state;

  set state(value) {
    let last = { ...this._state };
    this._state = {
      state: value,
      time: new Date(),
      last,
    };
    this.onStateChange(this._state.state, last.state);
  }
  get state() {
    return this._state.state;
  }
  checkstate(state) {
    if (this.state !== state)
      throw new Error(
        `Mastodon API: wrong state. Wanted ${state} but API in ${JSON.stringify(
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
    try {
      let { data } = await this.api.get("/twitter/checkLogin");
      this.state = "showtime";
      return this.state;
    } catch (err) {
      this.state = "initial";
      return this.state;
    }
  }

  /**
   *
   * @param [function] callback
   * @returns {string} Twitter OAUTH2 URL
   */
  async getUrl(callback = null) {
    let {
      data: { url },
    } = await this.api.get("/twitter/authUrl");
    console.log({ url });
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
    } = await this.api.get("/twitter/userInfo");
    console.log({ info });
    callback && callback(info);
    return info;
  }

  /**
   * Generator which yields list fragments. Streams data from API and yields each complete list fragment
   * @param {string} name List name
   */
  async *getList(name) {
    const decoder = new TextDecoder("utf-8");
    let response = await fetch(
      `${process.env.REACT_APP_BACKEND_HOST}/twitter/${name}`,
      {
        method: "GET",
        credentials: "include",
      }
    );
    // response.body is a ReadableStream
    const reader = response.body.getReader();
    let str = "";
    for await (const chunk of readChunks(reader)) {
      str += decoder.decode(chunk);
      console.log(`received chunk of size ${chunk.length}`, { chunk, str });
      // This is a bit of a hack, REST API streams chunks of consistent data on twitter v2 page
      //  boundaries but these may occaisionally get further chunked in transit so if JSON parse
      //  fails them we hang on for later chunks and try again.
      try {
        let obj = JSON.parse(str);
        if (obj.data && obj.meta) {
          console.log(`yielding ${obj.meta.result_count} entries`, obj.data);
          str = "";
          yield obj.data;
        }
      } catch (err) {
        console.log(err, "accumulating chunks");
      }
    }
    function readChunks(reader) {
      return {
        async *[Symbol.asyncIterator]() {
          let readResult = await reader.read();
          while (!readResult.done) {
            yield readResult.value;
            readResult = await reader.read();
          }
        },
      };
    }
  }

  /**
   *
   * @returns {Promise<Object>} Mastodon user into structure for logged in user
   */
  async logout(callback) {
    this.checkstate("showtime");
    console.log('logout', this.state);
    let { data } = await this.api.get(`/twitter/logout`);

    console.log({ data });
    this.state = "initial";
    callback && callback(data);
    return data;
  }
};


