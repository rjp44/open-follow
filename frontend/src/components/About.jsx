import { Link as RouterLink, useNavigate } from 'react-router-dom';
import React from 'react';
import { makeStyles } from '@mui/styles';
import Dialog from '@mui/material/Dialog';
import Paper from '@mui/material/Paper';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import GitHubIcon from '@mui/icons-material/GitHub';
import Slide from '@mui/material/Slide';
import Link from '@mui/material/Link';

const useStyles = makeStyles((theme) => ({
  paper: {
    margin: theme.spacing(1),
    padding: theme.spacing(1),
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
  toolbar: theme.mixins.toolbar
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function About(props) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(true);
  const navigate = useNavigate();

  const handleClose = () => {
    setOpen(false);
    navigate(-1);
  };

  return (

    <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
      <AppBar className={classes.appBar}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleClose} component={RouterLink} to='/' aria-label="close">
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            About
            </Typography>
        </Toolbar>
      </AppBar>
      <div className={classes.toolbar} />
      <Paper className={classes.paper}>
        <Typography variant="body1">
          Open Follow is a web application that allows you to migrate your social graph between social media applications. In this release, it supports just one migration, which is from twitter to mastodon.
          Supporting migrations in the opposite direction, mastodon to twitter will be a further development, as will adding other applications.
        </Typography>
      </Paper>
      {false && <Paper display={false} className={classes.paper}>
        <Typography variant="h6">Source Code</Typography>
        <Typography variant="body1">
          This demo is hosted for convenience at <b>locus.plus</b>. The source code is available to anyone to use and modify under the very permissive BSD open source licence. You can download it here:
        </Typography>
        <Typography><GitHubIcon /><Link href="https://github.com/rjp44/locus-plus/" target="_blank" rel="noopener">rjp44/locus-plus</Link></Typography>
      </Paper>}
      <Paper className={classes.paper}>
        <Typography variant="h6">Privacy</Typography>
        <Typography variant="body1">
          To the greatest possible extent, this application does all of it's work client side. We don't want to collect any of your private information and do our best to make sure none of it is ever stored on our systems. For technical reasons, because of the way that both the twitter
          and mastodon APIs work, we have to do OAuth login and actually make API requests through server side code. We complete an OAuth login process, and then store the short term access token that you have authorised in an ephemeral session store on our servers and access it via an essential cookie that we set.
          We do not store a refresh token or access the API at all once you leave this web page. With the exception of information stored for short term debug purposes, we do dot capture or store any personally identifiable information persistently on our servers once your session on the website is complete.

        </Typography>
        </Paper>
      <Paper className={classes.paper}>
        <Typography variant="h6">Contact</Typography>
        <Typography variant="body1">
            <p>The author is <Link href="mailto:rob@pickering.org" target="_blank" rel="noopener">rob@pickering.org</Link>.</p>
            {false && (<p>If you are reporting issues or looking for enhancements then raise an issue on <Link href="https://github.com/rjp44/locus-plus/" target="_blank" rel="noopener">Github</Link>.</p>)}
        </Typography>

      </Paper>
    </Dialog>

  );
}