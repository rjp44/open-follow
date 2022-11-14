import React, { useContext } from 'react';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Autocomplete from '@mui/material/Autocomplete';
import LoadingButton from '@mui/lab/LoadingButton';

import { makeStyles } from '@mui/styles';
import LoginIcon from '@mui/icons-material/Login';
import SocialInterface, { SocialContext } from '../lib/socialInterface';

const useStyles = makeStyles((theme) => { });

export default function MastodonLogin(props) {
  const classes = useStyles();
  const social = new SocialInterface();
  const state = useContext(SocialContext);
  console.log('MastodonLogin', { state });

  return (
    <Dialog open={props.open}>
    <Grid container className={classes.row}>
          <Grid item xs={12}>
          <Typography variant="body">Enter your Mastodon host o that you can be taken to a login screen on your home server</Typography>
            <Autocomplete
              id="host"
            options={state.mastodon.servers||[]}

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
          </Grid>
          <Grid item xs={12}>
            <LoadingButton variant="contained" href={state.mastodon.url} target="_blank"
            onClick={() => social.mastodonAuthenticate()}
              loading={state === 'authenticating'}
            disabled={state === 'showtime' || !(state?.mastodon?.url?.length > 0)}
          >Login to Mastodon
          <LoginIcon />  
          </LoadingButton>

          </Grid>
              <Grid item xs={12}>
        <h2>More information</h2>
        <Typography variant="body">
          <p>We Request the following permissions:</p>
          <List>
            <ListItem><ListItemText secondary="read user profile information like follows and followers">read</ListItemText></ListItem>
            <ListItem><ListItemText secondary="To add following relationships that you request through the app">follow write</ListItemText></ListItem>
          </List>
        </Typography>
      </Grid>
      </Grid>
      </Dialog>
  );
}
