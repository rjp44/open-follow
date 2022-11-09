import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Autocomplete from '@mui/material/Autocomplete';
import LoadingButton from '@mui/lab/LoadingButton';
import MastodonBadge from './MastodonBadge';
import Mastodon from '../lib/mastodon';
import { makeStyles } from '@mui/styles';
import LoginIcon from '@mui/icons-material/Login';

let mastodon = new Mastodon();
const useStyles = makeStyles((theme) => { });

export default function MastodonLogin(props) {
  const classes = useStyles();
  const [mastodonServers, setMastodonServers] = useState([]);
  const [mastodonUrl, setMastodonUrl] = useState('');
  const [mastodonHost, setMastodonHost] = useState('');
  const [info, setInfo] = useState('');
  const [state, setState] = useState('initial');

  React.useEffect(() => {
    mastodon.getServers().then(servers => setMastodonServers(servers));
    setState(mastodon.state);
  }, []);

  React.useEffect(() => {
    mastodon.getUrl(mastodonHost).then(url => setMastodonUrl(url));
    (mastodon.state === 'showtime') && setState(mastodon.state);
  });

  React.useEffect(() => {
    setState('initial');
    setMastodonUrl('')
  },[mastodonHost]);

  React.useEffect(() => {
    if (state === 'authenticating')
      mastodon.startLogin().then(success => setState(success));
    if (state === 'showtime')
      mastodon.getUserInfo().then(info => setInfo(info));
  }, [state]);

  async function logout() {
    await mastodon.logout();
    setState('initial');
  }


  return (
    <Grid container className={classes.row}>
      {state !== 'showtime' &&
        (<>
          <Grid item xs={12}>
            <Autocomplete
              id="host"
            options={mastodonServers}
            value={mastodonHost}
              includeInputInList
              onChange={(event, newValue) => {
                setMastodonHost(newValue);
              }}
              renderInput={(params) => (
                <TextField {...params}
                  label="Mastodon Host"
                  placeholder="mastodon.social - your mastodon host"
                  variant="outlined"

                  InputProps={{
                    ...params.InputProps,
                    type: 'search',
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <LoadingButton variant="contained" href={mastodonUrl} target="_blank"
              onClick={() => setState('authenticating')}
              loading={state === 'authenticating'}
            disabled={state === 'showtime' || mastodonUrl === ''}
          >Login to Mastodon
          <LoginIcon />  
          </LoadingButton>

          </Grid>
        </>)
      }
      {state === 'showtime' &&
        <Grid item xs={12}>
          <MastodonBadge {...info} logout={logout}/>
       </Grid>}

    </Grid>
  );
}
