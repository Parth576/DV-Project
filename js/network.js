import appState from './main.js';

var nodeSizeScale = d3
        .scaleLinear()
        .domain([0,192])
        .range([10, 30]);

function drawNetworkChart() {
    
    const dataStore = appState.getDataStore();
    
    drawLeftNetwork(dataStore);
    drawRightNetwork(dataStore);
 
}

function drawLeftNetwork(dataStore){
    const width = 928;
    const height = 600;
    const margin = 10;

  
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    const links = dataStore.leftGraph.map(d => ({...d}));
    const nodes = dataStore.leftNodes.map(nodeId => ({ id: nodeId }));

    let max_node = d3.max(nodes.map(d => d.id));
    let min_node = d3.min(nodes.map(d => d.id));
    let range = max_node - min_node +1;
    let grid_size = Math.ceil(Math.sqrt(range));


    nodes.forEach(node => {
        let norm = node.id-min_node;
        node.pos_x = margin+((norm % grid_size)*(width-margin)/grid_size);
        node.pos_y = margin+(Math.floor(norm / grid_size)*(height-margin)/grid_size);
    })

    const nodeEdgesCount = {};
    for (const linkId in links) {
    const link = links[linkId];
    nodeEdgesCount[link.source] = (nodeEdgesCount[link.source] || 0) + 1;
    nodeEdgesCount[link.target] = (nodeEdgesCount[link.target] || 0) + 1;
    }

    // Update nodes with the size property
    for (const nodeId in nodes) {
    const node = nodes[nodeId];
    const edgesCount = nodeEdgesCount[node.id] || 0;
    node.size = edgesCount;
    }

    let maxSize = Number.MIN_SAFE_INTEGER;
    let minSize = Number.MAX_SAFE_INTEGER;

    // Iterate through nodes to find max and min size
    for (const nodeId in nodes) {
    const node = nodes[nodeId];
    const size = node.size;

    if (size > maxSize) {
        maxSize = size;
    }

    if (size < minSize) {
        minSize = size;
    }
    }


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

// Update links with the thickness property
    for (const linkId in unique_links) {
    const link = unique_links[linkId];
    const linkKey = `${Math.min(link.source, link.target)}-${Math.max(link.source, link.target)}`;
    link.thickness = linkCount[linkKey] || 0;
    }

  

    // node size : how many edges are there
    // link thickness : vo dono nodes ke bichmei kitne links hai


    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(unique_links).id(d => d.id).strength(0.005))
      .force("charge", d3.forceManyBody().strength(-20))
      .force("x", d3.forceX(d => d.pos_x).strength(0.05))
      .force("y", d3.forceY(d => d.pos_y).strength(0.05))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .on("tick", ticked);

      let svg = d3.select("#myNet svg")
      .attr("class", "everything")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");

      var linkSizeScale = d3
        .scaleLinear()
        .domain(d3.extent(links, (d) => d.thickness))
        .range([5, 20]);

      // create node size scale
      var linkColourScale = d3
        .scaleLinear()
        .domain(d3.extent(links, (d) => d.thickness))
        .range(["blue", "red"]);


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

        const node = svg
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
            .attr("r", (d) => { 
                return nodeSizeScale(d.size)
                
            })
            .attr("fill", d => color(d.group))
            .on("mouseover", function(event,d) {displayDonut(d);})
            .on("mouseout", function(d) {d3.selectAll(".donut").remove();});

            function ticked() {

                link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

                // Update group positions
                node.attr("transform", d => `translate(${d.x},${d.y})`);
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

function drawRightNetwork(dataStore){

    const width = 928;
    const height = 600;
    const margin = 10;

  
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    const links = dataStore.rightGraph.map(d => ({...d}));
    const nodes = dataStore.rightNodes.map(nodeId => ({ id: nodeId }));

    let max_node = d3.max(nodes.map(d => d.id));
    let min_node = d3.min(nodes.map(d => d.id));
    let range = max_node - min_node +1;
    let grid_size = Math.ceil(Math.sqrt(range));


    nodes.forEach(node => {
        let norm = node.id-min_node;
        node.pos_x = margin+((norm % grid_size)*(width-margin)/grid_size);
        node.pos_y = margin+(Math.floor(norm / grid_size)*(height-margin)/grid_size);
    })

    const nodeEdgesCount = {};
    for (const linkId in links) {
    const link = links[linkId];
    nodeEdgesCount[link.source] = (nodeEdgesCount[link.source] || 0) + 1;
    nodeEdgesCount[link.target] = (nodeEdgesCount[link.target] || 0) + 1;
    }

    // Update nodes with the size property
    for (const nodeId in nodes) {
    const node = nodes[nodeId];
    const edgesCount = nodeEdgesCount[node.id] || 0;
    node.size = edgesCount;
    }

    let maxSize = Number.MIN_SAFE_INTEGER;
    let minSize = Number.MAX_SAFE_INTEGER;

    // Iterate through nodes to find max and min size
    for (const nodeId in nodes) {
    const node = nodes[nodeId];
    const size = node.size;

    if (size > maxSize) {
        maxSize = size;
    }

    if (size < minSize) {
        minSize = size;
    }
    }


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

// Update links with the thickness property
    for (const linkId in unique_links) {
    const link = unique_links[linkId];
    const linkKey = `${Math.min(link.source, link.target)}-${Math.max(link.source, link.target)}`;
    link.thickness = linkCount[linkKey] || 0;
    }

  

    // node size : how many edges are there
    // link thickness : vo dono nodes ke bichmei kitne links hai


    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(unique_links).id(d => d.id).strength(0.005))
      .force("charge", d3.forceManyBody().strength(-20))
      .force("x", d3.forceX(d => d.pos_x).strength(0.05))
      .force("y", d3.forceY(d => d.pos_y).strength(0.05))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .on("tick", ticked);

      let svg = d3.select("#myNet2 svg")
      .attr("class", "everything2")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");

      var linkSizeScale = d3
        .scaleLinear()
        .domain(d3.extent(links, (d) => d.thickness))
        .range([5, 20]);

      // create node size scale
      var linkColourScale = d3
        .scaleLinear()
        .domain(d3.extent(links, (d) => d.thickness))
        .range(["blue", "red"]);

        var nodeSizeScale = d3
        .scaleLinear()
        .domain([0,192])
        .range([10, 30]);

        // Add a line for each link, and a circle for each node.
        const link = svg.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .selectAll()
            .data(unique_links)
            .join("line")
            .attr("class", "link2")
        .style("stroke", (d) => linkColourScale(d.thickness))
        .attr("stroke-opacity", 0.5)
        .attr("stroke-width", (d) => linkSizeScale(d.thickness))
        .attr("marker-end", "url(#line-end)");

        const node = svg
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll()
            .data(nodes)
            .join("g")
            .attr("class", "node-group2")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        // Append circles to the node group
        node.append("circle")
            .attr("r", (d) => { 
                return nodeSizeScale(d.size) 
            })
            .attr("fill", d => color(d.group));

            function ticked() {

                link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

                // Update group positions
                node.attr("transform", d => `translate(${d.x},${d.y})`);
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



function displayDonut(node) {
    // Remove previous donut
    d3.selectAll(".donut").remove();
    
    const radius = 10;

    // append the svg object to the div called 'my_dataviz'
    const svg = d3.select("#myNet svg")
    .append("g")
        .attr("transform", `translate(${node.x},${node.y})`);

    // Create dummy data
    const data = {a: 9, b: 20, c:30, d:8, e:12}

    // set the color scale
    const color = d3.scaleOrdinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56"])

    // Compute the position of each group on the pie:
    const pie = d3.pie()
    .value(d=>d[1])

    const data_ready = pie(Object.entries(data))

    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    svg
    .selectAll('.donut')
    .data(data_ready)
    .join('path')
    .attr('class', 'donut')
    .attr('fill', d => color(d.data[0]))
    .attr("stroke", "black")
    .style("stroke-width", "1px")
    .style("opacity", 0.7)
    .attr('d', d3.arc()
        .transition().duration(500)
        .innerRadius(nodeSizeScale(node.size))         // This is the size of the donut hole
        .outerRadius(nodeSizeScale(node.size)+radius)
    )
}

export default drawNetworkChart;


