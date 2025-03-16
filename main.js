let genderPayData;
let keyframeIndex = 0;

const width = 500;
const height = 400;

let chart;
let chartWidth;
let chartHeight;

let xScale;
let yScale;

let keyframes = [
  {
    activeVerse: 1,
    activeLines: [1, 2, 3, 4],
  },
  {
    activeVerse: 2,
    activeLines: [1, 2, 3],
  },
  {
    activeVerse: 3,
    activeLines: [1],
  },
  {
    activeVerse: 3,
    activeLines: [2],
  },
  {
    activeVerse: 3,
    activeLines: [3],
  },
  {
    activeVerse: 3,
    activeLines: [4],
  },
  {
    activeVerse: 4,
  },
];

let svg = d3.select("#svg");

function initialiseSVG() {
    svg.attr("width", width);
    svg.attr("height", height);

    svg.selectAll("*").remove();

    const margin = { top: 30, right: 30, bottom: 50, left: 50 };
    chartWidth = width - margin.left - margin.right;
    chartHeight = height - margin.top - margin.bottom;

    chart = svg
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    xScale = d3.scaleBand().domain([]).range([0, chartWidth]).padding(0.1);

    yScale = d3.scaleLinear().domain([]).nice().range([chartHeight, 0]);

    chart
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text");

    chart
        .append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale))
        .selectAll("text");

    svg
        .append("text")
        .attr("id", "chart-title")
        .attr("x", width / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("fill", "white")
        .text("");
}


function forwardClicked() {
  // TODO define behaviour when the forwards button is clicked
  if (keyframeIndex < keyframes.length - 1) {
    keyframeIndex++;
    drawKeyframe(keyframeIndex);
  }
}

function backwardClicked() {
  // TODO define behaviour when the backwards button is clicked

  if (keyframeIndex > 0) {
    keyframeIndex--;
    drawKeyframe(keyframeIndex);
  }
}

function drawKeyframe(kfi) {
  // TODO get keyframe at index position
  let kf = keyframes[kfi];

  // TODO reset any active lines
  resetActiveLines();

  // TODO update the active verse
  updateActiveVerse(kf.activeVerse);

  // TODO update any active lines
  for (line of kf.activeLines) {
    updateActiveLine(kf.activeVerse, line);
  }

  // TODO update the svg
  // We need to check if their is an svg update function defined or not
  if (kf.svgUpdate) {
    // If there is we call it like this
    kf.svgUpdate();
  }
}

// TODO write a function to reset any active lines
function resetActiveLines() {
  d3.selectAll(".line").classed("active-line", false);
}

function scrollLeftColumnToActiveVerse(id) {
  // First we want to select the div that is displaying our text content
  var leftColumn = document.querySelector(".left-column-content");

  // Now we select the actual verse we would like to be centred, this will be the <ul> element containing the verse
  var activeVerse = document.getElementById("verse" + id);

  // The getBoundingClientRect() is a built in function that will return an object indicating the exact position
  // Of the relevant element relative to the current viewport.
  // To see a full breakdown of this read the documentation here: https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
  var verseRect = activeVerse.getBoundingClientRect();
  var leftColumnRect = leftColumn.getBoundingClientRect();

  // Now we calculate the exact location we would like to scroll to in order to centre the relevant verse
  // Take a moment to rationalise that this calculation does what you expect it to
  var desiredScrollTop =
    verseRect.top +
    leftColumn.scrollTop -
    leftColumnRect.top -
    (leftColumnRect.height - verseRect.height) / 2;

  // Finally we scroll to the right location using another built in function.
  // The 'smooth' value means that this is animated rather than happening instantly
  leftColumn.scrollTo({
    top: desiredScrollTop,
    behavior: "smooth",
  });
}

// TODO write a function to update the active verse
function updateActiveVerse(id) {
  d3.selectAll(".verse").classed("active-verse", false);

  // Update the class list of the desired verse so that it now includes the class "active-verse"
  d3.select("#verse" + id).classed("active-verse", true);

  scrollLeftColumnToActiveVerse(id);
}

// TODO write a function to update the active line
function updateActiveLine(vid, lid) {
  let thisVerse = d3.select("#verse" + vid);
  // Update the class list of the relevant lines
  thisVerse.select("#line" + lid).classed("active-line", true);
}

document
  .getElementById("forward-button")
  .addEventListener("click", forwardClicked);
document
  .getElementById("backward-button")
  .addEventListener("click", backwardClicked);

import { poemData } from "./poem.js";

async function loadData() {
  console.log("Loading data...");
  await d3.csv("data/gender-pay-gap-dataset.csv").then((data) => {
    genderPayData = data;
  });
}

function generatePoemHTML(poemData) {
  const container = document.querySelector(".left-column-content");

  // Append the filler-verse before the poem lines
  const fillerBefore = document.createElement("div");
  fillerBefore.classList.add("filler-verse");
  container.appendChild(fillerBefore);

  poemData.forEach((verse) => {
    const ul = document.createElement("ul");
    ul.classList.add("verse");
    ul.id = verse.id;

    verse.lines.forEach((line, index) => {
      const li = document.createElement("li");
      li.classList.add("line");
      li.id = `line${index + 1}`;
      li.innerHTML = line;
      ul.appendChild(li);
    });

    container.appendChild(ul);
  });

  // Append the filler-verse after the poem lines
  const fillerAfter = document.createElement("div");
  fillerAfter.classList.add("filler-verse");
  container.appendChild(fillerAfter);
}

async function init() {
  await loadData();
  initialiseSVG();
  console.log(genderPayData);
  generatePoemHTML(poemData);
  drawKeyframe(keyframeIndex);
}

init();
