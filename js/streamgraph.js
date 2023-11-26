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
const height = vh(20) - margin.top - margin.bottom;

const svg = d3.select("#streamgraphLeft")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",`translate(${margin.left}, ${margin.top})`);

function getISOWeekNumber(date) {
  // Create a new date object to avoid modifying the original date
  const newDate = new Date(date);
  
  // Set to Monday of the week to ensure the correct week number
  newDate.setHours(0, 0, 0, 0);
  newDate.setDate(newDate.getDate() + 4 - (newDate.getDay() || 7));
  
  // Get the year of the date
  const yearStart = new Date(newDate.getFullYear(), 0, 1);
  
  // Calculate the week number
  const weekNumber = Math.ceil((((newDate - yearStart) / 86400000) + 1) / 7);
  
  return weekNumber;
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

function drawLeftStreamgraph() { 
   const dataStore = appState.getDataStore();
    const data = dataStore.leftGraph;

    const keys = d3.union(data.map(d => d.eType));

    const weeks = d3.union(data.map(d=>getISOWeekNumber(d.time)));
    const weekData = getWeekData(data, Array.from(weeks));

      // Add X axis
      const x = d3.scaleLinear()
        .domain(d3.extent(weekData, function(d) { return d.weekNum; }))
        .range([ 0, width ]);

      svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        
      // Customization
      svg.selectAll(".tick line").attr("stroke", "#b8b8b8")

      // Add X axis label:
      //svg.append("text")
      //    .attr("text-anchor", "end")
      //    .attr("x", width)
      //    .attr("y", height-30 )
      //    .text("Time (year)");

      // Add Y axis
      const y = d3.scaleLinear()
        .domain(d3.extent(weekData, function(d) { 
          return d[0]+d[1]+d[2]+d[3]
        }))
        .range([ height, 0 ]);
      svg.append('g')
        .call(d3.axisLeft(y))

      // color palette
      const color = d3.scaleOrdinal()
        .domain(d3.union(data.map(d => d.eType)))
        .range(d3.schemeDark2);

      //stack the data?
      //const stackedData = d3.stack()
      //  .offset(d3.stackOffsetSilhouette)
      //  .keys(keys)
      //  (data)

    const stackedData = d3.stack()
      .keys(keys) // apples, bananas, cherries, …
      .value(([, group], key) => group.get(key))
    (d3.index(weekData, d => d.week, d => d.fruit));

    // const stackedData = d3.stack()
    //     .keys(keys)
    //     .value(([, group], key) => {
    //       console.log(`Group: ${group}, key: ${key}`);
    //     })
    //     (weekData);


      //create a tooltip
      const Tooltip = svg
        .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .style("opacity", 0)
        .style("font-size", 17)

      //Three function that change the tooltip when user hover / move / leave a cell
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
          .attr("d", area)
          .attr("transform",`translate(${margin.left}, ${margin.top})`)
          .on("mouseover", mouseover)
          .on("mousemove", mousemove)
          .on("mouseleave", mouseleave)
}

export default drawLeftStreamgraph;
