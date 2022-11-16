import { useState } from 'react';
import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import certaintyChips from './CertaintyChips';





export default function SelectAllControl(props) {
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
        {certaintyChips.map((chip, index) => (
          chip !== undefined && <MenuItem onClick={() => select((acct) => (acct.certainty.tier === index))}>Select All&nbsp;{chip}</MenuItem>
        ))}
        <MenuItem onClick={() => select(false)}>Deselect All</MenuItem>
      </Menu>
    </div>
  );

}