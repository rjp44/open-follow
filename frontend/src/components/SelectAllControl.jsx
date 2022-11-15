import { useContext, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { Checkbox, Button, IconButton, Menu, MenuItem, Box, Tooltip, Switch } from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';




const useStyles = makeStyles((theme) => ({

}));

export default function SelectAllControl(props) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const select = (select => {
    // props.selectAll(select);
    props.selectAll(select);
    handleClose();
  });

  let open = Boolean(anchorEl);

  console.log({ open, anchorEl });

  return (

    <div>
      <Tooltip title="Select all suggestions (unselect to select manually">
        <IconButton
          id="select-all"
          aria-controls={open ? 'select-all' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}>
          <CheckBoxOutlineBlankIcon />

        </IconButton>

      </Tooltip>
      <Menu
        id="select-all-menu"
        aria-labelledby="select-all"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <MenuItem onClick={() => select(true)}>Select All</MenuItem>
        <MenuItem onClick={() => select(false)}>Deselect All</MenuItem>
      </Menu>
    </div>
  );

}