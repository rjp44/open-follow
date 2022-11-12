import axios from 'axios';
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
      withCredentials: true
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
      let { data } = await this.mastodon.get(url);
      return data;
    }
    catch (err) {
      return false;
    }
  }

  
};


