import appState from './main.js';

function drawNetworkChart() {
    console.log('trace:drawNetworkpChart()');
    const dataStore = appState.getDataStore();
    console.log(dataStore.template);
    console.log(dataStore.templateNodes);
}


export default drawNetworkChart;


