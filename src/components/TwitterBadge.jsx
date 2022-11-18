import { useContext } from 'react';
import { makeStyles } from '@mui/styles';

import { Avatar } from '@mui/material';
import { SocialContext } from '../lib/socialInterface';



const useStyles = makeStyles((theme) => ({
  accountHeader: {
    width: '200px',
    display: 'flex',
    fontSize: '15px',
    lineHeight: '18px',
    boxSizing: 'border-box',
    padding: '10px 0',
    margin: '10px 10px 10px',
    border: '1px solid #282c37',
    borderBottom: '2px solid #282c37',
    background: '#fff',
    fontFamily: '"mastodon-font-sans-serif", sans-serif',
    fontWeight: 400,
    color: 'rgb(15, 20, 25)',
    texRendering: 'optimizelegibility',
    fontFeatureSettings: "kern",
    borderRadius: '10px',
    textAlign: 'center',
  },
  avatar: {
    width: '30px',
    height: '30px',
    marginRight: '10px',
    marginLeft: '10px'
  },
  name: {
    flex: '1 1 auto',
    width: 'calc(100% - 90px)',
    margin: 0,
    padding: 0,
    border: 0,
    font: 'inherit',
    fontWeight: 700,
    verticalAlign: 'baseline',
  },
  username: {
    //display: 'block',
    fontSize: '15px',
    fontWeight: 400,
    textOverflow: 'ellipsis',
    overflow: 'hidden'
  },
}));

export default function TwitterBadge(props) {
  const classes = useStyles();
  const state = useContext(SocialContext);

  const user = state?.twitter?.userInfo;

  return (
    <>
      {user && <div className={classes.accountHeader}>
        <div className={classes.avatar}><Avatar src={user.profile_image_url} className={classes.avatar} /></div>
        <div className={classes.name}>
          <div className={classes.username}>@{user.username}</div>
          <div>{user.name}</div>
        </div>
      </div>
      }
    </>
  );

}