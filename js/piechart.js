import appState from './main.js';

function vh(percent) {
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    return (percent * h) / 100;
}

function vw(percent) {
    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    return (percent * w) / 100;
}

function drawPieChart() {
    // const dataStore = appState.getDataStore();
    // drawPie(dataStore.leftGraph, "#pie_chart1");
    // drawPie(dataStore.rightGraph, "#pie_chart2");
    const ogData = appState.getOriginalData();
    const filters = appState.getFilters();
    drawPie(ogData[filters.leftGraph], "#pie_chart1");
    drawPie(ogData[filters.rightGraph], "#pie_chart2");
}

function drawPie(graph_data, svg_name) {

    var node_dict = { 0: 'Email', 1: 'Phone', 2: 'Buy/Sell', 3: 'Travel' };
    let is_clicked = false;
    let clicked_etype;
    let clicked_sel;

    const eTypeCount = graph_data.reduce((countMap, item) => {
        const eType = item.eType;
        countMap[eType] = (countMap[eType] || 0) + 1;
        return countMap;
    }, {});

    //console.log(eTypeCount);

    const groupedData = d3.group(graph_data, d => d.eType);

    const width = vh(20);
    const height = vw(8);
    const radius = Math.min(width, height) / 2.5;
    const innerRadius = 0;

    const color = d3.scaleOrdinal()
    .domain([0,1,2,3])
    .range(d3.schemeDark2);

    let svg;
    let div;
    if (d3.select(`${svg_name} svg`).empty()) {
        svg = d3.select(svg_name)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
        
        div = d3.select("body").append("div")
                .attr("class", "pie-tooltip")
                .style("opacity", 0);
    }
    else {
        svg = d3.select(`${svg_name} svg`)
        div = d3.select(".pie-tooltip").style("opacity", 0);
    }


    const pie = d3.pie()
        .value(d => d[1].length);

    const arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(radius);

    const arcs = pie(groupedData);

    svg.selectAll(".pie")
        .data(arcs)
        .join("path")
        .attr("class", "pie")
        .attr("d", arc)
        .attr("fill", (d, i) =>{
            // console.log(d)
            return color(d.data[0])} )
        .style("opacity", 0.7)
        .attr("stroke", "black")
        .style("stroke-width", "2px")
        .on("click", handleClick)
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut);

    function handleClick(event, d) {
        //console.log("Clicked on slice with data:", d.data);
        let strokew;
        if (is_clicked) {
            if (d3.select(this).style("opacity") == 1) {
                is_clicked = false;
                strokew = "2px";
                d3.select(this).attr("stroke", "black").style("stroke-width", strokew).style("opacity", 0.7);
                appState.applyFilters({
                    'eType': null,
                }, "pie");
            } else {
                strokew = "2px";
                clicked_sel.attr("stroke", "black").style("stroke-width", strokew).style("opacity", 0.7);
                strokew = "5px";
                clicked_etype = d.data[0];
                clicked_sel = d3.select(this);
                d3.select(this).attr("stroke", "black").style("stroke-width", strokew).style("opacity", 1);
                const eType = d.data[0];
                appState.applyFilters({
                    'eType': eType,
                }, "pie");
            }
        } else {
            strokew = "5px";
            is_clicked = true;
            clicked_etype = d.data[0];
            clicked_sel = d3.select(this);
            d3.select(this).attr("stroke", "black").style("stroke-width", strokew).style("opacity", 1);
            const eType = d.data[0];
            appState.applyFilters({
                'eType': eType,
            }, "pie");
        }
    }


    function handleMouseOver(event, d) {
        d3.select(this).attr("stroke", "black").style("stroke-width", "3px");
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
            .style("left", (event.pageX + 45) + "px")
            .style("top", (event.pageY - 38) + "px")
            .style("font-size", "13px");
    }

    function handleMouseOut(event, d) {
        let strokew = "2px";
        if (is_clicked && d.data[0] === clicked_etype) {
            strokew = "4px";
        }
        d3.select(this).attr("stroke", 'black').style("stroke-width", strokew);
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