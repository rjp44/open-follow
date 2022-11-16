import React, { useContext } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import LoadingButton from '@mui/lab/LoadingButton';


import LoginIcon from '@mui/icons-material/Login';
import SocialInterface, { SocialContext } from '../lib/socialInterface';


export default function MastodonLogin(props) {
  const social = new SocialInterface();
  const state = useContext(SocialContext);
  console.log('MastodonLogin', { state });

  return (
    <Dialog open={props.open}>
      <DialogTitle>Authorise Mastodon Access</DialogTitle>
      <DialogContent>
        <DialogContentText>
          <p>Please authorise this application to retrieve your own user account info, search for Mastodon users, and add following, blocked and muted relationships.
            When you press the button below, a new window or tab will open with a Mastodon authorisation screen from your home server.
          </p>
          <p> Please ensure you allow popups for this site and twitter to enable the login.</p>
          <p>You will first need to enter your Mastodon host that you can be taken to a login screen on your home server.</p>
        </DialogContentText>
        <Autocomplete
          id="host"
          options={state.mastodon.servers || []}

          includeInputInList
          onChange={(event, newValue) => {
            social.setMastodonHost(newValue);
          }}
          renderInput={(params) => (
            <TextField {...params}
              label="Mastodon Host"
              placeholder="mastodon.social - your mastodon host"
              variant="outlined"
              InputProps={{
                ...params.InputProps,
              }}
            />
          )}
        />

      </DialogContent>
      <DialogActions>
        <LoadingButton variant="contained" href={state.mastodon.url} target="_blank"
          onClick={() => social.mastodonAuthenticate()}
          loading={state === 'authenticating'}
          disabled={state === 'showtime' || !(state?.mastodon?.url?.length > 0)}
        >Login to Mastodon
          <LoginIcon />
        </LoadingButton>
      </DialogActions>
      <DialogContent>
        <DialogContentText>
          <Typography variant="h5">More information</Typography>
          We Request the following permissions:
          <List>
            <ListItem><ListItemText secondary="read user profile information like follows and followers">read</ListItemText></ListItem>
            <ListItem><ListItemText secondary="To add following relationships that you request through the app">follow write</ListItemText></ListItem>
          </List>
          We don't do any other operations using your Mastodon credentials other than searching for other users to identify ones that you are linked with on twitter, and adding those relationships on Mastondon that you choose from the selection we find.
        </DialogContentText>
      </DialogContent>
    </Dialog>


  );
}
