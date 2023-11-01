import { useState, useEffect } from 'react'
import './App.css'
import Example from './components/Example';
import { csvParse } from 'd3-dsv';
import './App.css'
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import MainView from './components/MainView';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});



function App() {

  const [count, setCount] = useState(1);
  const [templateData, setTemplateData] = useState(null);
  const [filterObj, setFilterObj] = useState({
    'startTime': null,
    'endTime': null,
    'eType': null,
    'selectedNode':null
  })

  useEffect(()=>{
    csvParse('/data/processed/CGCS-Template-Processed-data')
  },[]);

  return (
    <div>
      <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, mx:"1em", my:"2em" }}>
        <Grid container spacing={2}>
          <Grid item lg={6}>
           <MainView />
          </Grid>
          <Grid item lg={6}>
            <MainView />
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
    </div>
      
  )
}

export default App
