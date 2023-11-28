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

function getDateFromISOWeekNumber(weekNumber) {
  const startDate = new Date('2025-01-01T00:00:00');
  const daysToAdd = Math.floor(weekNumber * 7);
  
  const targetDate = new Date(startDate);
  targetDate.setDate(startDate.getDate() + daysToAdd);

  return targetDate;
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

function drawStreamgraph() {
  const originalData = appState.getOriginalData();
  const filters = appState.getFilters();
  drawEachStreamgraph(originalData[filters.leftGraph], "#streamgraphLeft", filters)
  drawEachStreamgraph(originalData[filters.rightGraph], "#streamgraphRight", filters)
}

function drawEachStreamgraph(data, svg_name, filters) { 

  
    const keys = d3.union(data.map(d => d.eType));

    const selectedEdgeType = filters.eType;
    const startTime = filters.startTime;
    const endTime = filters.endTime;

    const weeks = d3.union(data.map(d=>getISOWeekNumber(d.time)));
    
    const weekData = getWeekData(data, Array.from(weeks).slice().sort((a, b) => a - b));
    let svg = d3.select(`${svg_name} g`);


    if (svg.empty()) {

      svg = d3.select(svg_name).attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append('g')
      .attr("transform",`translate(${margin.left}, ${margin.top})`)

      svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .attr('class','streamXAxis')

      svg.append('g')
        .attr('class','streamYAxis')

          svg.append("text")
        .attr("class", "y-label")
        .attr("text-anchor", "end")
        .attr("x", -20)
        .attr("y", -25)
        .attr("transform", "rotate(-90)")
        .text("Number of contacts");

      svg.append("rect")
        .attr("class", "selectRect")
        
    } 

      const x = d3.scaleLinear()
        .domain(d3.extent(weekData, function(d) { return d.weekNum; }))
        .range([ 0, width ]);

      const months = [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      const xAxis = d3.scaleBand().range([0, width]).domain(months);

      // svg.append("g")
      //   .attr("transform", `translate(0, ${height})`)
      //   .call(d3.axisBottom(xAxis))

      svg.selectAll('.streamXAxis')
        .call(d3.axisBottom(xAxis))
        
      svg.selectAll(".tick line").attr("stroke", "#b8b8b8")

      const y = d3.scaleLinear()
        .domain([0, d3.max(weekData, d => d[0] + d[1] + d[2] + d[3])])
        .range([ height, 0 ]);
        
      svg.selectAll('.streamYAxis')
        .call(d3.axisLeft(y))

      const color = d3.scaleOrdinal()
        .domain([0,1,2,3])
        .range(d3.schemeDark2);

      const stackedData = d3.stack()
      .order(d3.stackOrderAppearance)
       .keys(keys)
       (weekData)

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
        .selectAll(".myArea")
        .data(stackedData)
        .join("path")
          .attr("class", "myArea")
          .style("fill", function(d) { return color(d.key); })
          .style('opacity', function(d) {
            if(selectedEdgeType === null) return 1;

            if(selectedEdgeType === d.key) return 1;
            else return 0.2
          })
          .style('stroke', function(d) {
            if(selectedEdgeType === null) return 'none';

            if(selectedEdgeType === d.key) return 'black';
            else return 'none'
          })
          .attr("d", area)
          // .attr("transform",`translate(${margin.left}, ${margin.top})`)
          //.on("mouseover", mouseover)
          //.on("mousemove", mousemove)
          //.on("mouseleave", mouseleave)


      // START TIME FILTERS

        //   let startLineX = 0; 
        // let endLineX = width;
        let startLine;
        if (svg.select(".startLine").empty()) {
          startLine = svg.append("line")
            .attr("class", "startLine")
        }
        else {
          startLine = svg.select(".startLine")
        }

        let endLine;
        if (svg.select(".endLine").empty()) {
          endLine = svg.append("line")
            .attr("class", "endLine")
        }
        else {
          endLine = svg.select(".endLine")
        }

        let startLineX = x(getISOWeekNumber(startTime));
        let endLineX = x(getISOWeekNumber(endTime));

        startLine
          .attr("x1", startLineX) 
          .attr("y1", 0)
          .attr("x2", startLineX)
          .attr("y2", height);

        endLine
          .attr("x1", endLineX)  
          .attr("y1", 0)
          .attr("x2", endLineX)
          .attr("y2", height);

        const select_rect = svg.selectAll(".selectRect")
          // .attr("class", "select-rect")
          .attr("x", startLineX)
          .attr("y", 0)
          .attr("width", endLineX - startLineX)
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
            let newStartX = x.invert(startLineX);
            let newStartTime = getDateFromISOWeekNumber(newStartX);
            appState.applyFilters({
              'startTime': newStartTime
            }, 'streamgraph');
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
            let newEndX = x.invert(endLineX);
            let newEndTime = getDateFromISOWeekNumber(newEndX);
            appState.applyFilters({
              'endTime': newEndTime
            }, 'streamgraph');
          });
    
        startLine.call(startlineDrag);
        endLine.call(endLineDrag);
}

export default drawStreamgraph;
