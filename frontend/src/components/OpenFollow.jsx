import React, { useContext } from 'react';
import Box from '@mui/material/Box';

import LoadingButton from '@mui/lab/LoadingButton';
import { Avatar } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar'
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/lab/Alert';
import { makeStyles } from '@mui/styles';
import { Paper } from '@mui/material';
import { SocialContext } from '../lib/socialInterface';

import MastodonLogin from './MastodonLogin';
import TwitterLogin from './TwitterLogin';





const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    flexDirection: 'column'
  },
  row: {
    flex: '0 1 auto',
    padding: theme.spacing(1),
    textAlign: 'center',
  },
  hog: {
    position: 'relative',
    flex: '1 1 auto',
    padding: theme.spacing(1),
    textAlign: 'center',
  },
  wrapper: {
    flexGrow: 1,
    height: 18,
    margin: theme.spacing(1),
    position: 'relative',
  },
  buttonProgress: {
    position: 'absolute',
    top: 0,
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  buttonCenter: {
    position: 'absolute',
    top: 0,
    marginTop: 12,
    width: '100%',
    left: 0
  },
  map: {
    height: 200
  },
  phoneticOutput: {
    minHeight: '4rem'
  },
  locationOverlay: {
    position: 'absolute',
    top: 80,
    width: '70%',
    left: '15%',
    zIndex: 1000
  },
  gridRef: {
    position: 'absolute',
    top: 25,
    width: '70%',
    right: '15%',
    background: 'rgba(255, 255, 255, 0.6)',
    zIndex: 1000
  },
  nearest: {
    position: 'absolute',
    top: 60,
    width: '70%',
    right: '15%',
    background: 'rgba(255, 255, 255, 0.6)',
    zIndex: 1000
  },
  accuracyOverlay: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    zIndex: 1000,
    background: 'rgba(255, 255, 255, 0.6)'
  }
}));



export default function OpenFollow(props) {
  const classes = useStyles();
  const state = useContext(SocialContext);

  console.log({ state });
  const list = state?.lists?.['followers']?.entries || [];


  return (
    <Grid container className={classes.root}>
      <Grid item xs={12} className={classes.row} data-testid="follows">
        <MastodonLogin />   <TwitterLogin />
        <Box
          sx={{ width: '100%', height: 400, bgcolor: 'background.paper' }}
        >
          {list.length > 0 && <>
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
              {list.map(contact => (
                <ListItem
                  key={contact.username}
                  secondaryAction={
                    <Checkbox
                      edge="end"
                    //onChange={handleToggle(value)}
                    //checked={checked.indexOf(value) !== -1}
                    //inputProps={{ 'aria-labelledby': labelId }}
                    />
                  }
                >
                  <ListItemAvatar><img src={contact.profile_image_url}/></ListItemAvatar>
                  <ListItemText id={contact.username} secondary={`@${contact.username}`} >
                    <Typography variant="subtitle1">{contact.name}</Typography>{contact.description}{contact?.matches?.length}
                    {contact.matches && contact.matches.forEach(m => (
                      <p><Avatar src={m.avatar} /><b>@{m.acct}</b> - {m.display_name}</p>))}
                  
                    </ListItemText>
                </ListItem>
              ))}
            </List>
          </>
          }
        </Box>

      </Grid>

    </Grid>
  );
};


