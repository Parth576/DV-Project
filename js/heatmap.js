import appState from "./main.js";
import {getISOWeekNumber} from "./utils.js";

function vh(percent) {
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    return (percent * h) / 100;
}
  
function vw(percent) {
    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    return (percent * w) / 100;
}

const widthWithMargin = vw(30), heightWithMargin = vh(25), margin = {top: vh(2), right: vw(2), bottom: vh(2), left: vw(2)},
    width = widthWithMargin - margin.left - margin.right,
    height = heightWithMargin - margin.top - margin.bottom;

function drawGraph(filteredData, div_name, link_color) {
    d3.select(`${div_name}`).selectAll("*").remove();
    const svg = d3.select(div_name)
        .append("svg")
        .attr("width", widthWithMargin)
        .attr("height", heightWithMargin)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");


    const myGroups = Array.from(new Set(filteredData.map(d => getISOWeekNumber(d['time'])))).sort((a, b) => a - b)
    const myVars = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    const heatmapData = computeHeatmapData(filteredData, myVars);

    
    drawHeatmapInSvg(svg, myGroups, myVars, heatmapData, div_name, link_color);
}

function drawHeatmapInSvg(svg, myGroups, myVars, data, div_name, link_color) {
    d3.select("#myMap svg").selectAll("*").remove();

    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const x = d3.scaleBand()
        .range([0, width])
        .domain(myGroups)
        .padding(0.01);


    const xAxis = d3.scaleBand().range([0, width]).domain(months);
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xAxis))

    const y = d3.scaleBand()
        .range([height, 0])
        .domain(myVars)
        .padding(0.01);
    svg.append("g")
        .call(d3.axisLeft(y));

        

    const myColor = d3.scaleLinear()
        // .range(["#b8d3f2", "#01428f"])
        .range([link_color[0],link_color[1]])
        .domain([1, d3.max(data, (d) => d.value)])

    const tooltip = d3.select(div_name)
        .append("div")
        .style("opacity", 0)
        .attr("class", "heatmap-tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")

    const mouseover = function () {
        tooltip
            .style("opacity", 1)
        d3.select(this)
            .style("stroke", "black")
            .style("opacity", 1)
    }
    const mousemove = function (event, d) {
        tooltip
            .html(d.date.toDateString()+ " | Established Point-of-Contacts: "+d.value)
            .style("left", (event.x) / 2 + "px")
            .style("top", (event.y) / 2 + "px")
    }
    const mouseleave = function () {
        tooltip
            .style("opacity", 0)
        d3.select(this)
            .style("stroke", "none")
            .style("opacity", 0.8)
    }

    svg.selectAll()
        .data(data, function (d) {
            return d.group + ':' + d.variable;
        })
        .join("rect")
        .attr("x", function (d) {
            return x(d.group)
        })
        .attr("y", function (d) {
            return y(d.variable)
        })
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .style("fill", function (d) {
            return myColor(d.value)
        })
        .attr("rx", 4)
        .attr("ry", 4)
        .style("stroke-width", 4)
        .style("stroke", "none")
        .style("opacity", 1)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
        .on("click", (e, d) => {
            console.log(e, d)
            appState.applyFilters({
                'startTime': d.date.setHours(0, 0, 0, 0),
                'endTime': d.date.setHours(23, 59, 59, 999),
            }, "heatmap");
        })
}

function computeHeatmapData(data, myVars) {
    const dateCountMap = new Map();
    data.forEach(d => {
        const date = d['time']
        const dateKey = d['time'].toDateString();
        if (dateCountMap.has(dateKey)) {
            dateCountMap.get(dateKey).value += 1;
        } else {
            dateCountMap.set(dateKey, {group: getISOWeekNumber(date), variable: myVars[date.getDay()], value: 1, date});
        }
    });
    return Array.from(dateCountMap.values());
}

function drawHeatmap() {
    const dataStore = appState.getDataStore();

    const color = d3.scaleOrdinal()
    .domain([0,1,2,3])
    .range(d3.schemeDark2);

    const lightColor = d3.scaleOrdinal()
    .domain([0,1,2,3])
    .range(["#d8f6e9", "#ffb699", "#e7e6f0", "#ffc8e1"])
    const agg_color = "#3876BF";
    const etype = appState.getFilters().eType;
    let link_color;
    if (etype === null) {
        link_color =  ["#c9e1f3", agg_color]
    } else {
        // link_color = color(etype);
        link_color = [lightColor(etype), color(etype)]
    }

    drawGraph(dataStore.rightGraph, "#rightHeatmap", link_color);
    drawGraph(dataStore.leftGraph, "#leftHeatmap", link_color);
}

export default drawHeatmap;