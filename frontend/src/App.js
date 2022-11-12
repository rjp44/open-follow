import './App.css';
import { useImmer } from "use-immer";

import MainMenu, { paths as MenuPaths } from './components/MainMenu';

import { makeStyles } from '@mui/styles';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AppBar, Toolbar, Typography } from '@mui/material';
import {
  HashRouter as Router,
  Route,
  Routes,
  useLocation
} from "react-router-dom";
import SocialInterface, { SocialContext, initialState } from './lib/socialInterface';
import MastodonBadge from './components/MastodonBadge';
import TwitterBadge from './components/TwitterBadge';




import './App.css';

const theme = createTheme({});
const useStyles = makeStyles(() => ({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  row: {
    position: 'center'
  },
  wrapper: {
    margin: theme.spacing(1),
    position: 'relative',
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  toolbar: theme.mixins.toolbar
}));




function App() {
  const classes = useStyles();
  const [state, setState] = useImmer(initialState);
  new SocialInterface(state, setState);


  return (
    <SocialContext.Provider value={state}>
      <ThemeProvider theme={theme}>
        {console.log('app', { state })}
        <div className={classes.root}>
          <Router>
            <>
              <AppBar position="fixed">
                <Toolbar>
                  <MainMenu />
                  <LocationHeader />
                  <TwitterBadge />
                  <MastodonBadge />
                </Toolbar>
              </AppBar>
              <div className={classes.toolbar} />
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
            </>
          </Router>
        </div>
      </ThemeProvider>
    </SocialContext.Provider>

  );

  function LocationHeader() {
    const location = useLocation();
    return (<Typography variant="h6" className={classes.title}>
      {MenuPaths[location.pathname]?.title}
    </Typography>);

  }
}






export default App;
