import './App.css';
import { useImmer } from "use-immer";

import MainMenu, { paths as MenuPaths } from './components/MainMenu';

import { makeStyles } from '@mui/styles';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AppBar, Button, Toolbar, Typography, Box } from '@mui/material';
import {
  HashRouter as Router,
  Route,
  Routes,
  useLocation
} from "react-router-dom";
import SocialInterface, { SocialContext, initialState } from './lib/socialInterface';
import MastodonBadge from './components/MastodonBadge';
import TwitterBadge from './components/TwitterBadge';
import SelectAllControl from './components/SelectAllControl'




import './App.css';

const theme = createTheme({});
const useStyles = makeStyles(() => ({
  selectAll: {
    position: "relative",
    flexGrow: 1,

  },
  toolbar: { ...theme.mixins.toolbar, height: 90 }
}));




function App() {
  const classes = useStyles();

  const [state, setState] = useImmer(initialState);
  new SocialInterface(state, setState);

  return (
    <SocialContext.Provider value={state}>
      <ThemeProvider theme={theme}>
        {console.log('app', { state })}

          <Router>
          <>
            <Box sx={{ flexGrow: 1}}>
              <AppBar position="fixed">
                <Toolbar>
                  <MainMenu />
                  <LocationHeader />
                  <TwitterBadge />
                  <MastodonBadge />
                </Toolbar>
              </AppBar>
              <div className={classes.toolbar} />
              </Box>
            <Box sx={{ flexGrow: 1}}>
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

  function LocationHeader() {
    const location = useLocation();
    return (<Typography variant="h6" className={classes.title}>
      {MenuPaths[location.pathname]?.title}
    </Typography>);

  }
}






export default App;
