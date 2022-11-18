import React, { useContext } from 'react';
import LoadingButton from '@mui/lab/LoadingButton';

import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';

import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import LoginIcon from '@mui/icons-material/Login';
import TwitterIcon from '@mui/icons-material/Twitter';
import SocialInterface, { SocialContext } from '../lib/socialInterface';



export default function TwitterLogin(props) {

  const social = new SocialInterface();
  const state = useContext(SocialContext);
  

  return (

    <Dialog open={props.open}>
      <DialogTitle>Authorise Twitter Access</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please authorise this application to retrieve data about your follows, followers, block and mute lists from Twitter.
          When you press the button below, a new window or tab will open with a twitter authorisation screen. Please ensure you allow popups for this site and twitter to enable the login.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <LoadingButton
          startIcon={<TwitterIcon />}
          endIcon={<LoginIcon />}
          variant="contained" href={state.twitter.url} target="_blank"
          onClick={() => social.twitterAuthenticate()}
          loading={state.twitter.state === 'authenticating'}
          disabled={state.twitter.state === 'showtime' || !(state.twitter?.url?.length > 0)}
        >Login to Twitter
        </LoadingButton>
      </DialogActions>
      <DialogTitle>More information</DialogTitle>
      <DialogContent>
        <DialogContentText>
          We Request the following permissions:
        </DialogContentText>
          <List>
            <ListItem><ListItemText secondary="necessary to be able to map your existing social graph on twitter to find contacts on Mastodon">read followers, following, mute and block lists</ListItemText></ListItem>
            <ListItem><ListItemText secondary="we don't to our knowledge use this, but it appears to be required by the API calls we make to list users as pinned tweets are returned as part of the user profile data and these calls fail with permission issues if we do nto request this. We don't use data from tweets, yours or anyone else's">read tweets that you can read</ListItemText></ListItem>
          </List>
        <DialogContentText>We don't do any other operations using your twitter credentials other than reading your followers, following, muted, and blocked lists. We use these to cross reference and suggest Mastodon accounts to follow, and allow you to download your twitter data from this web application.</DialogContentText>
      </DialogContent>
    </Dialog>
  );
}
