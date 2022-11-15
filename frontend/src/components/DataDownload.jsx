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
      let json = JSON.stringify(props.data);
      let blob = new Blob([json], { type: "text/json" });
      setDataUrl(window.URL.createObjectURL(blob));
      setLoading(false);
    }
  }
 


  return (
    <Tooltip title="prepare a download of all your data" arrow>
      <LoadingButton href={dataUrl} onClick={prepareData} loading={loading} variant="contained" endIcon={<FileDownloadIcon />}>
        {!dataUrl && 'Start Download'}
        {!!dataUrl && 'Download Now'}
      </LoadingButton>
    </Tooltip>
  )


}