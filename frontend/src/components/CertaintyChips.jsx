import Chip from "@mui/material/Chip";
const certaintyChips  = [
  undefined, // no tier zero for now
  <Chip label="very strong" size="small" color="success" />,
  <Chip label="strong" size="small" color="success" />,
  <Chip label="weak" size="small" color="warning" />,
];

export default certaintyChips;
