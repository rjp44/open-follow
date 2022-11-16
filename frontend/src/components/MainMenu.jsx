import React from 'react';

import { IconButton, MenuItem, Menu} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link as RouterLink } from 'react-router-dom';

import OpenFollow from './OpenFollow';
import About from './About';

export let paths = {
  '/': { title: 'openFollow', exact: true, element: <OpenFollow />},
  '/about': { title: 'About', element: <About /> }
}


export default function MainMenu() {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <IconButton aria-controls="main-menu" aria-haspopup="true" onClick={handleClick} edge="start" color="inherit" aria-label="menu">
        <MenuIcon />
      </IconButton>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {Object.entries(paths).map(([key, value]) =>
          <MenuItem onClick={handleClose} component={RouterLink} to={key} key={key}>
            {value.title}
          </MenuItem>
        )}
      </Menu>
    </div>
  );
}

