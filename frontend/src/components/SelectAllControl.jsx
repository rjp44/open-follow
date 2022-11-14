import { useContext } from 'react';
import { makeStyles } from '@mui/styles';
import { Box, Tooltip, Switch } from '@mui/material';




const useStyles = makeStyles((theme) => ({
 
}));

export default function SelectAllControl(props) {
  const classes = useStyles();

  return (

    <Box sx={{ flexGrow: 0 }}>
      <Tooltip title="Select all suggestions (unselect to select manually">
        <Switch label='Select all'/>
      </Tooltip>
    </Box>
  );

}