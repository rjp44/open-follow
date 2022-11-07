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
  const [tUrl, setUrl] = useState('');
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [blocked, setBlocked] = useState([]);
  const [muted, setMuted] = useState([]);
  const urlFetchedRef = useRef(0);
  console.log('app entered', { date: new Date() });

  async function init() {
    if (urlFetchedRef.current++ === 0) {
      let { data: { url } } = await api.get('/twitter/authUrl')
          console.log({ url });
      setUrl(url);
      let { data: followers } = await api.get('/twitter/followers');
      console.log({ followers });
      setFollowers(followers.entries);
      let { data: following } = await api.get('/twitter/following');
      setFollowing(following.entries);
      console.log({ following });
      let { data: blocked } = await api.get('/twitter/blocked');
      console.log({ blocked });
      setBlocked(blocked.entries);
      let { data: muted } = await api.get('/twitter/muted');
      console.log({ muted });
      setMuted(muted.entries);
    }
  }
  init();

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} height={50} width={50} className="App-logo" alt="logo" />
        <a href={tUrl} target="_blank" rel="noreferrer"><button>Open IFRAME</button></a>
        <h2>Followers</h2>
        <ul>
          {followers.map(follower => (
            (<li>{follower.name} <b>@{follower.username}</b></li>)
          ))}
        </ul>
        <h2>Following</h2>
        <ul>
          {following.map(user => (
            (<li>{user.name} <b>@{user.username}</b></li>)
          ))}
        </ul>
        <h2>Blocked</h2>
        <ul>
          {blocked.map(user => (
            (<li>{user.name} <b>@{user.username}</b></li>)
          ))}
        </ul>
        <h2>Muted</h2>
        <ul>
          {muted.map(user => (
            (<li>{user.name} <b>@{user.username}</b></li>)
          ))}
        </ul>
      </header>
    </div>
  );
}

export default App;
