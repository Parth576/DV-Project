import { useState, useEffect } from 'react'
import * as d3 from 'd3';
import './App.css'
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import MainView from './components/MainView';
import { graphFilepaths } from './constants.js';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

/*
Custom edge types:
0 = email
1 = phone
2 = buy/sell
3 = travel
*/

function App() {

  const [dataStore, setDataStore] = useState({
    'template': null,
    //'candidate1': null,
    //'candidate2': null,
    //'candidate3': null,
    //'candidate4': null,
    //'candidate5': null,
  });
  const [filterObj, setFilterObj] = useState({
    'startTime': null,
    'endTime': null,
    'eType': null,
    'selectedNode':null
  })

  const startDate = new Date('2025-01-01T00:00:00');

  useEffect(()=>{
      try {
        Object.keys(dataStore).forEach(async (graphName) => {
            const data = await d3.csv(graphFilepaths[graphName], (d) => {
              return {
                'source': d.Source,
                'target': d.Target,
                'eType': d.eType,
                'weight': d.Weight,
                'time': new Date(startDate.getTime() + (d.Time*1000)),
              };
            });
            if (data) {
              setDataStore({
                ...dataStore,
                [graphName]: data
              });
            }
        })
      } catch(error) {
        console.log(error);
      }
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
