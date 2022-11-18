import { useState } from 'react';
import {  Tooltip } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

export default function DataDownload(props) {
  const [dataUrl, setDataUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  function prepareData() {
    if (!dataUrl) {
      setLoading(true);
      let blob = new Blob([JSON.stringify(props.data, null, 2)], { type: "application/json" });
      
      setDataUrl(URL.createObjectURL(blob));
      setLoading(false);
    }
  }
 
  return (
    <Tooltip title="prepare a download of all your data" arrow>
      <LoadingButton href={dataUrl} download="open-follow-data.json" onClick={prepareData} loading={loading} variant="contained" endIcon={<FileDownloadIcon />}>
        {!dataUrl && 'Download my Data'}
        {!!dataUrl && 'Download Now'}
      </LoadingButton>
    </Tooltip>
  )


}