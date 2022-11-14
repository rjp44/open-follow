import React, { useContext } from 'react';
import Grid from '@mui/material/Grid';
import LoadingButton from '@mui/lab/LoadingButton';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import { makeStyles } from '@mui/styles';
import LoginIcon from '@mui/icons-material/Login';
import TwitterIcon from '@mui/icons-material/Twitter';
import SocialInterface, { SocialContext } from '../lib/socialInterface';

const useStyles = makeStyles((theme) => { });

export default function TwitterLogin(props) {
  const classes = useStyles();
  const social = new SocialInterface();
  const state = useContext(SocialContext);
  console.log('TwitterLogin', { state });

  return (

    <Dialog open={props.open}>
      <Paper className={classes.paper}>
        <Typography variant="h6">Twitter Logon</Typography>
        <Typography variant="body1">
          Please authorise this application to retrieve data about your follows, followers, block and mute lists from Twitter.
          When you press the button below, a new window or tab will open with a twitter authorisation screen. Please ensure you allow popups for this site and twitter to enable the login.
        </Typography>
      </Paper>
      <Paper className={classes.paper}>
        <LoadingButton
          startIcon={<TwitterIcon />}
          endIcon={<LoginIcon />}
          variant="contained" href={state.twitter.url} target="_blank"
          onClick={() => social.twitterAuthenticate()}
          loading={state.twitter.state === 'authenticating'}
          disabled={state.twitter.state === 'showtime' || !(state.twitter?.url?.length > 0)}
        >Login to Twitter
        </LoadingButton>
        <h2>More information</h2>
        <Typography variant="body">
          <p>We Request the following permissions:</p>
          <List>
            <ListItem><ListItemText secondary="necessary to be able to map your existing social graph on twitter to find contacts on Mastodon">read followers, following, mute and block lists</ListItemText></ListItem>
            <ListItem><ListItemText secondary="we don't to our knowledge use this, but it appears to be required by the API calls we make to list users as pinned tweets are returned as part of the user profile data and these calls fail with permission issues if we do nto request this. We don't use data from tweets, yours or anyone else's">read tweets that you can read</ListItemText></ListItem>
          </List>
        </Typography>
      </Paper>

    </Dialog>
  );
}
