import drawBarChart from './bar-demographics.js';
import drawNetworkChart from './network.js';
import drawHeatmap from "./heatmap.js";
import drawPieChart from './piechart.js';

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
        'templateDemographics': null,
        'candidate1': null,
        'candidate2': null,
        'candidate3': null,
        'candidate4': null,
        'candidate5': null,
        'candidate1-map': null,
        'candidate2-map': null,
        'candidate3-map': null,
        'candidate4-map': null,
        'candidate5-map': null,
    };
    let filteredData = {
        'leftGraph': null,
        'rightGraph': null,
        'leftNodes': null,
        'rightNodes': null,
        'leftDemographics': null,
        'rightDemographics': null,
        'leftSelectedNode': null,
        'rightSelectedNode': null,
    }
    let dataPaths = {
        'template': '../data/processed/CGCS-Template-Processed-data.csv',
        'templateNodes': '../data/processed/template-nodes.csv',
        'templateDemographics': '../data/processed/demographics-template.csv',
        'candidate1': '../data/processed/candidate1-processed.csv',
        'candidate3': '../data/processed/candidate2-processed.csv',
        'candidate2': '../data/processed/candidate3-processed.csv',
        'candidate4': '../data/processed/candidate4-processed.csv',
        'candidate5': '../data/processed/candidate5-processed.csv',
        'candidate1-map': '../data/processed/candidate1-map.csv',
        'candidate2-map': '../data/processed/candidate1-map.csv',
        'candidate3-map': '../data/processed/candidate1-map.csv',
        'candidate4-map': '../data/processed/candidate1-map.csv',
        'candidate5-map': '../data/processed/candidate1-map.csv',
    };

    document.addEventListener('DOMContentLoaded', function () {
        Promise.all([
            parseGraphData(dataPaths.template),
            parseTemplateNodes(dataPaths.templateNodes),
            parseTemplateDemographics(dataPaths.templateDemographics),
            parseGraphData(dataPaths.candidate1),
            parseGraphData(dataPaths.candidate2),
            parseGraphData(dataPaths.candidate3),
            parseGraphData(dataPaths.candidate4),
            parseGraphData(dataPaths.candidate5),
            parseMapData(dataPaths['candidate1-map']),
            parseMapData(dataPaths['candidate2-map']),
            parseMapData(dataPaths['candidate3-map']),
            parseMapData(dataPaths['candidate4-map']),
            parseMapData(dataPaths['candidate5-map']),
        ])
             .then(function (values) {
                Object.keys(dataStore).forEach((fileName, index) => {
                    dataStore[fileName] = values[index];
                })
                applyFilters(null);
             });
     });

    // Getter function for getting the current data object
    function getDataStore() {
        return filteredData;
    }

    function getOGDataStore() {
        return dataStore;
    }

    function getFilters() {
        return filters;
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
        let prevLeftData = [...filteredData.leftGraph];
        let prevRightData = [...filteredData.rightGraph];
        if(!filterParams) {
            // default state
            filteredData = {
                ...filteredData,
                leftGraph: dataStore.template,
                rightGraph: dataStore.candidate1
            };
        } else  {
            const newFilters = {
                ...filters,
                ...filterParams
            }
            filters = {...newFilters};
            if (filterParams.hasOwnProperty('leftGraph')) {
                filteredData = {
                    ...filteredData,
                    leftGraph: dataStore[filterParams['leftGraph']]
                };
            }
            if (filterParams.hasOwnProperty('rightGraph')) {
                filteredData = {
                    ...filteredData,
                    rightGraph: dataStore[filterParams['rightGraph']]
                };
            }

            // apply filters based on current 'filters' object and set filtered data
            if (filterParams.hasOwnProperty('startTime')) {
                prevLeftData = [...prevLeftData.filter((d)=>d.startTime===filterParams.startTime)];
                prevRightData = [...prevRightData.filter((d)=>d.startTime===filterParams.startTime)];
            }
            if (filterParams.hasOwnProperty('endTime')) {
                prevLeftData = [...prevLeftData.filter((d)=>d.endTime===filterParams.endTime)];
                prevRightData = [...prevRightData.filter((d)=>d.endTime===filterParams.endTime)];
            }
            if (filterParams.hasOwnProperty('eType')) {
                prevLeftData = [...prevLeftData.filter((d)=>d.eType===filterParams.eType)];
                prevRightData = [...prevRightData.filter((d)=>d.eType===filterParams.eType)];
            }

        }
        filteredData = {
            ...filteredData,
            leftGraph: prevLeftData,
            rightGraph: prevRightData,
            leftNodes: getNodes(filteredData.leftGraph),
            rightNodes:  getNodes(filteredData.rightGraph),
            leftDemographics: dataStore.templateDemographics,
            rightDemographics: dataStore.templateDemographics,
        }
        drawNetworkChart();
        drawBarChart();
        drawHeatmap();
        drawPieChart();
    }

    return {
        getDataStore: getDataStore,
        applyFilters: applyFilters,
        getOriginalData: getOGDataStore,
        getFilters: getFilters

    }
})();

async function parseGraphData(path) {
    const startDate = new Date('2025-01-01T00:00:00');
    const newData = await d3.csv(path, (d) => {
        return {
            'source': parseInt(d.Source),
            'target': parseInt(d.Target),
            'eType': parseInt(d.eType),
            'weight': parseInt(d.Weight),
            'time': new Date(startDate.getTime() + (d.Time * 1000)),
        }
    })
    return newData;
}

async function parseTemplateNodes(path) {
    const newData = await d3.csv(path)
    const nodeList = newData.map(d => ({ id: parseInt(d.NodeID) }));
    return nodeList;
}

async function parseTemplateDemographics(path) {
    const newData = await d3.csv(path)
    return newData;
}

async function parseMapData(path) {
    let newMapData = await d3.csv(path, (d)=> {
        return {
            'targetLocation': parseInt(d.TargetLocation),
            'count': parseInt(d.Count)
        }
    })
    return newMapData;
}

export default appState;
