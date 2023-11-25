import drawNetworkChart from './network.js';

/*
Custom edge types:
0 = email
1 = phone
2 = buy/sell
3 = travel
*/

const appState = (function() {
    let filters = {
       'startTime': null,
        'endTime': null,
        'eType': null,
        'leftNode': null,
        'rightNode': null,
        'leftGraph': 'template',
        'rightGraph': 'candidate1'
    }; 
    let dataStore = {
        'template': null,
        'templateNodes': null,
        'candidate1': null,
        'candidate2': null,
        'candidate3': null,
        'candidate4': null,
        'candidate5': null,
    };
    let filteredData = {
        'leftGraph': null,
        'rightGraph': null,
        'leftNodes': null,
        'rightNodes': null
    }
    let dataPaths = {
        'template': '../data/processed/CGCS-Template-Processed-data.csv',
        'templateNodes': '../data/processed/template-nodes.csv',
        'candidate1': '',
        'candidate2': '',
        'candidate3': '',
        'candidate4': '',
        'candidate5': '',
    };

    document.addEventListener('DOMContentLoaded', function () {
        Promise.all([
            parseGraphData(dataPaths.template),
            parseTemplateNodes(dataPaths.templateNodes)
        ])
             .then(function (values) {
                dataStore.template = values[0];
                dataStore.templateNodes = values[1];
                applyFilters(null);
             });
     });

    // Getter function for getting the current data object
    function getDataStore() {
        return filteredData;
    }

    function getNodes(edgeList) {
        let uniqueNodes = new Set();
        edgeList.forEach((elem) => {
            uniqueNodes.add(elem.source);
            uniqueNodes.add(elem.target);
        });
        return Array.from(uniqueNodes);
    }

    // fn to apply filters and update all the graphs based on that, call getDataStore() to get updated data object
    function applyFilters(filterParams) {
        if(!filterParams) {
           filteredData.leftGraph = dataStore.template; 
           filteredData.rightGraph = dataStore.template; 
        } else  {
            const newFilters = {
                ...filters,
                ...filterParams
            }
            filters = {...newFilters};
            console.log(filters);
            if (filters.hasOwnProperty('leftGraph')) {
                filteredData.leftGraph = dataStore[filterParams['leftGraph']];
            }
            if (filters.hasOwnProperty('rightGraph')) {
                filteredData.rightGraph = dataStore[filterParams['rightGraph']];
            }
            // apply filters based on current 'filters' object and set filtered data 
        }
        filteredData.leftNodes = getNodes(filteredData.leftGraph);
        console.log(filteredData.leftNodes);
        filteredData.rightNodes = getNodes(filteredData.rightGraph);
        drawNetworkChart();
    }

    return {
        getDataStore: getDataStore,
        applyFilters: applyFilters
    }
})();

async function parseGraphData(path){
    const startDate = new Date('2025-01-01T00:00:00');
    const newData = await d3.csv(path, (d)=> {
        return {
            'source': parseInt(d.Source),
            'target': parseInt(d.Target),
            'eType': parseInt(d.eType),
            'weight': parseInt(d.Weight),
            'time': new Date(startDate.getTime() + (d.Time*1000)),
        }
    })
    return newData;
}

async function parseTemplateNodes(path) {
    const newData = await d3.csv(path)
    const nodeList = newData.map(d => ({ id: parseInt(d.NodeID) }));
    return nodeList;
}

export default appState;
