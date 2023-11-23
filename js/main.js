import drawNetworkChart from './network.js';

/*
Custom edge types:
0 = email
1 = phone
2 = buy/sell
3 = travel
*/

const appState = (function() {
    const filters = {
       'startTime': null,
        'endTime': null,
        'eType': null,
        'selectedNode': null
    }; 
    const dataStore = {
        'template': null,
        'templateNodes': null,
        'candidate1': null,
        'candidate2': null,
        'candidate3': null,
        'candidate4': null,
        'candidate5': null,
    };
    const dataPaths = {
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
                applyFilters();
             });
     });

    // Getter function for getting the current data object
    function getDataStore() {
        return dataStore;
    }

    // fn to apply filters and update all the graphs based on that, call getDataStore() to get updated data object
    function applyFilters() {
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
            'source': d.Source,
            'target': d.Target,
            'eType': d.eType,
            'weight': d.Weight,
            'time': new Date(startDate.getTime() + (d.Time*1000)),
        }
    })
    return newData;
}

async function parseTemplateNodes(path) {
    const newData = await d3.csv(path)
    const nodeList = newData.map(d => parseInt(d.NodeID));
    return nodeList;
}

export default appState;
