import appState from './main.js';

function vh(percent) {
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    return (percent * h) / 100;
}

function vw(percent) {
    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    return (percent * w) / 100;
}

const margin = {top: vh(2), right: vw(2), bottom: vh(3), left: vw(2)};
const width = vw(30) - margin.left - margin.right;
const height = vh(25) - margin.top - margin.bottom;



function getISOWeekNumber(date) {
  const startDate = new Date('2025-01-01T00:00:00');
  var days = Math.floor((date - startDate) / (24 * 60 * 60 * 1000));
  return Math.ceil(days / 7);
}

function getWeekData(dayData, weeks) {
    let weekList = [];

    weeks.forEach((week) => {
      let weekObj = {
        'weekNum': week,
        0: 0,
        1: 0,
        2: 0,
        3: 0
      };
      weekList.push(weekObj);
    });

    dayData.forEach((d) => {
      let weekNum = getISOWeekNumber(d.time);
      let arrIndex = weeks.indexOf(weekNum);
      let updatedObj = {
        ...weekList[arrIndex],
        [d.eType]: weekList[arrIndex][d.eType]+1
      };
      weekList[arrIndex] = {...updatedObj};
    })

    return weekList;
    
}

// function drawStreamgraphs() {
//   const dataStore = appState.getDataStore();
//   const filters = appState.getFilters();

//   drawSingleStreamgraph('Left', dataStore[filters.leftGraph]);
//   drawSingleStreamgraph('Right', dataStore[filters.rightGraph])
// }

function drawStreamgraph() {
  const dataStore = appState.getDataStore();
  drawEachStreamgraph(dataStore.leftGraph, "#streamgraphLeft")
  drawEachStreamgraph(dataStore.rightGraph, "#streamgraphRight")
}

function drawEachStreamgraph(data, svg_name) { 
    const keys = d3.union(data.map(d => d.eType));

    const weeks = d3.union(data.map(d=>getISOWeekNumber(d.time)));
    const weekData = getWeekData(data, Array.from(weeks).slice().sort((a, b) => a - b));

    const svg = d3.select(svg_name)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",`translate(${margin.left}, ${margin.top})`);

    

      

      const x = d3.scaleLinear()
        .domain(d3.extent(weekData, function(d) { return d.weekNum; }))
        .range([ 0, width ]);

      const months = [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      const xAxis = d3.scaleBand().range([0, width]).domain(months);
      svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xAxis))
        
      svg.selectAll(".tick line").attr("stroke", "#b8b8b8")

      // svg.append("text")
      //    .attr("text-anchor", "end")
      //    .attr("x", width)
      //    .attr("y", height-30 )
      //    .text("Week number");

      const y = d3.scaleLinear()
        .domain([0, d3.max(weekData, d => d[0] + d[1] + d[2] + d[3])])
        .range([ height, 0 ]);
        
      svg.append('g')
        .call(d3.axisLeft(y))

      svg.append("text")
        .attr("class", "y-label")
        .attr("text-anchor", "end")
        .attr("x", -20)
        .attr("y", -25)
        .attr("transform", "rotate(-90)")
        // .attr("transform", `translate(-10, 0)`)
        // .attr("x", height / 3)
        // .attr("y", 0)
        // .attr("dy", ".75em")
        .text("Number of contacts");

      const color = d3.scaleOrdinal()
        .domain(d3.union(data.map(d => d.eType)))
        .range(d3.schemeDark2);

      const stackedData = d3.stack()
      .order(d3.stackOrderAppearance)
       .keys(keys)
       (weekData)


      const Tooltip = svg
        .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .style("opacity", 0)
        .style("font-size", 17)

      const mouseover = function(event,d) {
        Tooltip.style("opacity", 1)
        d3.selectAll(".myArea").style("opacity", .2)
        d3.select(this)
          .style("stroke", "black")
          .style("opacity", 1)
      }
      const mousemove = function(event,d,i) {
        let grp = d.key
        Tooltip.text(grp)
      }
      const mouseleave = function(event,d) {
        Tooltip.style("opacity", 0)
        d3.selectAll(".myArea").style("opacity", 1).style("stroke", "none")
       }

      // Area generator
      const area = d3.area()
      .curve(d3.curveCardinal)
        .x(function(d) { 
          return x(d.data.weekNum); 
        })
        .y0(function(d) { return y(d[0]); })
        .y1(function(d) { return y(d[1]); })

      // Show the areas
      svg
        .selectAll(".myLayers")
        .data(stackedData)
        .join("path")
          .attr("class", "myArea")
          .style("fill", function(d) { return color(d.key); })
          .attr("d", area)
          // .attr("transform",`translate(${margin.left}, ${margin.top})`)
          .on("mouseover", mouseover)
          .on("mousemove", mousemove)
          .on("mouseleave", mouseleave)


      // START TIME FILTERS

          let startLineX = 0; 
        let endLineX = width;

        const startLine = svg.append("line")
          .attr("class", "slider-line")
          .attr("x1", startLineX) 
          .attr("y1", 0)
          .attr("x2", startLineX)
          .attr("y2", height);

        const endLine = svg.append("line")
          .attr("class", "slider-line")
          .attr("x1", endLineX)  
          .attr("y1", 0)
          .attr("x2", endLineX)
          .attr("y2", height);

        const select_rect = svg.append("rect")
          .attr("class", "select-rect")
          .attr("x", startLineX)
          .attr("y", 0)
          .attr("width", width)
          .attr("height", height)
          .attr("opacity", 0.2)

          let startLineDragging = false;
          let endLineDragging = false;
    
       const startlineDrag = d3.drag()
          .on("start", (event) => {
            startLineDragging = true;
            event.sourceEvent.stopPropagation();
          })
          .on("drag", (event) => {
            if (startLineDragging) {
              const mouseX = event.x;
              startLineX = mouseX;
              startLine.attr("x1", mouseX).attr("x2", mouseX);
              select_rect.attr("x", mouseX);
              select_rect.attr("width", endLineX-startLineX);
            }
            if (startLineX<0) {
              startLineX = 0;
              startLine.attr("x1", startLineX).attr("x2", startLineX);
              select_rect.attr("x", startLineX);
              select_rect.attr("width", endLineX-startLineX);
            }
            if (startLineX>=endLineX-5) {
              startLineX = endLineX-5;
              startLine.attr("x1", startLineX).attr("x2", startLineX);
              select_rect.attr("x", startLineX);
              select_rect.attr("width", endLineX-startLineX);
            }
          })
          .on("end", () => {
            startLineDragging = false;
            // Get x axis value for starting line => x.invert(startLineX)
          });
    
          const endLineDrag = d3.drag()
          .on("start", (event) => {
            endLineDragging = true;
            event.sourceEvent.stopPropagation();
          })
          .on("drag", (event) => {
            if (endLineDragging) {
              const mouseX = event.x;
              endLineX = mouseX;
              endLine.attr("x1", mouseX).attr("x2", mouseX);
              // select_rect.attr("x", mouseX);
              select_rect.attr("width", endLineX-startLineX);
            }
            if (endLineX>width) {
              endLineX = width;
              endLine.attr("x1", endLineX).attr("x2", endLineX);
              select_rect.attr("width", endLineX-startLineX);
            }
            if (endLineX<=startLineX+5) {
              endLineX = startLineX+5;
              endLine.attr("x1", endLineX).attr("x2", endLineX);
              select_rect.attr("width", endLineX-startLineX);
            }
          })
          .on("end", () => {
            endLineDragging = false;
            // Get x axis value for ending line => x.invert(endLineX)
          });
    
        startLine.call(startlineDrag);
        endLine.call(endLineDrag);
}

export default drawStreamgraph;
