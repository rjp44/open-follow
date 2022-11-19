import axios from 'axios';
import { v4 as uuidv4 }  from 'uuid';


/**
 * Class which encapsulates Mastodon API
 * Limited functionality for now as this application is just interested in OAuth2 flow and getting certain lists
 */
export default class Session  {

  /**
   * 
   */
  constructor(options) {
    this.api = axios.create({
      baseURL: `${process.env.REACT_APP_BACKEND_HOST}`,
      withCredentials: true
    });

  }

async initSession() {
  let nonce = uuidv4();
  let data;

    do {
      try {
        await this.api.get(`/ping?nonce=${nonce}`);
        ({ data } = await this.api.get(`/ping`));
        if (data !== nonce)
          throw new Error('session mismatch');
      }
      catch (err) {
        console.log('session setup failed', err);
        data = null;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } while (data !== nonce);

  }

}
