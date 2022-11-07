import React, { useState, useRef } from 'react';
import axios from 'axios';
import Box from '@material-ui/core/Box';

import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import Typography from '@material-ui/core/Typography';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';
import { Paper } from '@material-ui/core';


const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    flexDirection: 'column'
  },
  row: {
    flex: '0 1 auto',
    padding: theme.spacing(1),
    textAlign: 'center',
  },
  hog: {
    position: 'relative',
    flex: '1 1 auto',
    padding: theme.spacing(1),
    textAlign: 'center',
  },
  wrapper: {
    flexGrow: 1,
    height: 18,
    margin: theme.spacing(1),
    position: 'relative',
  },
  buttonProgress: {
    position: 'absolute',
    top: 0,
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  buttonCenter: {
    position: 'absolute',
    top: 0,
    marginTop: 12,
    width: '100%',
    left: 0
  },
  map: {
    height: 200
  },
  phoneticOutput: {
    minHeight: '4rem'
  },
  locationOverlay: {
    position: 'absolute',
    top: 80,
    width: '70%',
    left: '15%',
    zIndex: 1000
  },
  gridRef: {
    position: 'absolute',
    top: 25,
    width: '70%',
    right: '15%',
    background: 'rgba(255, 255, 255, 0.6)',
    zIndex: 1000
  },
  nearest: {
    position: 'absolute',
    top: 60,
    width: '70%',
    right: '15%',
    background: 'rgba(255, 255, 255, 0.6)',
    zIndex: 1000
  },
  accuracyOverlay: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    zIndex: 1000,
    background: 'rgba(255, 255, 255, 0.6)'
  }
}));


const api = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_HOST}/`,
  withCredentials: true
});

axios.defaults.withCredentials = true;


export default function OpenFollow(props) {
  const classes = useStyles();

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

  const [name, [list, setter]] = Object.entries(lists)[0];

  return (
    <Grid container className={classes.root}>
      <Grid item xs={12} className={classes.row} data-testid="follows">
        <a href={tUrl} target="_blank" rel="noreferrer"><Button>Open IFRAME</Button></a>
        <Box
          sx={{ width: '100%', height: 400, maxWidth: 360, bgcolor: 'background.paper' }}
        >
          <List dense sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
            {list.map(contact => (
            <ListItem
              key={contact.username}
              primaryAction={
                <Checkbox
                  edge="end"
                  //onChange={handleToggle(value)}
                  //checked={checked.indexOf(value) !== -1}
                  //inputProps={{ 'aria-labelledby': labelId }}
                />
              }
              disablePadding
            >
              <ListItemText id={contact.username} primary={`${contact.name} - ${contact.username}`} />
          </ListItem>
                      ))}
          </List>
        </Box>
        {Object.entries(lists).map(([name, [list, setter]]) =>
        (list.length > 0 && <>
          <div className={classes.gridRef} data-testid="osgr"><Typography variant="h5">{name}</Typography></div><h2>{name}</h2>
          <ul>
            {list.map(contact => (
              (<li>{contact.name} <b>@{contact.username}</b></li>)
            ))}
          </ul>
        </>)
        )}
      </Grid>
           
    </Grid>
  );
};


