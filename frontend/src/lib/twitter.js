import axios from 'axios';
import Social from './social';

const MAX_RECORDS = 50;

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

    let response = await fetch(
      url,
      {
        method: "GET",
        credentials: "include",
      }
    );
    // response.body is a ReadableStream
    const reader = response.body.getReader();
    let str = "";
    let read;
    while ((read = await reader.read()) && !read.done) {
      str += decoder.decode(read.value);
      console.log(`received chunk of size ${read.value.length} buffer len ${str.length}`, { value: read.value, str });
      // This is a bit of a hack, REST API streams chunks of consistent data on twitter v2 page
      //  boundaries but these may occaisionaly get further chunked in transit so if JSON parse
      //  fails them we hang on for later chunks and try again.
      try {
        let obj = JSON.parse(str);
        console.log('got obj', { obj });
        if (obj.data && obj.meta) {
          console.log(`yielding ${obj.meta.result_count} entries`, obj.data);
          str = "";
          yield obj;
        }
      } catch (err) {
        console.log(err, `accumulating chunks ${str.length} overflow`);
      }
    }

  }
};
  




