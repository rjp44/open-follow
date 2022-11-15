import React, { useContext, useState, useEffect, useLayoutEffect, useRef } from 'react';
import Box from '@mui/material/Box';

import LoadingButton from '@mui/lab/LoadingButton';
import { Avatar } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/lab/Alert';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';


import { makeStyles } from '@mui/styles';
import { Paper } from '@mui/material';
import SocialInterface, { SocialContext } from '../lib/socialInterface';
import ListView from './ListView';
import excerptHtml from 'excerpt-html';

import MastodonLogin from './MastodonLogin';
import TwitterLogin from './TwitterLogin';



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

}));



export default function OpenFollow(props) {
  const classes = useStyles();
  const [tab, setTab] = useState('followers');
  const state = useContext(SocialContext);
  const tabHeaderRef = useRef();
  const [tabHeight, setTabHeight] = useState({ width: 0, height: 0 });
  const social = new SocialInterface();

  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  const list = state?.lists?.['followers']?.entries || [];

  function getWindowDimensions() {
    const { innerHeight: height } = window;
    return {
      height
    };
  }

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useLayoutEffect(() => {
    if (tabHeaderRef.current) {
      setTabHeight( tabHeaderRef.current.offsetHeight );
    }
  }, []);

  function selectAll(listName, state) {
    social.select({ listName }, state);
  }
  function select({ listName, contact, acct }, state) {
    social.select({ listName, contact, acct }, state);
  }


  let mainUi = state.twitter.state === 'showtime' && state.mastodon.state === 'showtime';

  return (
    <Box sx={{ maxHeight: 500 }}>
      <TwitterLogin open={state.twitter.state !== 'showtime'} />
      <MastodonLogin open={state.twitter.state === 'showtime' && state.mastodon.state !== 'showtime'} />
      {mainUi && (<>
        <TabContext value={tab} aria-label="List tab">
          <TabList onChange={(e, value) => setTab(value)} ref={tabHeaderRef} aria-label="lab API tabs example">
            {Object.entries(state.lists).map(([listName, list]) =>
              <Tab label={listName} value={listName} />
            )}
          </TabList>
          {Object.entries(state.lists).map(([listName, list]) =>
            <TabPanel value={listName} >
              <ListView listHeight={`${windowDimensions.height - 90 - tabHeight}px`} list={list} name={listName} selectAll={(state) => select({ listName }, state)} select={select} />
            </TabPanel>
          )}
        </TabContext>
      </>)
      }
    </Box>

  );
};

