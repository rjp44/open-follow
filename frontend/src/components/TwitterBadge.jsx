import { makeStyles } from '@mui/styles';
import LogoutIcon from '@mui/icons-material/Logout';
import TwitterIcon from '@mui/icons-material/Twitter';
import { IconButton } from '@mui/material';
import { Avatar } from '@mui/material';



const useStyles = makeStyles((theme) => ({
  accountHeader: {
    width: '400px',
    display: 'flex',
    fontSize: '15px',
    lineHeight: '18px',
    boxSizing: 'border-box',
    padding: '10px 0',
    margin: '40px auto 10px',
    border: '1px solid #282c37',
    borderBottom: '2px solid #282c37',
    background: '#fff',
    fontFamily: '"mastodon-font-sans-serif", sans-serif',
    fontWeight: 400,
    color: 'rgb(15, 20, 25)',
    texRendering: 'optimizelegibility',
    fontFeatureSettings: "kern",
    borderRadius: '10px'
  },
  avatar: {
    width: '40px',
    height: '40px',
    marginRight: '10px',
    marginLeft: '10px'
  },
  name: {
    flex: '1 1 auto',
    width: 'calc(100% - 130px)',
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

export default function MastodonBadge(props) {
  const classes = useStyles();

  return (
    <>
    <div className={classes.accountHeader}>
      <div className={classes.avatar}><TwitterIcon color="blue"/></div>
      <div className={classes.avatar}><Avatar src={props.avatar} className={classes.avatar} /></div>
      <div className={classes.name}>
          <div className={classes.username}>@{props.username}</div>
          <div>{props.name}</div>
      </div>
        <IconButton aria-label="logout"  color="primary" onClick={() => props.logout()}><LogoutIcon /></IconButton>
    </div>

    </>
  );

}