import appState from "./main.js";

let svg, data;
function drawHeatmap() {
    const dataStore = appState.getDataStore();
    // TODO: change datastore
    data = dataStore.leftGraph;
}


export default drawHeatmap;