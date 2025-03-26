let svg = d3.select("#svg");
let width = parseInt(svg.style("width")) || 800;
let height = parseInt(svg.style("height")) || 500;

// Adjusted margins to allow space for the legend
let margin = { top: 50, right: 80, bottom: 100, left: 80 }; // Increased bottom margin
let innerWidth = width - margin.left - margin.right;
let innerHeight = height - margin.top - margin.bottom;
let keyframeIndex = 0;
let g = null;
let xScale = null;
let yScale = null;
let y2Scale = null;
let xAxis = null;
let yAxis = null;
let y2Axis = null;
let currentChartType = "line";
let yearlyData = [];
let ageData = [];
let occupationData = [];
let occupationProportionData = [];
let hoursData = [];
let educationData = [];
let raceData = [];
let data = {};
const numBins = 5;

let keyframes = [
  {
    activeVerse: 1,
    activeLines: [1, 2, 3, 4],
    svgUpdate: WagesByYear,
  },
  {
    activeVerse: 2,
    activeLines: [1, 2, 3, 4],
    svgUpdate: WagesByAge,
  },
  {
    activeVerse: 3,
    activeLines: [1, 2],
    svgUpdate: WagesByOccupation,
  },
  {
    activeVerse: 3,
    activeLines: [3, 4],
    svgUpdate: OccupationByGender,
  },
  {
    activeVerse: 4,
    activeLines: [1, 2, 3, 4],
    svgUpdate: drawBoxPlot,
  },
  {
    activeVerse: 5,
    activeLines: [1, 2, 3, 4],
    svgUpdate: WagesByEducation,
  },
  {
    activeVerse: 6,
    activeLines: [1, 2, 3, 4],
    svgUpdate: WagesByHours,
  },
];

function WagesByYear() {
  drawLineChart(yearlyData);
}

function WagesByAge() {
  drawAgeVerticalBarChart(ageData);
}

function WagesByRace() {
  drawRaceVerticalBarChart(raceData);
}

function WagesByOccupation() {
  drawOccupationHorizontalBarChart(occupationData);
}

function WagesByEducation() {
  drawEducationHorizontalBarChart(educationData);
}

function OccupationByGender() {
  drawOccupationStackedBarChart(occupationProportionData);
}

function WagesByHours() {
  drawHoursBoxPlot(hoursData);
}



// Initialize SVG
function initializeSVG() {
  svg.attr("width", width).attr("height", height);
}

// Initialize everything
async function initialise() {
  // Add event listeners to buttons
  d3.select("#forward-button").on("click", forwardClicked);
  d3.select("#backward-button").on("click", backwardClicked);

  // Add scroll wheel navigation
  addScrollWheelNavigation();

  // Initialize SVG
  initializeSVG();

  // Load data
  data = await loadData();

  // Draw first keyframe
  drawKeyframe(keyframeIndex);
}

// Start the visualization
initialise();
