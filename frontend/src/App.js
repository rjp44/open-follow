import { useState, useEffect, useRef } from 'react';
import logo from './logo.svg';
import axios from 'axios';
import './App.css';
import './App.css';

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



const api = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_HOST}/`,
  withCredentials: true
});

axios.defaults.withCredentials = true;




function App() {
  const classes = useStyles();

 

  return (
    <ThemeProvider theme={theme}>

    <div className={classes.root}>
      <Router>
        <>
          <AppBar position="fixed">
            <Toolbar>
              <MainMenu />
              <LocationHeader />
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

  );

  function LocationHeader() {
    const location = useLocation();
    return (<Typography variant="h6" className={classes.title}>
      {MenuPaths[location.pathname]?.title}
    </Typography>);

  }
}






export default App;
