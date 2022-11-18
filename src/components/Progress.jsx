import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

/*
function Spinner(props) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress variant="determinate" {...{...props, value:(Math.round(parseInt(props.a)/parseInt(props.b)*100))}} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="caption" component="div" color="text.secondary">
          {`${props.a}`}
        </Typography>
      </Box>
    </Box>
  );
}
*/


export default function Progress(props) {
  let percent = {};
  
  ['global', 'task'].forEach(tier => (percent[tier] = Math.round(props?.status?.[tier]?.current / props?.status?.[tier]?.steps * 100)));
  return <Box sx={{flexGrow: 1}}>
    <div><Typography variant="subheading">{props.status.text}</Typography></div>
    <div>{!isNaN(percent.global) && !isNaN(percent.task) && <LinearProgress variant="buffer" value={percent.global} valueBuffer={percent.task} />}</div>
  </Box>

}