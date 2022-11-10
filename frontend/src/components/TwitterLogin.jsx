import React, { useContext } from 'react';
import Grid from '@mui/material/Grid';
import LoadingButton from '@mui/lab/LoadingButton';
import { makeStyles } from '@mui/styles';
import LoginIcon from '@mui/icons-material/Login';
import TwitterIcon from '@mui/icons-material/Twitter';
import TwitterBadge from './TwitterBadge';
import SocialInterface, { SocialContext } from '../lib/socialInterface';

const useStyles = makeStyles((theme) => { });

export default function TwitterLogin(props) {
  const classes = useStyles();
  const social = new SocialInterface();
  const state = useContext(SocialContext);

  return (
    <Grid container className={classes.row}>
      {state !== 'showtime' &&
        (<Grid item xs={12}>
          <LoadingButton
            startIcon={<TwitterIcon />}
            endIcon={<LoginIcon />}
            variant="contained" href={state?.twitter?.url} target="_blank"
            onClick={() => social.setTwitterState('authenticating')}
            loading={state.twitter.state === 'authenticating'}
            disabled={state.twitter.state === 'showtime' || (state.twitter?.url?.length > 0)}
          >Login to Twitter
          </LoadingButton>

        </Grid>)
      }
      {state === 'showtime' &&
        <Grid item xs={12}>
          <TwitterBadge {...state.twitter.userInfo} logout={() => social.twitterLogout()} />
        </Grid>}

    </Grid>
  );
}
