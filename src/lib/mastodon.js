import axios from 'axios';
import linkParser from 'parse-link-header';
import Social from './social';


/**
 * Class which encapsulates Mastodon API
 * Limited functionality for now as this application is just interested in OAuth2 flow and getting certain lists
 */
export default class Mastodon extends Social {

  /**
   * 
   */
  constructor(options) {
    super(options);
    this.api = axios.create({
      baseURL: `${process.env.REACT_APP_BACKEND_HOST}/mastodon`,
      withCredentials: true
    });
    this.mastodon = axios.create({
      baseURL: `${process.env.REACT_APP_BACKEND_HOST}/mastodon/passthru`,
      withCredentials: true,
      timeout: 10000,

    });
    this.mastodon.interceptors.response.use(async (res) => {
      let [remaining, resetTime] = [parseInt(res.headers['x-ratelimit-remaining']), res.headers['x-ratelimit-reset']];
      if (remaining && resetTime) {
        let timeUntil = (new Date(resetTime)).valueOf() - (new Date()).valueOf;
        let delay = timeUntil / remaining;
        console.log('mastodon API', { remaining, timeUntil, delay });
        await new Promise((reject, resolve) => setTimeout(resolve, delay));
      }
      return res;
    });

  }


      
  
  /**
   * The current list of Mastodon servers ordered by active user count
   * @returns {Promise<Array.<String>>} list of Mastodon
   */
  async getServers() {
    return (await this.api.get('/servers')).data;
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
    let { data: { url } } = await this.api.get(`/authUrl?server=${host}`);
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
    try {
      ({ data: this.userInfo} = await this.mastodon.get('/api/v1/accounts/verify_credentials'));
      return this.userInfo;
    }
    catch (err) {
      return false;
    }
   }


  async search(term, type) {
    this.checkstate('showtime');
    let url = `/api/v2/search?q=${encodeURIComponent(term)}${type && ('&type=' + type)}`;
    try {
      let res = await this.mastodon.get(url);
      let { data } = res;
      return data;
    }
    catch (err) {
      console.log(err);
      return false;
    }
  }

  async *getList(list, id) {
    if (!id)
      id =  this?.userInfo?.id
    //this.checkstate('showtime');
    let url = `/api/v1/accounts/${id}/${list}`;
    try {
      let res = await this.mastodon.get(url);
      console.log('get list', { headers: res.headers });
      while (res?.status === 200) {
        yield res.data;
        let links = linkParser(res.headers.link);
        console.log('get list', { headers: res.headers, links });
        if (links?.next?.url) {
          res = await this.mastodon.get(links.next.url.replace(/.*\/api\/v1/, '/api/v1'));
          console.log('get list', { headers: res.headers, links });
        }
        else {
          res = null
        }

      }
    }
    catch (err) {
      console.log(err);
    }
  }



  async add(list, id) {
    this.checkstate('showtime');
    let url = `/api/v1/accounts/${encodeURIComponent(id)}/${list}`;
    try {
      let res = await this.mastodon.post(url);
      let { data } = res;
      return data;
    }
    catch (err) {
      console.log(err);
      return false;
    }
  }


  
};


