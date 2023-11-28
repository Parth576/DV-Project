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
    d3.select("#myMap svg").selectAll("*").remove();


    const dataStore = appState.getDataStore();
  

    var filtersOnMain=appState.getFilters();
   


    if(filtersOnMain.leftGraph==="template" || filtersOnMain.rightGraph==="template"){
        // console.log("template found", filtersOnMain.leftGraph, filtersOnMain.rightGraph)
      

        if(filtersOnMain.leftGraph === "template"){
            var tempColor="#704F4F";
            var pointColor="#F1A661";
            var pointsGraph=dataStore.rightGraph
        }
        else{
            var tempColor="#F1A661";
            var pointColor="#704F4F";
            var pointsGraph=dataStore.leftGraph
           
        }
      
        


        var opacityData = [
            { targetLocation: 3.0, count: 13 },
            { targetLocation: 4.0, count: 10 },
            { targetLocation: 0.0, count: 9 },
            { targetLocation: 1.0, count: 7 },
            { targetLocation: 2.0, count: 7 },
            { targetLocation: 5.0, count: 6 }
        ];

        var pointsGraph2 = pointsGraph.filter(data => data.eType === 3);
        
        drawMapNewChart(opacityData,pointsGraph2,tempColor,pointColor);

    }
    else{
        var pointsLeftData=dataStore.leftGraph.filter(data => data.eType === 3);
        var pointsRightData = dataStore.rightGraph.filter(data => data.eType === 3);
        drawMapNormalChart(pointsLeftData,pointsRightData);

    }

}

function drawMapNewChart(data,leftData,tempColor,pointColor){
    const svg = d3.select("#myMap svg");
    const width = vw(43.5);
    const height = vh(50);

    svg.attr("width", width)
   .attr("height", height);
//    console.log(data,leftData)
   

    // Map and projection
    const projection = d3.geoNaturalEarth1()
        .scale(width / 1.45 / Math.PI)
        .translate([width / 2, height / 2]);

       
        const countryIntMap = {
            3: 'USA',
            1: 'Italy',
            2: 'Brazil',
            0: 'Cuba',
            4: 'China',
            5: 'Canada',
        };

       
    const opacityScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count)])
        .range([0.3, 1]);

    const tooltip = d3.select("#mapTooltip");
    const tooltip2 = d3.select("#mapTooltipPoint");

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
            return countryData ? tempColor : '#c0c1c2'; // Grey for countries not in the data
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
                    .html(`${country}: ${countryData.count}`); // Adjust the positioning

                    
            }
        })
        .on("mouseout", function () {
            // Hide tooltip on mouseout
            tooltip.style("opacity", 0);
        });

        svg.append("g")
        .selectAll("circle")
        .data(leftData)
        .enter()
        .append("circle")
        .attr("cx", d => projection([d.targetLongitude, d.targetLatitude])[0]+vw(18)) // Use the projection to convert lat/long to x/y
        .attr("cy", d => projection([d.targetLongitude, d.targetLatitude])[1])
        .attr("r", 5) // Adjust the radius as needed
        .attr("fill", pointColor)
        .on("mouseover", function (event, d) {
            // Show tooltip with details
            tooltip2.style("opacity", 1)
                .html(`Target: ${d.target}`);
        })
        .on("mouseout", function () {
            // Hide tooltip on mouseout
            tooltip2.style("opacity", 0);
        });
    });
}


function drawMapNormalChart(data1,data2){

   
    // console.log(data1,data2)
    const svg = d3.select("#myMap svg");
    const width = vw(43.5);
    const height = vh(50);

    svg.attr("width", width)
   .attr("height", height);

   const projection = d3.geoNaturalEarth1()
   .scale(width / 1.45 / Math.PI)
   .translate([width / 2, height / 2]);

   const tooltip2 = d3.select("#mapTooltipPoint");

   d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then( function(worldData) {

    // Draw the map
    svg.append("g")
    .selectAll("path")
    .data(worldData.features)
    .join("path")
    .attr("fill", "#c0c1c2")
    .attr("d", d3.geoPath().projection(projection))
    .style("stroke", "#fff");

    svg.append("g")
    .selectAll("circle1")
    .data(data1)
    .attr("class","circle1")
    .enter()
    .append("circle")
    .attr("cx", d => { 
        return projection([d.targetLongitude, d.targetLatitude])[0]+vw(18)})
    .attr("cy", d => projection([d.targetLongitude, d.targetLatitude])[1])
    .attr("r", 5) // Set your desired radius
    .attr("fill", "#704F4F")
    .on("mouseover", function (event, d) {
        // Show tooltip with details
        tooltip2.style("opacity", 1)
            .html(`Target: ${d.target}`)
            .style("left", vw(event.pageX) + 10)
            .style("top", vh(event.pageY) - 10);
    })
    .on("mouseout", function () {
        // Hide tooltip on mouseout
        tooltip2.style("opacity", 0);
    });

    // Draw circles for data2
    svg.append("g")
    .selectAll("circle2")
    .attr("class","circle2")
    .data(data2)
    .enter()
    .append("circle")
    .attr("cx", d =>  { return projection([d.targetLongitude, d.targetLatitude])[0]+vw(17.5)})
    .attr("cy", d => projection([d.targetLongitude, d.targetLatitude])[1])
    .attr("r", 5) // Set your desired radius
    .attr("fill", "#F1A661")
    .on("mouseover", function (event, d) {
        // Show tooltip with details
        tooltip2.style("opacity", 1)
            .html(`Target: ${d.target}`)
            .style("left", vw(event.pageX) + 10)
            .style("top", vh(event.pageY) - 10);
    })
    .on("mouseout", function () {
        // Hide tooltip on mouseout
        tooltip2.style("opacity", 0);
    });
        
        
        
        })



}
export default drawMapChart;
