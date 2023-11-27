import appState from './main.js';

function vh(percent) {
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    return (percent * h) / 100;
}
  
function vw(percent) {
    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    return (percent * w) / 100;
}

function drawBarChart() {
    const dataStore = appState.getDataStore();
    const left_node = dataStore.leftSelectedNode;
    const right_node = dataStore.rightSelectedNode;
    const leftDemographics = dataStore.leftDemographics;
    const rightDemographics = dataStore.rightDemographics;
    let left_data, right_data;
    if (left_node == null) {
        left_data = leftDemographics.reduce((acc, obj) => {
            for (const key in obj) {
              if (acc.hasOwnProperty(key) && key !='person') {
                acc[key] += parseFloat(obj[key]);
              } else {
                acc[key] = parseFloat(obj[key]);
              }
            }
            acc['person'] = 'aggregate';
            return acc;
          }, {});
        for (const key in left_data) {
            if (key !='person') {
                left_data[key] /= leftDemographics.length;
            }
        }
    }
    else {
        left_data = leftDemographics.find(obj => obj.person === left_node);
    }
    if (right_node == null) {
        right_data = rightDemographics.reduce((acc, obj) => {
            for (const key in obj) {
              if (acc.hasOwnProperty(key) && key !='person') {
                acc[key] += parseFloat(obj[key]);
              } else {
                acc[key] = parseFloat(obj[key]);
              }
            }
            acc['person'] = 'aggregate';
            return acc;
          }, {});
        for (const key in right_data) {
            if (key !='person') {
                right_data[key] /= rightDemographics.length;
            }
        }
    }
    else {
        right_data = rightDemographics.find(obj => obj.person === right_node);
    }

    const width = vw(43.5);
    const height = vh(60);
    const wlmargin = vw(4.5);
    const wrmargin = vw(0);
    const htmargin = vh(3);
    const hbmargin = vh(7);

    var numericValues = [];


    for (var key in left_data) {
        if (key !== 'person') {

            numericValues.push(parseInt(left_data[key]));
        }
    }
    for (var key in right_data) {
        if (key !== 'person') {

            numericValues.push(parseInt(right_data[key]));
        }
    }
    // Find minimum and maximum values
    var minValue = Math.min(...numericValues);
    var maxValue = Math.max(...numericValues);
    var demographicKeys = Object.keys(left_data).filter(key => key !== 'person');
    const svg = d3.select("#demographics-svg")
        .attr("width", width)
        .attr("height", height)
    .append("g");
    
    const x = d3.scaleLinear()
    .range([ wlmargin, width-wrmargin ])
    .domain([minValue, 1.1*maxValue])
    svg.append("g")
    .attr("transform", `translate(0, ${height-hbmargin})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-15)")
        .style("text-anchor", "end");

    svg.append("text")
        .attr("id", "x-label")
        .attr("text-anchor", "end")
        .attr("x", wlmargin+width/2)
        .attr("y", height-htmargin/1.5)
        .text("Amount (in $)");

    const y = d3.scaleBand()
    .domain(demographicKeys)
    .range([ height-hbmargin, htmargin])
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
        .attr("x", x(minValue))
        .attr("y", d => y(d)-10+10)
        .attr("width", d => x(left_data[d]))
        .attr("height", d => y.bandwidth()-20)
        .attr("fill", "#69b3a2");
    
    svg.selectAll(".bar2")
    .data(demographicKeys)
    .join("rect")
        .attr("class","bar2")
        .attr("x", x(minValue))
        .attr("y", d => y(d)+10+10)
        .attr("width", d => x(right_data[d]))
        .attr("height", d => y.bandwidth()-20)
        .attr("fill", "#78bf00")

}

export default drawBarChart;