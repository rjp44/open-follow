import axios from 'axios';

const api = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_HOST}/`,
  withCredentials: true
});

axios.defaults.withCredentials = true;

/**
 * Class which encapsulates Mastodon API
 * Limited functionality for now as this application is just interested in OAuth2 flow and getting certain lists
 */
export default class Mastodon {

  async getServers() {
    return (await api.get('mastodon/servers')).data;
    
  }
  /**
   * 
   * @param [function] callback 
   * @returns {string} Twitter OAUTH2 URL
   */
  async getUrl(host, callback = null) {
    if (!host)
      return '';
    this.host = host;
    let { data: { url } } = await api.get(`/mastodon/authUrl?server=${host}`);
    console.log({ url });
    callback && callback(url);
    return url;
  }

  /**
   * Generator which yields list fragments. Streams data from API and yields each complete list fragment
   * @param {string} name List name
   */
  async * getList(name) {

    const decoder = new TextDecoder("utf-8");

    let response = await fetch(`${process.env.REACT_APP_BACKEND_HOST}/twitter/${name}`, {
      method: 'GET',
      credentials: 'include'
    });
    // response.body is a ReadableStream
    const reader = response.body.getReader();
    let str = '';
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
          str = '';
          yield obj.data;
        }
      }
      catch (err) {
        console.log(err, 'accumulating chunks');
      }


    }

    // readChunks() reads from the provided reader and yields the results into an async iterable
    function readChunks(reader) {
      return {
        async*[Symbol.asyncIterator]() {
          let readResult = await reader.read();
          while (!readResult.done) {
            yield readResult.value;
            readResult = await reader.read();
          }
        },
      };

    }

  }

  async getUserInfo() {
    let { token_type, access_token } = await api.get('/mastodon/token');
    this.mastodon = axios.create({
      baseURL: `${process.env.REACT_APP_BACKEND_HOST}/mastodon/passthru/api/v1`,
    });
    return (await this.mastodon.get('accounts/verify_credentials')).data;
 
  
  }

};


