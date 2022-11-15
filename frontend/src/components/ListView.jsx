import React, { useState } from 'react';
import Box from '@mui/material/Box';

import LoadingButton from '@mui/lab/LoadingButton';
import { Avatar } from '@mui/material';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListSubheader from '@mui/material/ListSubheader';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/lab/Alert';
import { makeStyles } from '@mui/styles';
import { Paper } from '@mui/material';
import { SocialContext } from '../lib/socialInterface';
import excerptHtml from 'excerpt-html';

import MastodonLogin from './MastodonLogin';
import TwitterLogin from './TwitterLogin';
import SelectAllControl from './SelectAllControl';






const useStyles = makeStyles((theme) => ({
  saveButton: {
    flexGrow: 1,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  }
}));



export default function ListView(props) {
  const classes = useStyles();
  const { list, name } = props;

  let count = list && list?.entries?.length;
  let matchCount = list.entries.filter(c => c.matches).reduce((o, contact) => (o + contact?.matches?.length), 0);



  return (<>
          {list.entries.length > 0 &&
      <List sx={{ width: '100%', bgcolor: 'background.paper', display: 'block', position: 'relative', maxHeight: props.listHeight, overflow: 'auto', '& ul': { padding: 0 },  bgcolor: '#aaffaa' }}
              subheader={<li />}>
        <ListSubheader>
          <Toolbar>
            <Typography variant="subheading">Found {count} {name}{count && `, ${matchCount} matches`} {list.xrefed !== 'done' && `(still looking)`}</Typography>
            <Button color="inherit" variant="contained" sx={{ flexGrow: 1, ml: 10, mr: 10 }}>Save Selected to Mastodon</Button>
            <SelectAllControl {...props} />
          </Toolbar>
          
              </ListSubheader>
              {list.entries.filter(c => c.matches).map(contact => (
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
                              onChange={(event) => props.select({ listName: name, contact: contact.username, acct: m.acct }, event.target.checked)}
                            checked={!!m.selected}
                            inputProps={{ 'aria-label': 'controlled' }}
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

    }
  </>
  );
};


