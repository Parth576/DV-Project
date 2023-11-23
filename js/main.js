const startDate = new Date('2025-01-01T00:00:00');
var data;

async function convertData(path){
    const newData = await d3.csv(path, (d)=> {

        return{
            
            'source': d.Source,
            'target': d.Target,
            'eType': d.eType,
            'weight': d.Weight,
            'time': new Date(startDate.getTime() + (d.Time*1000)),

        }
    })
    return newData;
}

document.addEventListener('DOMContentLoaded', function () {
    // Hint: create or set your svg element inside this function
 
    // This will load your two CSV files and store them into two arrays.
    Promise.all([convertData('data/processed/CGCS-Template-Processed-data.csv')])
         .then(function (values) {
             console.log('loaded Data');
             data = values[0];

             
            
 
             // Hint: This is a good spot for doing data wrangling
 
 
             drawNetworkChart();
         });
 });
 
 // Use this function to draw the network chart.
 function  drawNetworkChart() {
     console.log('trace:drawNetworkpChart()');
     console.log(data)
 }