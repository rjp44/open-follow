import KofiButton from "kofi-button";
import { Box } from "@mui/system";

export default function Kofi(props){ 

  return <Box {...props}>
    {!props.disabled && <KofiButton kofiID={props.id} title={props.text} />}
  </Box>;
}