import appState from './main.js';

function drawNetworkChart() {
    console.log('trace:drawNetworkpChart()');
    const dataStore = appState.getDataStore();
    // console.log(dataStore.template);
    // console.log(dataStore.templateNodes);

    const width = 928;
    const height = 600;
    const margin = 10;

  
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    const links = dataStore.template.map(d => ({...d}));
    const nodes = dataStore.templateNodes.map(d => ({...d}));

    let max_node = d3.max(nodes.map(d => d.id));
    let min_node = d3.min(nodes.map(d => d.id));
    let range = max_node - min_node +1;
    let grid_size = Math.ceil(Math.sqrt(range));


    nodes.forEach(node => {
        let norm = node.id-min_node;
        node.pos_x = margin+((norm % grid_size)*(width-margin)/grid_size);
        node.pos_y = margin+(Math.floor(norm / grid_size)*(height-margin)/grid_size);
    })

    // console.log(links)
    console.log(nodes)

    const nodeEdgesCount = {};
    for (const linkId in links) {
    const link = links[linkId];
    nodeEdgesCount[link.source] = (nodeEdgesCount[link.source] || 0) + 1;
    nodeEdgesCount[link.target] = (nodeEdgesCount[link.target] || 0) + 1;
    // console.log(nodeEdgesCount)


    }

    // Update nodes with the size property
    for (const nodeId in nodes) {
    const node = nodes[nodeId];
    const edgesCount = nodeEdgesCount[node.id] || 0;
    node.size = edgesCount;
    }

    // console.log(nodes);

    let maxSize = Number.MIN_SAFE_INTEGER;
    let minSize = Number.MAX_SAFE_INTEGER;

    // Iterate through nodes to find max and min size
    for (const nodeId in nodes) {
    const node = nodes[nodeId];
    const size = node.size;

    // Update max size if needed
    if (size > maxSize) {
        maxSize = size;
    }

    // Update min size if needed
    if (size < minSize) {
        minSize = size;
    }
    }

    // console.log('Maximum size:', maxSize);
    // console.log('Minimum size:', minSize);

    let unique_links = [];
    const linkCount = {};
    for (const linkId in links) {
    const link = links[linkId];
    const linkKey = `${Math.min(link.source, link.target)}-${Math.max(link.source, link.target)}`;
    linkCount[linkKey] = (linkCount[linkKey] || 0) + 1;
    if (!(unique_links.map(l => l.key).includes(linkKey))) {
        link.key = linkKey;
        unique_links.push(link);
    }
    }
    console.log(unique_links.map(link => link.key))
    console.log('Unique links:', unique_links);
    console.log("links:", links);

// Update links with the thickness property
    for (const linkId in links) {
    const link = links[linkId];
    const linkKey = `${Math.min(link.source, link.target)}-${Math.max(link.source, link.target)}`;
    link.thickness = linkCount[linkKey] || 0;
    }

    // console.log(links);
    
    for(const id in links){
        const link = links[id]
        // if ((link.source == 34 && link.target == 41) || (link.target==34 && link.source == 41)){
        //     console.log(link)
        // }

        if (link.source == 39 && link.target == 67){
            // console.log(link)
        }

    }

    // console.log(links);
    // console.log(nodes);
    // console.log('Nodes:', dataStore.templateNodes.map(d => d.id));
    // console.log('Link IDs:', links.map(d => d.source, d => d.target));

    // node size : how many edges are there
    // link thickness : vo dono nodes ke bichmei kitne links hai


    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(unique_links).id(d => d.id).strength(0.005))
      .force("charge", d3.forceManyBody().strength(-20))
      .force("x", d3.forceX(d => d.pos_x).strength(0.05))
      .force("y", d3.forceY(d => d.pos_y).strength(0.05))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .on("tick", ticked);

    // const simulation = d3.forceSimulation(nodes)
    // .force("link", d3.forceLink(links).id(d => d.id))
    // .force("charge", d3.forceManyBody())
    // .force("x", d3.forceX())
    // .force("y", d3.forceY())
    // .on("tick", ticked);

      const svg = d3.select("#myNet svg")
      .attr("class", "everything")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");

    //   var arrow = svg
    //   .append("defs")
    //   .selectAll("marker")
    //   .data(["line-end"])
    //   .join("marker")
    //   .attr("id", "line-end")
    //   .attr("viewBox", "0 -10 20 20")
    //   .attr("refX", 19)
    //   .attr("refY", 0)
    //   .attr("markerUnits", "userSpaceOnUse")
    //   .attr("markerWidth", 24)
    //   .attr("markerHeight", 24)
    //   .attr("orient", "auto")
    //   .append("path")
    //   .attr("d", "M0,-5L10,0L0,5")
    //   .attr("fill", "#333");

      var linkSizeScale = d3
        .scaleLinear()
        .domain(d3.extent(links, (d) => d.thickness))
        .range([5, 5]);

      // create node size scale
      var linkColourScale = d3
        .scaleLinear()
        .domain(d3.extent(links, (d) => d.thickness))
        .range(["blue", "red"]);

        var nodeSizeScale = d3
        .scaleLinear()
        .domain([0,192])
        .range([20, 40]);

        // Add a line for each link, and a circle for each node.
        const link = svg.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .selectAll()
            .data(unique_links)
            .join("line")
            .attr("class", "link")
        .style("stroke", (d) => linkColourScale(d.thickness))
        .attr("stroke-opacity", 0.5)
        .attr("stroke-width", (d) => linkSizeScale(d.thickness))
        .attr("marker-end", "url(#line-end)");

        // const node = svg.append("g")
        //     .attr("stroke", "#fff")
        //     .attr("stroke-width", 1.5)
        //     .selectAll()
        //     .data(nodes)
        //     .join("circle")
        //     .attr("r", 10)
        //     // .attr("r", (d) => nodeSizeScale(10))
        //     .attr("fill", d => color(d.group));

        // const nodeText = svg.append("g")
        //     .selectAll()
        //     .data(nodes)
        //     .enter()
        //     .append("text")
        //     .attr("dx", 12) // Adjust the position of the text
        //     .attr("dy", ".35em")
        //     .text(d => d.id); // Display the node id


  
        // node.call(d3.drag()
        //         .on("start", dragstarted)
        //         .on("drag", dragged)
        //         .on("end", dragended));


        // function ticked() {
        //     link
        //         .attr("x1", d => d.source.x)
        //         .attr("y1", d => d.source.y)
        //         .attr("x2", d => d.target.x)
        //         .attr("y2", d => d.target.y);

        //     // link.attr("d", positionLink1);
        //     // link.filter((d) => d.target !== d.source).attr("d", positionLink2);
    



        //     node
        //         .attr("cx", d => d.x)
        //         .attr("cy", d => d.y);

        //         nodeText.attr("x", d => d.x)
        //         .attr("y", d => d.y);
        // }

        const node = svg.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll()
            .data(nodes)
            .join("g")
            .attr("class", "node-group")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        // Append circles to the node group
        node.append("circle")
            // .attr("r", 20)
            .attr("r", (d) => { 
                console.log(d.size)
                return nodeSizeScale(d.size)
                //return 20 
            })
            .attr("fill", d => color(d.group));

        // Append text inside each circle
        node.append("text")
            .attr("dy", ".35em")
            .attr("text-anchor", "middle") 
            .text(d => d.id); // Display the node id

            function ticked() {

                link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

                // Update group positions
                node.attr("transform", d => `translate(${d.x},${d.y})`);
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

    

      


}


export default drawNetworkChart;


