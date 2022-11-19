import './App.css';
import { useImmer } from "use-immer";

import MainMenu, { paths as MenuPaths } from './components/MainMenu';

import { makeStyles } from '@mui/styles';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AppBar, Button, Toolbar, Box } from '@mui/material';
import EastIcon from '@mui/icons-material/East';
import LogoutIcon from '@mui/icons-material/Logout';

import {
  HashRouter as Router,
  Route,
  Routes} from "react-router-dom";
import SocialInterface, { SocialContext, initialState } from './lib/socialInterface';
import MastodonBadge from './components/MastodonBadge';
import TwitterBadge from './components/TwitterBadge';
import DataDownload from './components/DataDownload';
import Kofi from './components/Kofi';





import './App.css';
import { useEffect } from 'react';

const theme = createTheme({});
const useStyles = makeStyles(() => ({
  selectAll: {
    position: "relative",
    flexGrow: 1,

  },
  toolbar: { ...theme.mixins.toolbar, height: 90 }
}));

function Logout(props) {
  return <Button disabled={!props.mastodonState && !props.twitterState} onClick={props.logout} variant="contained" endIcon={<LogoutIcon />}>
    Logout
  </Button>;
}

function App() {
  const classes = useStyles();
  const [state, setState] = useImmer(initialState);
  const social = new SocialInterface(state, setState);
  useEffect(() => {
    social.mainWaitLoop();
  }, [])

  return (
    <SocialContext.Provider value={state}>
      <ThemeProvider theme={theme}>
        <Router>
          <>
            <Box sx={{ flexGrow: 1 }}>
              <AppBar position="fixed">
                <Toolbar>
                  <MainMenu />
                  <Logout logout={social.logout} twitterState={ state.twitter.state === 'showtime' } mastodonState={ state.mastodon.state === 'showtime' } />
                  <TwitterBadge />
                  {state.twitter.state === 'showtime' && state.mastodon.state === 'showtime' && <EastIcon />}
                  <MastodonBadge />
                  <Kofi id="robpickering" text="Donate" sx={{ flexGrow: 1 }} disabled={!state.haveSavedData} />
                   <DataDownload data={state.lists} />
                </Toolbar>
              </AppBar>
              <div className={classes.toolbar} />
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Routes>
                {Object.entries(MenuPaths).map(([key, value]) =>
                  <Route exact={value.exact}
                    path={key}
                    key={key}
                    element={value.element}
                    children={value.children}
                  />
                )}
              </Routes>
            </Box>
          </>
        </Router>
      </ThemeProvider>
    </SocialContext.Provider>

  );

}






export default App;
