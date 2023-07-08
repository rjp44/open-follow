import React, { useContext } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';




export default function DialogShuttered(props) {


  return (

    <Dialog open={props.open}>
      <DialogTitle>This application is now blocked</DialogTitle>
      <DialogContent>
        <DialogContentText>
          In May 2023 the twitter API access that this application relies on stopped working. We haven't been told why, but I guess this is the end of the road.
        </DialogContentText>
      </DialogContent>
    </Dialog>
  );
}
