import './App.css';
import { useMemo } from 'react';
import { useImmer } from "use-immer";

import MainMenu, { paths as MenuPaths } from './components/MainMenu';

import { makeStyles } from '@mui/styles';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AppBar, Button, Toolbar, Box } from '@mui/material';
import EastIcon from '@mui/icons-material/East';
import LogoutIcon from '@mui/icons-material/Logout';

import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  useNavigate
} from "react-router-dom";
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

// A custom hook that builds on useLocation to parse
// the query string for you.
function useQuery() {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
}


function CallBack(props) {
  const navigate = useNavigate();
  let searchParams = useQuery();
  const social = new SocialInterface();


  useEffect(() => {
    let { code, state } = Object.fromEntries(searchParams.entries());
    console.log('rendering callback...', { service: props.service, code, state });
    if (code || state) {
      social.callback(props.service, { code, state })
      .then(() => navigate('/'));

    }
  }, []);

  return <></>;

}


function App() {
  const classes = useStyles();
  const [state, setState] = useImmer(initialState);

  const social = new SocialInterface(state, setState);
  useEffect(() => {
    social.mainWaitLoop();
  }, []);

  return (
    <SocialContext.Provider value={state}>
      <ThemeProvider theme={theme}>
        <Router>
          <>
            <Box sx={{ flexGrow: 1 }}>
              <AppBar position="fixed">
                <Toolbar>
                  <MainMenu />
                  <Logout logout={social.logout} twitterState={state.twitter.state === 'showtime'} mastodonState={state.mastodon.state === 'showtime'} />
                  <TwitterBadge sx={{ display: { xs: 'none', sm: 'none', md: 'inline' } }} />
                  {state.twitter.state === 'showtime' && state.mastodon.state === 'showtime' && <EastIcon sx={{ display: { xs: 'none', sm: 'none', md: 'inline' } }} />}
                  <MastodonBadge sx={{ display: { xs: 'none', sm: 'none', md: 'inline' } }} />
                  <Kofi id="robpickering" text="Donate" sx={{ flexGrow: 1 }} disabled={true} />
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
                <Route exact={false}
                  path='/callback/twitter'
                  key='callback'
                  element={<CallBack service="twitter" />}
                />
                                  <Route exact={false}
                  path='/callback/mastodon'
                  key='callback'
                  element={<CallBack service="mastodon" />}
                />
              </Routes>
            </Box>
          </>
        </Router>
      </ThemeProvider>
    </SocialContext.Provider>

  );

}






export default App;
