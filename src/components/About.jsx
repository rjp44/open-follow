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
import Kofi from './Kofi';

const useStyles = makeStyles((theme) => ({
  paper: {
    margin: theme.spacing(1),
    padding: theme.spacing(1),
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
  toolbar: theme.mixins.toolbar,
  donateFrame: {
    border: 'none',
    width: '100%',
    padding: '4px',
    background: '#f9f9f9',
    height: 712
  }
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
          <Kofi id="robpickering" text="Donate" sx={{ flexGrow: 1 }} />
        </Toolbar>
      </AppBar>
      <div className={classes.toolbar} />
      <Paper className={classes.paper}>

        <Typography variant='h5'>openFollow</Typography>
        <Typography variant="body1">
          ... is a web application that allows you to migrate your social graph between social media applications. It currently supports just one migration, twitter to mastodon.
        </Typography>
        <Typography variant="h6">Status</Typography>
        <Typography variant="body1">
          I've released this out of the door way too early due to the current state of affairs at the birdsite and it is probably buggy as hell. In particular I don't have access to an account with 10s of thousands of followers/following to test with so it is likely that it will blow up badly on very prominent accounts (!).
          It shouldn't cause any problems in a bad way, just take forever to fetch long follower lists and maybe crash out with errors. While we are on that topic...
          </Typography>
          <Typography variant="h6">Performance and rate limits</Typography>
          <Typography variant="body1">
            Twitter very aggressively rate limit their API access to around 15 requests per 15 minutes. We work around that by making as small a number of very large page size requests as we can, but if you have 10k plus followers or following, at the very best it will take ages to pull all of your contact, and most likely the app will bomb out when we get responses we haven't been able to test for.
          </Typography>
          <Typography>
            Of course if anyone wants to loan me a huge twitter account to play with, I promise I will take very good care of it...
          </Typography>
          <Typography>
            On Mastodon, we run API requests against your own home server. We try to play nicely and stay well under the API rate limits the servers declare as the last thing anyone trying to run a Mastodon server running right now needs is this application hammering them. That means that cross referencing your twitter data takes a while, but just chill out and let the app do it's stuff. The status updates under the lists tab should update
            to show you it is still alive.
        </Typography>
        <Typography variant="h6">Saving data</Typography>
        <Typography> Any time after the initial twitter data load has happened, you can grab a JSON dump of your twitter relationships using the Download Button top right. As this starts to be augmented with data from Mastodon that will also be included in the dump, but you don't need to wait if you are worried bout twitter going down <b><i>now</i></b>. The UI updates dynamically as data is loaded, but you
        can start selecting follower/followees that you want to follow on your Mastodon instance as soon as the UI starts to populate. It may even be a good thing to add following relationships on Mastodon in batches.</Typography>

      </Paper>
      <Paper className={classes.paper}>
        <Typography variant="h6">Privacy</Typography>
        <Typography variant="body1">
          To the greatest possible extent, this application does all of it's work client side.</Typography>
        <Typography variant="body1">We don't want to collect any of private information and do our best to make sure none of it is ever stored on our systems. For technical reasons, because of the way that both the twitter
          and mastodon APIs work, we have to do OAuth login and actually make API requests through server side code. We complete an OAuth login process, and then store the short term access token that you have authorised in an ephemeral session store on our servers and access it via an essential cookie that we set.</Typography>
        <Typography variant="body1">
          We do not store a refresh token or access the API at all once you leave this web page. With the exception of information stored for short term debug purposes, we do dot capture or store any personally identifiable information persistently on our servers once your session on the website is complete.
        </Typography>

        <Typography variant="h6">Data controller and notices</Typography>
        <Typography variant="body1">
          The operator of this site and data controller is:<br />
          Aplisay Ltd<br />
          86-90 Paul Street<br />
          London<br />
          EC2A 4NE<br />
          United Kingdom<br />
          +44(0)3300887491
        </Typography>
        <Typography variant="body1">

          Under data protection laws you have rights in relation to your personal data that include the right to request access, correction, erasure, restriction, transfer, to object to processing.
        </Typography>
        <Typography variant="body1">
          You can see more about these rights at:

          <a href="https://ico.org.uk/for-organisations/guide-to-the-general-data-protection-regulation-gdpr/individual-rights/">https://ico.org.uk/for-organisations/guide-to-the-general-data-protection-regulation-gdpr/individual-rights/</a>
        </Typography>
        <Typography variant="body1">

          If you believe we do hold any personal data and wish to exercise any of the rights set out above, please email <a href="mailto:hello@aplisay.uk?Subject=GDPR+Subject+Access+Request">hello@aplisay.uk</a>
          <Typography variant="body1">
            Please do not use this contact information for general enquiries about the application, this is purely the legal entity bankrolling running the service and putting it's GDPR neck on the line. 
          </Typography>
        </Typography>

      </Paper>
      <Paper className={classes.paper}>
        <Typography variant="h6">Contact</Typography>
        <Typography variant="body1">
          The author is <Link href="https://infosec.exchange/@robx0a" target="_blank" rel="noopener">@robx0a@infosec.exchange</Link>.
        </Typography>
        <Typography variant="body1">
          My intention was and is to Open Source the code for this implementation at some stage. It really needs a good tidy up and some major areas re-factored from what I learned about the APIs before I will kill any respect that anyone has for me by doing that right now. It has been hacked together far too quickly and I need sleep first.
        </Typography>
        <Typography variant="body1">
          Once that happens, there will be a github issues list an I will probably start accepting PRs.
          </Typography>
      </Paper>
    </Dialog>

  );
}