import {useState } from 'react';

import { Button, MenuItem, Menu} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import OpenFollow from './OpenFollow';
import About from './About';

export let paths = {
  '/': { title: 'openFollow', exact: true, element: <OpenFollow />},
  '/about': { title: 'About', element: <About /> }
}


export default function MainMenu() {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleClick = (event) => {
    navigate('/about');
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Button aria-controls="main-menu" variant="contained" aria-haspopup="true" onClick={handleClick} edge="start" aria-label="menu" endIcon={<InfoIcon />}>
        About
      </Button>
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

