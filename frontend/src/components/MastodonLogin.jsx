import React, { useContext } from 'react';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Autocomplete from '@mui/material/Autocomplete';
import LoadingButton from '@mui/lab/LoadingButton';
import MastodonBadge from './MastodonBadge';
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
    <Grid container className={classes.row}>
      {state.mastodon.state !== 'showtime' &&
        (<>
          <Grid item xs={12}>
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
        </>)
      }


    </Grid>
  );
}
