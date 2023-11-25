import appState from './main.js';

function vh(percent) {
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    return (percent * h) / 100;
}
  
function vw(percent) {
    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    return (percent * w) / 100;
}

function drawBarChart(person1, person2) {
    const dataStore = appState.getDataStore();
    const data = dataStore.templateDemographics;
    console.log("Data is");
    console.log(data);

    const width = vw(43.5);
    const height = vh(60);
    const wlmargin = vw(4.5);
    const wrmargin = vw(0);
    const hmargin = vh(5);

    var numericValues = [];


    for (var key in data[0]) {
        if (key !== 'person') {

            numericValues.push(parseInt(data[0][key]));
        }
    }
    for (var key in data[1]) {
        if (key !== 'person') {

            numericValues.push(parseInt(data[1][key]));
        }
    }
    console.log(numericValues);
    // Find minimum and maximum values
    var minValue = Math.min(...numericValues);
    var maxValue = Math.max(...numericValues);
    var demographicKeys = Object.keys(data[0]).filter(key => key !== 'person');
    console.log(demographicKeys);
    const svg = d3.select("#demographics-svg")
        .attr("width", width)
        .attr("height", height)
    .append("g");
    
    const x = d3.scaleLinear()
    .range([ wlmargin, width-wrmargin ])
    .domain([minValue, 1.1*maxValue])
    svg.append("g")
    .attr("transform", `translate(0, ${height-hmargin})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-15)")
        .style("text-anchor", "end");

    const y = d3.scaleBand()
    .domain(demographicKeys)
    .range([ height-hmargin, 0])
    .padding(0.2);
    svg.append("g")
    .attr("transform", `translate(${wlmargin}, 0)`)
    .call(d3.axisLeft(y))
    .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-30)")
        .style("text-anchor", "end");


    svg.selectAll(".bar1")
    .data(demographicKeys)
    .join("rect")
        .attr("class","bar1")
        .attr("x", x(1))
        .attr("y", d => y(d)-10)
        .attr("width", d => x(data[0][d]))
        .attr("height", d => y.bandwidth()-20)
        .attr("fill", "#69b3a2");
    
    svg.selectAll(".bar2")
    .data(demographicKeys)
    .join("rect")
        .attr("class","bar2")
        .attr("x", x(1))
        .attr("y", d => y(d)+10)
        .attr("width", d => x(data[1][d]))
        .attr("height", d => y.bandwidth()-20)
        .attr("fill", "#78bf00")

}

export default drawBarChart;