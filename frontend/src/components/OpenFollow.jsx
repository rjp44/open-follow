import React, { useContext, useState, useEffect, useLayoutEffect, useRef } from 'react';
import Box from '@mui/material/Box';


import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';



import SocialInterface, { SocialContext } from '../lib/socialInterface';
import ListView from './ListView';


import MastodonLogin from './MastodonLogin';
import TwitterLogin from './TwitterLogin';




export default function OpenFollow(props) {
  const [tab, setTab] = useState('followers');
  const state = useContext(SocialContext);
  const tabHeaderRef = useRef();
  const [tabHeight, setTabHeight] = useState(0);
  const social = new SocialInterface();

  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());



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
          <TabList onChange={(e, value) => setTab(value)} ref={tabHeaderRef} >
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

