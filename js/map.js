import appState from './main.js';

function vh(percent) {
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    return (percent * h) / 100;
}
  
function vw(percent) {
    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    return (percent * w) / 100;
}

function drawMapChart() {

    const dataStore = appState.getDataStore();
    console.log(dataStore)

    const svg = d3.select("#myMap svg");
    const width = vw(43.5);
    const height = vh(50);

    svg.attr("width", width)
   .attr("height", height);
   

    // Map and projection
    const projection = d3.geoNaturalEarth1()
        .scale(width / 1.45 / Math.PI)
        .translate([width / 2, height / 2]);

       

        const data = [
            { targetLocation: 5, count: 30 },
            { targetLocation: 0, count: 30 },
            { targetLocation: 4, count: 25 },
            { targetLocation: 1, count: 10 },
            { targetLocation: 3, count: 10 },
            { targetLocation: 2, count: 5 }
        ];
        
        const countryIntMap = {
            0: 'USA',
            1: 'Italy',
            2: 'Brazil',
            3: 'Cuba',
            4: 'China',
            5: 'Canada',
        };


    const opacityScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count)])
        .range([0.3, 1]);

    const tooltip = d3.select("#mapTooltip");

    // Load external data and boot
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then( function(worldData) {

        // Draw the map
        svg.append("g")
        .selectAll("path")
        .data(worldData.features)
        .join("path")
        .attr("fill", d => {
            const country = d.properties.name;
            const countryData = data.find(item => countryIntMap[item.targetLocation] === country);
            return countryData ? "#3876BF" : '#c0c1c2'; // Grey for countries not in the data
        })
        .style("opacity", d => {
            const country = d.properties.name;
            const countryData = data.find(item => countryIntMap[item.targetLocation] === country);
            return countryData ? opacityScale(countryData.count) : 0.3; // Set default opacity for countries not in the data
        })
        .attr("d", d3.geoPath().projection(projection))
        .style("stroke", "#fff")
        .on("mouseover", function (event, d) {
            const country = d.properties.name;
            const countryData = data.find(item => countryIntMap[item.targetLocation] === country);
            if (countryData) {
                // Show tooltip with count
                tooltip.style("opacity", 1)
                    .html(`${country}: ${countryData.count}`)
                    .style('left', vw(event.pageX))
                    .style('top', vh(event.pageY)); // Adjust the positioning
            }
        })
        .on("mouseout", function () {
            // Hide tooltip on mouseout
            tooltip.style("opacity", 0);
        });

            

})


}
export default drawMapChart;
