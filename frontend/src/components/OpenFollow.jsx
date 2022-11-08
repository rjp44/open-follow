import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';

import LoadingButton from '@mui/lab/LoadingButton';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/lab/Alert';
import { makeStyles } from '@mui/styles';
import { Paper } from '@mui/material';

import Twitter from '../lib/twitter';


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



export default function OpenFollow(props) {
  const classes = useStyles();

  const lists = { 'followers': useState([]), 'following': useState([]), 'blocked': useState([]), 'muted': useState([]) };
  const [tUrl, setUrl] = useState('');
  const [twitterState, setTwitterState] = useState('logged_out');
  const urlFetchedRef = useRef(0);
  const twitter = new Twitter();

  useEffect(() => {
    ((tUrl === '') && twitter.getUrl().then(url => setUrl(url)));
  });

  useEffect(() => {
    (async () => {
      for (const [name, [thing, setter]] of Object.entries(lists)) {
        if (thing.length)
          break;
        let list = [];
        for await (const data of twitter.getList(name)) {
          list = list.concat(data);
          setter(list);
        }
      }
    })();
    return;
  }, [tUrl]);

  const [name, [list, setter]] = Object.entries(lists)[0];

  return (
    <Grid container className={classes.root}>
      <Grid item xs={12} className={classes.row} data-testid="follows">
        {(twitterState === 'logged_out' || twitterState === 'authenticating') && <LoadingButton variant="contained" href={tUrl} target="_blank"
          onClick={() => setTwitterState('authenticating')}
          loading={twitterState === 'authenticating'}

        >Login to Twitter</LoadingButton>}
        <Box
          sx={{ width: '100%', height: 400, maxWidth: 360, bgcolor: 'background.paper' }}
        >
          {list.length > 0 && <>
            <List dense sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
              {list.map(contact => (
                <ListItem
                  key={contact.username}
                  secondaryAction={
                    <Checkbox
                      edge="end"
                    //onChange={handleToggle(value)}
                    //checked={checked.indexOf(value) !== -1}
                    //inputProps={{ 'aria-labelledby': labelId }}
                    />
                  }
                >
                  <ListItemText id={contact.username} primary={`${contact.name}  @${contact.username}`} />
                </ListItem>
              ))}
            </List>
          </>
          }
        </Box>

      </Grid>

    </Grid>
  );
};


