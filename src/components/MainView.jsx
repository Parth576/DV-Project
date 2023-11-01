import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';

export default function MainView() {
    return (
        <Box sx={{ flexGrow: 1, textAlign:"center"}}>
            <Grid container spacing={2}>
                <Grid item lg={8}>
                    <Paper elevation={3} sx={{height: "200px"}}>
                        Stream Graph
                        {/* Add stream graph component */}
                        </Paper>
                </Grid>
            <Grid item lg={4}>
                <Paper elevation={3} sx={{height: "200px"}}>
                    Pie Chart
                    {/* Add pie chart component */}
                    </Paper>
            </Grid>
            <Grid item lg={12}>
                <Paper elevation={3}sx={{height: "600px"}}>
                    Network View
                    {/* Add network view component */}
                    </Paper>
            </Grid>
            </Grid>
    </Box>
    )
}