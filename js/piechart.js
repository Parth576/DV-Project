import appState from './main.js';

function drawPieChart() {
    // console.log('trace:drawPieChart()');
    const dataStore = appState.getDataStore();
    // console.log(dataStore.template);
    // console.log(dataStore.templateNodes);

    const eTypeCount = dataStore.template.reduce((countMap, item) => {
        const eType = item.eType;
        countMap[eType] = (countMap[eType] || 0) + 1;
        return countMap;
    }, {});

    console.log(eTypeCount);

    const groupedData = d3.group(dataStore.template, d => d.eType);

    const width = 270;
    const height = 250;
    const radius = Math.min(width, height) / 2;

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const svg = d3.select("#pie_chart svg")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


    const pie = d3.pie()
        .value(d => d[1].length);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    const arcs = pie(groupedData);

    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    svg.selectAll("path")
        .data(arcs)
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", (d, i) => color(i))
        .attr("stroke", "black")
        .style("stroke-width", "2px")
        .on("click", handleClick)
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut);

    function handleClick(event, d) {
        console.log("Clicked on slice with data:", d.data);
    }


    function handleMouseOver(event, d) {
        d3.select(this).attr("stroke", "black").style("stroke-width", "5px");
        div.transition()
            .duration(200)
            .style("opacity", .9);

        div.html("EType: " + d.data[0] + "<br/>" + "Count: " + eTypeCount[d.data[0]])
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY - 28) + "px");
    }

    function handleMouseOut(event, d) {
        d3.select(this).attr("stroke", 'black').style("stroke-width", "2px");
        div.transition()
            .duration(500)
            .style("opacity", 0);
    }

}


export default drawPieChart;