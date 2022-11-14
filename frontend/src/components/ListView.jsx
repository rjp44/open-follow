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
import excerptHtml from 'excerpt-html';

import MastodonLogin from './MastodonLogin';
import TwitterLogin from './TwitterLogin';





const useStyles = makeStyles((theme) => ({
}));



export default function ListView(props) {
  const classes = useStyles();
  const { list } = props;



  return (
    <Grid container className={classes.root}>
      <Grid item xs={12} className={classes.row} data-testid="follows">
        <Box
          sx={{ width: '100%', height: 400, bgcolor: 'background.paper' }}
        >
          {list.length > 0 && <>
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
              {list.filter(c => c.matches).map(contact => (
                <>
                  <ListItem>
                    <ListItemAvatar><Avatar src={contact.profile_image_url} /></ListItemAvatar>
                    <ListItemText id={contact.username} secondary={`@${contact.username}`} >
                      <Typography variant="subtitle1">{contact.name}</Typography>{contact.description}
                    </ListItemText>
                  </ListItem>
 
                  {contact?.matches?.length && (
                    <List component="div" disablePadding>
                      {contact.matches.map(m => (
                        <ListItem sx={{ pl: 10 }} key={m.acct}
                          secondaryAction={
                            <Checkbox
                              edge="end"
                            //onChange={handleToggle(value)}
                            //checked={checked.indexOf(value) !== -1}
                            //inputProps={{ 'aria-labelledby': labelId }}
                            />
                          }
                        >
                          <ListItemAvatar><Avatar src={m.avatar} /></ListItemAvatar>
                          <ListItemText id={m.acct} secondary={`@${m.acct}`} >
                            <Typography variant="subtitle1">{m.display_name}</Typography>{excerptHtml(m.note)}
                          </ListItemText>
                        </ListItem>
                      )
                      )}
                    </List>
                  )}
     
                </>
              ))}
            </List>
          </>
          }
        </Box>

      </Grid>

    </Grid>
  );
};


