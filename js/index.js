import appState from './main.js';
// appState.applyFilters({ 'leftGraph': 'candidate2' })
// appState.applyFilters({ 'leftGraph':'template', 'rightGraph': 'candidate' })

var nwkMapping = {
    'Template Ntwrk' : 'template',
    'Candidate 1' : 'candidate1',
    'Candidate 2' : 'candidate2',
    'Candidate 3' : 'candidate3',
    'Candidate 4' : 'candidate4',
    'Candidate 5' : 'candidate5',
}

const leftItems = ["Template Ntwrk", "Candidate 1", "Candidate 2", "Candidate 3", "Candidate 4", "Candidate 5"];
let currentLeftIndex = 0;
function updateLeftDisplayText() {
    document.getElementById("lDisplayText").textContent = leftItems[currentLeftIndex];
}
function lLeftBtn() {
    currentLeftIndex = (currentLeftIndex - 1 + leftItems.length) % leftItems.length;
    console.log(nwkMapping[leftItems[currentLeftIndex]])
    appState.applyFilters({ 'leftGraph': nwkMapping[leftItems[currentLeftIndex]] })
    updateLeftDisplayText();
    console.log("Left Left button clicked");
}
function lRightBtn() {
    currentLeftIndex = (currentLeftIndex + 1) % leftItems.length;
    console.log(nwkMapping[leftItems[currentLeftIndex]])
    appState.applyFilters({ 'leftGraph': nwkMapping[leftItems[currentLeftIndex]] })
    updateLeftDisplayText();
    console.log("Left Right button clicked");
}


const rightItems = [ "Template Ntwrk", "Candidate 1", "Candidate 2", "Candidate 3", "Candidate 4", "Candidate 5"];
let currentRightIndex = 0;
function updateRightDisplayText() {
    document.getElementById("rDisplayText").textContent = rightItems[currentRightIndex];
}
function rLeftBtn() {
    currentRightIndex = (currentRightIndex - 1 + rightItems.length) % rightItems.length;
    console.log(nwkMapping[rightItems[currentRightIndex]])
    appState.applyFilters({ 'rightGraph': nwkMapping[rightItems[currentRightIndex]] })
    updateRightDisplayText();
    console.log("Right Left button clicked");
}
function rRightBtn() {
    currentRightIndex = (currentRightIndex + 1) % rightItems.length;
    console.log(nwkMapping[rightItems[currentRightIndex]])
    appState.applyFilters({ 'rightGraph': nwkMapping[rightItems[currentRightIndex]] })
    updateRightDisplayText();
    console.log("Right Right button clicked");
}

const leftSwitch = document.getElementById('switchLeft');
const rightSwitch = document.getElementById('switchRight');

// Get the card elements
const leftStream = document.getElementById('leftStream');
const rightStream = document.getElementById('rightStream');

leftSwitch.addEventListener('change', updateCardVisibility);
rightSwitch.addEventListener('change', updateCardVisibility);

function updateCardVisibility() {
    // Display Stream card if left switch is checked, otherwise hide it
    if (leftSwitch.checked) {
        leftStream.innerHTML = 'Heat Map';
    } else {
        leftStream.innerHTML = 'Stream Graph';
    }

    // Display Heat card if right switch is checked, otherwise hide it
    if (rightSwitch.checked) {
      rightStream.innerHTML = "Heat Map"
    } else {
      rightStream.innerHTML = "Stream Graph"
    }
  }


window.lLeftBtn = lLeftBtn;
window.lRightBtn = lRightBtn;
window.rLeftBtn = rLeftBtn;
window.rRightBtn = rRightBtn;