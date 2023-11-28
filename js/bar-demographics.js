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
    const left_node = appState.getFilters().leftNode;
    const right_node = appState.getFilters().rightNode;
    const leftDemographics = dataStore.leftDemographics;
    const rightDemographics = dataStore.rightDemographics;
    var legendLeft = "";
    var legendRight = "";
    let left_data, right_data;
    if (left_node == null) {
        legendLeft = "Left graph aggregated data";
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
        legendLeft = "Person "+left_node + " from left graph";
        left_data = leftDemographics.find(obj => parseInt(obj.person) === left_node);
    }
    if (right_node == null) {
        legendRight = "Right graph aggregated data";
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
        legendRight = "Person "+right_node + " from right graph";
        right_data = rightDemographics.find(obj => parseInt(obj.person) === right_node);
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
        .attr("height", height);
    
    const x = d3.scaleLinear()
    .range([ wlmargin, width-wrmargin ])
    .domain([minValue, 1.1*maxValue])

    if (svg.select(".barXAxis").empty() ){
        svg.append("g")
        .attr('class','barXAxis')
        .attr("transform", `translate(0, ${height-hbmargin})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-15)")
        .style("text-anchor", "end");
    } else {
        svg.select(".barXAxis").transition()
        .duration(1000)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-15)")
        .style("text-anchor", "end");
    }

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

    if (svg.select(".barYAxis").empty() ){
        svg.append("g")
        .attr('class','barYAxis')
        .attr("transform", `translate(${wlmargin}, 0)`)
        .call(d3.axisLeft(y))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-30)")
        .style("text-anchor", "end");
    }
    else {
        svg.select(".barYAxis").transition()
        .duration(1000)
        .call(d3.axisLeft(y))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-30)")
        .style("text-anchor", "end");
    }

    svg.selectAll(".bar1")
    .data(demographicKeys)
    .join("rect")
        .attr("class","bar1")
        .attr("x", x(minValue))
        .attr("y", d => y(d))
        .attr("height", d => y.bandwidth()-20)
        .on("mouseover", function(event,d) {
            showToolTip(event, d, "#demoTooltip",left_data);
        })
        .on("mouseout", function(d) {
            hideToolTip("#demoTooltip");
        })
        .transition()
        .duration(1000)
        .attr("width", d => x(left_data[d]))
        .attr("fill", "#704F4F")
       ;
 
    svg.selectAll(".bar2")
    .data(demographicKeys)
    .join("rect")
        .attr("class","bar2")
        .attr("x", x(minValue))
        .attr("y", d => y(d)+20)
        .attr("height", d => y.bandwidth()-20)
        .on("mouseover", function(event,d) {
            showToolTip(event, d, "#demoTooltip",right_data);
        })
        .on("mouseout", function(d) {
            hideToolTip("#demoTooltip");
        })
        .transition()
        .duration(1000)
        .attr("width", d => x(right_data[d]))
        .attr("fill","#F1A661")
       ;
    
    var keys = [legendLeft, legendRight]
    
    svg.selectAll(".dots")
    .data(keys)
    .join("rect")
    .attr("class","dots")
        .attr("x", 0.6*width)
        .attr("y", function(d,i){ return 20 + i*(25)})
        .attr("width", 10)
        .attr("height", 10)
        .attr("rx", 5)
        .style("fill", function(d, i){ if (i == 0) {return "#704F4F";} else return "#F1A661"})
        

    svg.selectAll(".labels")
    .data(keys)
    .join("text")
        .attr("class", "labels")
        .attr("x", 0.6*width + 20*1.2)
        .attr("y", function(d,i){ return 24 + i*(25) + 5})
        .style("fill", function(d, i){ if (i == 0) {return "#704F4F";} else return "#F1A661"})
        .text(function(d, i){ return d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle");

}

function showToolTip(event, d, tooltipID,data){
    console.log(d)
    const tooltip = d3.select(tooltipID);
    tooltip.style("opacity", 1)
                    .html(`${d} : ${data[d].toFixed(1)}`);



}
function hideToolTip(tooltipID){
    const tooltip = d3.select(tooltipID);
    tooltip.style("opacity", 0);

}

export default drawBarChart;