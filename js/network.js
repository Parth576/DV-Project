import appState from './main.js';

function drawNetworkChart() {
    console.log('trace:drawNetworkpChart()');
    const dataStore = appState.getDataStore();
    console.log(dataStore.template);
    console.log(dataStore.templateNodes);

    const width = 928;
    const height = 600;

  
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    const links = dataStore.template.map(d => ({...d}));
    const nodes = dataStore.templateNodes.map(d => ({...d}));

    // console.log(links);
    // console.log(nodes);
    // console.log('Nodes:', dataStore.templateNodes.map(d => d.id));
    // console.log('Link IDs:', links.map(d => d.source, d => d.target));

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width / 2, height / 2))
      .on("tick", ticked);

      const svg = d3.select("#myNet svg")
      .attr("class", "everything")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");

      var arrow = svg
      .append("defs")
      .selectAll("marker")
      .data(["line-end"])
      .join("marker")
      .attr("id", "line-end")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 0)
      .attr("refY", 0)
      .attr("markerUnits", "userSpaceOnUse")
      .attr("markerWidth", 12)
      .attr("markerHeight", 12)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#333");

      var linkSizeScale = d3
        .scaleLinear()
        .domain(d3.extent(links, (d) => d.weight))
        .range([5, 30]);

      // create node size scale
      var linkColourScale = d3
        .scaleLinear()
        .domain(d3.extent(links, (d) => d.weight))
        .range(["blue", "red"]);

        var nodeSizeScale = d3
        .scaleLinear()
        .domain(d3.extent(nodes, (d) =>(d) => d.total))
        .range([30, 70]);

        // Add a line for each link, and a circle for each node.
        const link = svg.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .selectAll()
            .data(links)
            .join("line")
            .attr("class", "link")
        .style("stroke", (d) => linkColourScale(d.weight))
        .attr("stroke-opacity", 0.5)
        .attr("stroke-width", (d) => linkSizeScale(d.weight))
        .attr("marker-end", "url(#line-end)");

        const node = svg.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll()
            .data(nodes)
            .join("circle")
            .attr("r", 5)
            // .attr("r", (d) => nodeSizeScale(10))
            .attr("fill", d => color(d.group));

        node.append("title")
            .text(d => d.id);

  
        node.call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));


        function ticked() {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            // link.attr("d", positionLink1);
            // link.filter((d) => d.target !== d.source).attr("d", positionLink2);
    



            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
        }

       

        function positionLink1(d) {
            const dx = d.target.x - d.source.x;
            const dy = d.target.y - d.source.y;
            const dr = Math.sqrt(dx * dx + dy * dy);
            return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
          }
    
         
          function positionLink2(d) {
        
            const pl = this.getTotalLength();
       
            const r = nodeSizeScale(d.target) + 10; 
            const m = this.getPointAtLength(pl - r);
    
            const dx = m.x - d.source.x;
            const dy = m.y - d.source.y;
            const dr = Math.sqrt(dx * dx + dy * dy);
    
            return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${m.x},${m.y}`;
          }
    



   
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

   
        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

       
        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

    

        return svg.node();


}


export default drawNetworkChart;


