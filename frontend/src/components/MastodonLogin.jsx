import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Autocomplete from '@mui/material/Autocomplete';
import LoadingButton from '@mui/lab/LoadingButton';
import Mastodon from '../lib/mastodon';
import { makeStyles } from '@mui/styles';

let mastodon = new Mastodon();
const useStyles = makeStyles((theme) => { });

export default function MastodonLogin(props) {
  const classes = useStyles();
  const [mastodonServers, setMastodonServers] = useState([]);
  const [mastodonUrl, setMastodonUrl] = useState('');
  const [mastodonHost, setMastodonHost] = useState('');
  const [info, setInfo] = useState('');
  const [state, setState] = useState('');

  React.useEffect(() => {
    mastodon.getServers().then(servers => setMastodonServers(servers));
  }, []);

  React.useEffect(() => {
    mastodon.getUrl(mastodonHost).then(url => setMastodonUrl(url));
    console.log({info});
  });

  React.useEffect(() => {
    if (state === 'authenticating')
      mastodon.getUserInfo().then(info => setInfo(info));
  }, [state]);


  return (
    <Grid container className={classes.row}>
      <Grid item xs={12}>
        <Autocomplete
          id="host"
          freeSolo
          options={mastodonServers}
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
          disabled={mastodonUrl === ''}
        >Login to Mastodon</LoadingButton>

      </Grid>
    </Grid>
  );
}
