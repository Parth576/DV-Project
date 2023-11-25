import appState from './main.js';


function drawPieChart() {
    // console.log('trace:drawPieChart()');
    const dataStore = appState.getDataStore();
    // console.log(dataStore.template);
    // console.log(dataStore.templateNodes);

    var node_dict = { 0: 'Email', 1: 'Phone', 2: 'Buy/Sell', 3: 'Travel' };


    const eTypeCount = dataStore.template.reduce((countMap, item) => {
        const eType = item.eType;
        countMap[eType] = (countMap[eType] || 0) + 1;
        return countMap;
    }, {});

    console.log(eTypeCount);

    const groupedData = d3.group(dataStore.template, d => d.eType);

    const width = 270;
    const height = 240;
    const radius = Math.min(width, height) / 2.1;
    const innerRadius = radius / 3;

    const color = ['crimson', '#F98C40', '#FAD65A', '#0037A7', '#100064']

    const svg = d3.select("#pie_chart")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


    const pie = d3.pie()
        .value(d => d[1].length);

    const arc = d3.arc()
        .innerRadius(innerRadius)
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
        .attr("fill", (d, i) => color[i])
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
        d3.select(this)
            .transition()
            .duration(200)
            .attr('transform', function (d) {
                const distance = 10;
                const angle = (d.startAngle + d.endAngle) / 2;
                const x = Math.sin(angle) * distance;
                const y = -Math.cos(angle) * distance;
                return 'translate(' + x + ',' + y + ')';
            });
        div.transition()
            .duration(200)
            .style("opacity", .9);

        div.html("EType: " + node_dict[d.data[0]] + "<br/>" + "Count: " + eTypeCount[d.data[0]])
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY - 28) + "px");
    }

    function handleMouseOut(event, d) {
        d3.select(this).attr("stroke", 'black').style("stroke-width", "2px");
        d3.select(this)
            .transition()
            .duration(200)
            .attr('transform', 'translate(0,0)');
        div.transition()
            .duration(500)
            .style("opacity", 0);
    }

}


export default drawPieChart;