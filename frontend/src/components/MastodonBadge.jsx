import { makeStyles } from '@mui/styles';
import LogoutIcon from '@mui/icons-material/Logout';
import { IconButton } from '@mui/material';
import { Avatar } from '@mui/material';



const useStyles = makeStyles((theme) => ({
  accountHeader: {
    width: '400px',
    display: 'flex',
    fontSize: '13px',
    lineHeight: '18px',
    boxSizing: 'border-box',
    padding: '10px 0',
    margin: '40px auto 10px',
    borderBottom: '1px solid #282c37',
    background: '#191b22',
    fontFamily: '"mastodon-font-sans-serif", sans-serif',
    fontWeight: 400,
    color: '#fff',
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

  return (
    <>
    <div className={classes.accountHeader}>
      <div className={classes.avatar}><img src="/assets/mastodon_icon.svg" className={classes.avatar} alt="Mastodon avatar"/></div>
      <div className={classes.avatar}><Avatar src={props.avatar} className={classes.avatar} /></div>
      <div className={classes.name}>
        Signed in as: <span className={classes.username}>@{props.username}</span>
      </div>
        <IconButton aria-label="logout"  color="primary" onClick={() => props.logout()}><LogoutIcon /></IconButton>
    </div>

    </>
  );

}