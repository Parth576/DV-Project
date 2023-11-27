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
        'template-demographics': null,
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
        'candidate1-demographics': null,
        'candidate2-demographics': null,
        'candidate3-demographics': null,
        'candidate4-demographics': null,
        'candidate5-demographics': null,
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
        'template-demographics': '../data/processed/demographics-template.csv',
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
        'candidate1-demographics': '../data/processed/demographics-candidate1.csv',
        'candidate2-demographics': '../data/processed/demographics-candidate2.csv',
        'candidate3-demographics': '../data/processed/demographics-candidate3.csv',
        'candidate4-demographics': '../data/processed/demographics-candidate4.csv',
        'candidate5-demographics': '../data/processed/demographics-candidate5.csv',
    };

    document.addEventListener('DOMContentLoaded', function () {
        Promise.all([
            parseGraphData(dataPaths.template),
            parseTemplateNodes(dataPaths.templateNodes),
            parseTemplateDemographics(dataPaths['template-demographics']),
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
            parseTemplateDemographics(dataPaths['candidate1-demographics']),
            parseTemplateDemographics(dataPaths['candidate2-demographics']),
            parseTemplateDemographics(dataPaths['candidate3-demographics']),
            parseTemplateDemographics(dataPaths['candidate4-demographics']),
            parseTemplateDemographics(dataPaths['candidate5-demographics']),
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
        let filteredLeftData;
        let filteredRightData;
        
        if(!filterParams) {
            // default state
            filteredData = {
                ...filteredData,
                leftGraph: dataStore.template,
                leftDemographics: dataStore['template-demographics'],
                rightGraph: dataStore.candidate1,
                rightDemographics: dataStore['candidate1-demographics'],
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
                    leftGraph: dataStore[filterParams['leftGraph']],
                    leftDemographics: dataStore[`${filterParams['leftGraph']}-demographics`]
                };
            }
            if (filterParams.hasOwnProperty('rightGraph')) {
                filteredData = {
                    ...filteredData,
                    rightGraph: dataStore[filterParams['rightGraph']],
                    rightDemographics: dataStore[`${filterParams['rightGraph']}-demographics`]
                };
            }

            filteredLeftData = [...dataStore[filters.leftGraph]];
            filteredRightData = [...dataStore[filters.rightGraph]];

            // apply filters based on current 'filters' object and set filtered data
            ['startTime', 'endTime', 'eType'].forEach((filterType) => {
                if(filterParams.hasOwnProperty(filterType)) {
                    if (filterType === 'eType') {
                        filteredLeftData = [...filteredLeftData.filter((d)=>d.eType===filterParams[filterType])];
                        filteredRightData = [...filteredRightData.filter((d)=>d.eType===filterParams[filterType])];
                    } else if (filterType === 'startTime') {
                        filteredLeftData = [...filteredLeftData.filter((d)=>d.time>=filterParams[filterType])];
                        filteredRightData = [...filteredRightData.filter((d)=>d.time>=filterParams[filterType])];
                    } else {
                        filteredLeftData = [...filteredLeftData.filter((d)=>d.time<=filterParams[filterType])];
                        filteredRightData = [...filteredRightData.filter((d)=>d.time<=filterParams[filterType])];
                    }
                    
                } else {
                    if (filters[filterType] !== null) {
                        if (filterType === 'eType') {
                            filteredLeftData = [...filteredLeftData.filter((d)=>d.eType===filterParams[filterType])];
                            filteredRightData = [...filteredRightData.filter((d)=>d.eType===filterParams[filterType])];
                        } else if (filterType === 'startTime') {
                            filteredLeftData = [...filteredLeftData.filter((d)=>d.time>=filterParams[filterType])];
                            filteredRightData = [...filteredRightData.filter((d)=>d.time>=filterParams[filterType])];
                        } else {
                            filteredLeftData = [...filteredLeftData.filter((d)=>d.time<=filterParams[filterType])];
                            filteredRightData = [...filteredRightData.filter((d)=>d.time<=filterParams[filterType])];
                        }
                    }
                }
            });

            filteredData = {
                ...filteredData,
                leftGraph: filteredLeftData,
                rightGraph: filteredRightData
            };
        }
        filteredData = {
            ...filteredData,
            leftNodes: getNodes(filteredData.leftGraph),
            rightNodes:  getNodes(filteredData.rightGraph),
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
