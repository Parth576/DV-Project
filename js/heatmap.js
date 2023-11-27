import appState from "./main.js";
import {getISOWeekNumber} from "./utils.js";

const widthWithMargin = 600, heightWithMargin = 200, margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = widthWithMargin - margin.left - margin.right,
    height = heightWithMargin - margin.top - margin.bottom;

function drawGraph() {
    const svg = d3.select("#rightHeatmap")
        .append("svg")
        .attr("width", widthWithMargin)
        .attr("height", heightWithMargin)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    const dataStore = appState.getDataStore();
    // TODO: change datastore
    const filteredData = dataStore.leftGraph;

    const myGroups = Array.from(new Set(filteredData.map(d => getISOWeekNumber(d['time']))))
    const myVars = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    const heatmapData = computeHeatmapData(filteredData, myVars);
    drawHeatmapInSvg(svg, myGroups, myVars, heatmapData);
}

function drawHeatmapInSvg(svg, myGroups, myVars, data) {
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
        .range(["white", "#69b3a2"])
        .domain([1, d3.max(data, (d) => d.value)])

    const tooltip = d3.select("#rightHeatmap")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
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
            .html(d.date.toDateString())
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
        .style("opacity", 0.8)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
        .on("click", (e, d) => {
            console.log(e, d)
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
    drawGraph();
}

export default drawHeatmap;