import React, { useState } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/material/styles';
import LeafletMap from './LeafletMap';
import GeoInput from './MastodonLogin';

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
  map: {
    height: 200
  },
  gridRef: {
    position: 'absolute',
    top: 25,
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




export default function Console(props) {
  const classes = useStyles();
  const [location, setLocation] = useState(0);



  return (
    <Grid container className={classes.root}>
      <Grid item xs={12} className={classes.row} data-testid="phonetic">
        <GeoInput setLocation={setLocation}/>
      </Grid>
      <Grid item xs={12} className={classes.hog}>
        {location?.latitude ?
          <LeafletMap
            latitude={location.latitude}
            longitude={location.longitude}
            plusCode={location.plusCode}
            osGridRef={location.osGridRef}
            mapLinks={true}
            accuracy={0} />
          : <div>
            <Typography variant="h6">Enter a valid location string in the input area above to see a map location</Typography>
            <Typography variant="body1">This can be a short pluscode from the locator app with completions like:<br />
              <b>G8+7GV, Hoxton, England</b>,<br />
              a long pluscode like:<br />
              <b>85GCQ2XF+C84</b><br />
              or an OS Grid reference like:<br />
              <b>NS 01823 35892</b>.
            </Typography>
            </div>}
        {location?.osGridRef && <div className={classes.gridRef}><Typography variant="h6">OS Grid Ref: <b>{location.osGridRef}</b></Typography></div>}
      </Grid>
    </Grid>
  );


  
}