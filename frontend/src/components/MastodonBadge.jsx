import { useContext } from 'react';
import { makeStyles } from '@mui/styles';
import LogoutIcon from '@mui/icons-material/Logout';
import { IconButton } from '@mui/material';
import { Avatar } from '@mui/material';
import SocialInterface, { SocialContext } from '../lib/socialInterface';



const useStyles = makeStyles((theme) => ({
  accountHeader: {
    width: '350px',
    display: 'flex',
    position: 'relative',
    fontSize: '13px',
    lineHeight: '18px',
    boxSizing: 'border-box',
    padding: '10px 0',
    margin: '10px 10px 10px',
    borderBottom: '1px solid #282c37',
    background: '#191b22',
    fontFamily: '"mastodon-font-sans-serif", sans-serif',
    fontWeight: 400,
    color: '#fff',
    texRendering: 'optimizelegibility',
    fontFeatureSettings: "kern",
    borderRadius: '10px',
    textAlign: 'center',
  },
  avatar: {
    width: '40px',
    height: '40px',
    marginRight: '10px',
    marginLeft: '10px'
  },
  name: {
    flex: '1 1 auto',
    color: '#d9e1e8',
    width: 'calc(100% - 130px)',
    margin: 0,
    padding: 0,
    border: 0,
    font: 'inherit',
    fontSize: '13px',
    verticalAlign: 'baseline',
  },
  username: {
    //display: 'block',
    fontSize: '13px',
    fontWeight: 700,
    textOverflow: 'ellipsis',
    overflow: 'hidden'
  },
}));

export default function MastodonBadge(props) {
  const classes = useStyles();
  const state = useContext(SocialContext);
  const social = new SocialInterface();

  const user = state.mastodon.userInfo;

  return (
    <>
      {user && <div className={classes.accountHeader}>
        <div className={classes.avatar}><img src="/assets/mastodon_icon.svg" className={classes.avatar} alt="Mastodon avatar" /></div>
        <div className={classes.avatar}><Avatar src={user.avatar} className={classes.avatar} /></div>
        <div className={classes.name}>
          <div className={classes.username}>@{user.username}@{state.mastodon.host}</div>
          <div>{user.display_name}</div>
        </div>
        <IconButton aria-label="logout" color="primary" onClick={() => social.mastodonLogout()}><LogoutIcon /></IconButton>
      </div>
      }
    </>
  );

}