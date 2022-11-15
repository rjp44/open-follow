import axios from 'axios';
import Social from './social';



/**
 * Class which encapsulates Twitter v2 API
 * Limited functionality for now as this application is just interested in OAuth2 flow and getting certain lists
 */
export default class Twitter extends Social {
  /**
   *
   */
  constructor(options) {
    super(options);
    this.api = axios.create({
      baseURL: `${process.env.REACT_APP_BACKEND_HOST}/twitter`,
      withCredentials: true,
    });
  }


  /**
   * Generator which yields list fragments. Streams data from API and yields each complete list fragment
   * @param {string} name List name
   */
  async *getList(name, ids) {
    const decoder = new TextDecoder("utf-8");
    let url = `${process.env.REACT_APP_BACKEND_HOST}/twitter/${name}`;
    try {
      let response = await fetch(
        url,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (response.status !== 200)
        throw new Error('error getting list', { cause: response.status });
      const reader = response.body.getReader();
      let str = "";
      let read;
      while ((read = await reader.read()) && !read.done) {
        str += decoder.decode(read.value);
        console.log(`received chunk of size ${read.value.length} buffer len ${str.length}`, { value: read.value, str });

        let [exp, remnant] = findLastLineEnd(str);
        let obj = JSON.parse('[' + exp + ']');
        str = remnant;
        console.log('got obj', { obj });
        yield obj;


      }
    }
    catch (err) {
      console.log({ err }, `fetch error (probably)`);
      try {
        this.logout();
      }
      catch (err) {
        // we really don;t care by the time we get here
      }
    }

    function findLastLineEnd(str) {
      if (!str || !str.length)
        return [];
      let i;
      for (i = str.length - 1; (!str.includes('},', i - 1) || str.charAt(i - 2) === '\\') && i > 0; i--)
        ;
      return ([str.slice(0, i), (i > 0 ? str.slice(i + 1) : str)]);
    }

  }
};






