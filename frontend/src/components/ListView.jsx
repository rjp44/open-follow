import React from 'react';

import { Avatar } from '@mui/material';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListSubheader from '@mui/material/ListSubheader';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import LockIcon from '@mui/icons-material/Lock';
import { makeStyles } from '@mui/styles';
import excerptHtml from 'excerpt-html';

import SelectAllControl from './SelectAllControl';
import certaintyChips from './CertaintyChips';
import { Progress } from './Progress';



const useStyles = makeStyles((theme) => ({
  strongMatch: {
    color: theme.palette.success.dark
  },
  match: {
    color: theme.palette.success.light
  },
  weakMatch: {
    color: theme.palette.info.light
  },
  certaintyContainer: {
    display: 'flex',
    WebkitBoxPack: 'start',
    MsFlexPack: 'start',
    WebkitJustifyContent: 'flex-start',
    justifyContent: 'flex-start',
    WebkitAlignItems: 'center',
    WebkitBoxAlign: 'center',
    MsFlexAlign: 'center',
    alignItems: 'center',
    position: 'relative',
    WebkitTextDecoration: 'none',
    textDecoration: 'none',
    width: '100%',
    boxSizing: 'border-box',
    textAlign: 'left',
    paddingTop: '8px',
    paddingBottom: '8px',
    paddingLeft: '16px',
    paddingRight: '48px',
  },
  certaintyText: {
    position: 'relative',
    display: 'block',
    marginRight: theme.spacing(1),
    flexGrow: 0,
  },
  certaintyChip: {
    position: 'relative',
    display: 'block',
    flexGrow: '1',
    marginLeft:10
  }

}));


function HandleWithCertainty(props) {
  const classes = useStyles();

  return <div className={classes.certaintyContainer} >
    <div className={classes.certaintyText}>
      <Typography variant="body2">@{props.handle}
        {props.certainty?.desc && ` - ${props.certainty.desc}`}
      </Typography>

    </div>
    {props.certainty?.tier &&
      <div classNme={classes.certaintyChip}>{certaintyChips[props.certainty.tier]}
      </div>}
  </div>;


}


export default function ListView(props) {

  const { list, name } = props;

  let count = list && list?.entries?.length;
  let matchCount = list.entries.filter(c => c.matches).reduce((o, contact) => (o + contact?.matches?.length), 0);
  let selectedCount = list.entries.filter(c => c.matches).reduce((o, contact) => (o + contact?.matches?.filter(m => m.selected)?.length), 0);

  console.log({ selectedCount });

  return (<>
    {list.entries.length > 0 &&
      <List sx={{ width: '100%', bgcolor: 'background.paper', display: 'block', position: 'relative', maxHeight: props.listHeight, overflow: 'auto', '& ul': { padding: 0 } }}
        subheader={<li />}>
        <ListSubheader>
          <Toolbar>
            <Typography variant="subheading">Found {count} {name}{count && `, ${matchCount} matches`} {list.xrefed !== 'done' && <Progress a={list.xrefCount || 0}  b={count} />}</Typography>
            <Button onClick={() => props.saveList(name)}  disabled={selectedCount === 0} variant="contained" sx={{ flexGrow: 1, ml: 10, mr: 10 }}>Save Selected to Mastodon</Button>
            <SelectAllControl {...props} />
          </Toolbar>

        </ListSubheader>
        {list.entries.filter(c => c.matches).map(contact => (
          <>
            <ListItem sx={{ bgcolor: '#eeeeee' }} id={contact.username} >
              <ListItemAvatar ><Avatar src={contact.profile_image_url} /></ListItemAvatar>
              <ListItemText secondary={`@${contact.username}`} >
                <Typography variant="subtitle1">{contact.name}</Typography>{contact.description}
              </ListItemText>
            </ListItem>

            {contact?.matches?.length && (
              <List component="div" disablePadding>
                {contact.matches.map(m => (
                  <ListItem sx={{ pl: 10 }} key={`${contact.username}-${m.acct}`}
                    secondaryAction={
                      !m.alreadyFollowing && <Checkbox
                        edge="end"
                        onChange={(event) => props.select({ listName: name, contact: contact.username, acct: m.acct }, event.target.checked)}
                        checked={!!m.selected}
                        inputProps={{ 'aria-label': 'controlled' }}
                      />
                    }
                  >
                    <ListItemAvatar><Avatar src={m.avatar} /></ListItemAvatar>
                    <ListItemText id={m.acct}>
                      <Typography variant="subtitle1">{m.display_name}  {m.locked && <LockIcon />} {m.alreadyFollowing && <Chip size="small" label="currently following" />}</Typography>
                      {excerptHtml(m.note)}
                      <HandleWithCertainty handle={m.acct} certainty={m.certainty} />
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


