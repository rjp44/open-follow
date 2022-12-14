import React, { useContext } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';

import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import Tooltip from "@mui/material/Tooltip";
import Autocomplete from '@mui/material/Autocomplete';
import LoadingButton from '@mui/lab/LoadingButton';


import LoginIcon from '@mui/icons-material/Login';
import SocialInterface, { SocialContext } from '../lib/socialInterface';


export default function MastodonLogin(props) {
  const social = new SocialInterface();
  const state = useContext(SocialContext);

  let disabled = state.mastodon.state === "showtime" ||
                  !(state?.mastodon?.url?.length > 0);
          
  

  return (
    <Dialog open={props.open}>
      <DialogTitle>Authorise Mastodon Access</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Please authorise this application to retrieve your own user account
          info, search for Mastodon users, and add following, blocked and muted
          relationships.
        </DialogContentText>
        <DialogContentText sx={{ mb: 2 }}>
          First, enter your Mastodon host that you can be taken to a login
          screen on your home server.
        </DialogContentText>
        <Autocomplete
          id="host"
          freeSolo={true}
          options={state.mastodon.servers || []}
          includeInputInList
          onChange={(event, newValue) => {
            social.setMastodonHost(newValue);
          }}
          renderInput={(params) => (
            <Tooltip title="Your Mastodon host e.g. 'mastodon.social'" arrow>
              <TextField
                {...params}
                label="Mastodon Host"
                placeholder=" your mastodon host"
                InputProps={{
                  ...params.InputProps,
                }}
              />
            </Tooltip>
          )}
        />
      </DialogContent>
      <DialogActions>
        <Tooltip title={disabled ? 'enter your host above first' : 'go to mastodon login'} arrow>
           <span>
        <LoadingButton
          variant="contained"
          href={state.mastodon.url}
          onClick={() => social.mastodonAuthenticate()}
          loading={state.mastodon.state === "authenticating"}
          disabled={
            state.mastodon.state === "showtime" ||
            !(state?.mastodon?.url?.length > 0)
          }
        >
          Login to Mastodon
          <LoginIcon />
        </LoadingButton>
        </span>
        </Tooltip>
      </DialogActions>
      <DialogTitle>More information</DialogTitle>
      <DialogContent>
        <DialogContentText>
          We Request the following permissions:
        </DialogContentText>
        <List>
          <ListItem>
            <ListItemText secondary="read user profile information like follows and followers">
              read
            </ListItemText>
          </ListItem>
          <ListItem>
            <ListItemText secondary="To add following relationships that you request through the app">
              follow write
            </ListItemText>
          </ListItem>
        </List>
        <DialogContentText>
          We don't do any other operations using your Mastodon credentials other
          than searching for other users to identify ones that you are linked
          with on twitter, and adding those relationships on Mastondon that you
          choose from the selection we find.
        </DialogContentText>
      </DialogContent>
    </Dialog>
  );
}
