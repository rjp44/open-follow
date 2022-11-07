import { useState, useEffect, useRef } from 'react';
import logo from './logo.svg';
import axios from 'axios';
import './App.css';

const api = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_HOST}/`,
  withCredentials: true
});

axios.defaults.withCredentials = true;

function App() {
  const lists = { 'followers': useState([]), 'following': useState([]), 'blocked': useState([]), 'muted': useState([]) };
  const [tUrl, setUrl] = useState('');
  const urlFetchedRef = useRef(0);
  console.log('app entered', { date: new Date() });

  async function twitterData() {

    if (urlFetchedRef.current++ === 0) {
      const decoder = new TextDecoder("utf-8");

      let { data: { url } } = await api.get('/twitter/authUrl');
      console.log({ url });
      setUrl(url);
      for (const [name, [thing, setter]] of Object.entries(lists)) {
        let response = await fetch(`${process.env.REACT_APP_BACKEND_HOST}/twitter/${name}`, {
          method: 'GET',
          credentials: 'include'
        });
        // response.body is a ReadableStream
        const reader = response.body.getReader();
        let str = '';
        let list = [];
        for await (const chunk of readChunks(reader)) {
          str += decoder.decode(chunk);
          console.log(`received chunk of size ${chunk.length}`, { chunk, str });
          try {
            let obj = JSON.parse(str);
            if (obj.data && obj.meta) {
              list = list.concat(obj.data);
              setter(list);
              str = '';
              console.log(`added ${obj.meta.result_count} entries`, thing);
            }
          }
          catch (err) {
            console.log(err, 'accumulating chinks');
          }


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
  }
  twitterData();

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} height={50} width={50} className="App-logo" alt="logo" />
        <a href={tUrl} target="_blank" rel="noreferrer"><button>Open IFRAME</button></a>
        {Object.entries(lists).map(([name, [list, setter]]) =>
        (list.length > 0 && <>
          <h2>{name}</h2>
          <ul>
            {list.map(contact => (
              (<li>{contact.name} <b>@{contact.username}</b></li>)
            ))}
          </ul>
        </>)
        )}
      </header>
    </div>
  );
}

export default App;
