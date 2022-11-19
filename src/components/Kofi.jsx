import KofiButton from "kofi-button";
import { Box } from "@mui/system";

export default function Kofi(props) {

  return <Box {...props}>
    {false && <KofiButton kofiID={props.id} title={props.text} />}
  </Box>;
}