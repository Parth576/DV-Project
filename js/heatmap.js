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
    const myVars = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

    const heatmapData = computeHeatmapData(filteredData, myVars);
    drawHeatmapInSvg(svg, myGroups, myVars, heatmapData);
}

function drawHeatmapInSvg(svg, myGroups, myVars, data) {
    const x = d3.scaleBand()
        .range([0, width])
        .domain(myGroups)
        .padding(0.01);
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))

    const y = d3.scaleBand()
        .range([height, 0])
        .domain(myVars)
        .padding(0.01);
    svg.append("g")
        .call(d3.axisLeft(y));

    const myColor = d3.scaleLinear()
        .range(["white", "#69b3a2"])
        .domain([1, d3.max(data, (d) => d.value)])


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
}

function computeHeatmapData(data, myVars) {
    const dateCountMap = new Map();
    data.forEach(d => {
        const date = d['time']
        const dateKey = d['time'].toDateString();
        if (dateCountMap.has(dateKey)) {
            dateCountMap.get(dateKey).value += 1;
        } else {
            dateCountMap.set(dateKey, {group: getISOWeekNumber(date), variable: myVars[date.getDay()], value: 1});
        }
    });
    return Array.from(dateCountMap.values());
}

function drawHeatmap() {
    drawGraph();
}

export default drawHeatmap;