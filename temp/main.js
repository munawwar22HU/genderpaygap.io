/* This code is my own work, it was written without consulting code written by other
students current or previous or using any AI tools. AI tools were only used for 
debugging (Muhammad Munawwar Anwar) */
let yearlyData = [];
// TODO add svgUpdate fields to keyframes (DONE)
let keyframes = [
  {
    activeVerse: 1,
    activeLines: [1],
    svgUpdate: createLineChart,
  },
  {
    activeVerse: 1,
    activeLines: [2],
    svgUpdate: createLineChart,
  },
  {
    activeVerse: 1,
    activeLines: [3],
    svgUpdate: createLineChart,
  },
  {
    activeVerse: 1,
    activeLines: [4],
    svgUpdate: createLineChart,
  },
  {
    activeVerse: 2,
    activeLines: [1, 2, 3, 4],
    svgUpdate: createLineChart,
  },
  {
    activeVerse: 3,
    activeLines: [1, 2, 3, 4],
    svgUpdate: createLineChart,
  },
  {
    activeVerse: 4,
    activeLines: [1, 2, 3, 4],
    svgUpdate: createLineChart,
  },
  {
    activeVerse: 5,
    activeLines: [1, 2, 3, 4],
    svgUpdate: createLineChart,
  },
  {
    activeVerse: 6,
    activeLines: [1, 2, 3, 4],
    svgUpdate: createLineChart,
  },
];

// TODO write a function which will display the rose data sorted from highest to lowest (DONE)
// HINT Be careful when sorting the data that you don't change the rosechartData variable itself, otherwise when you a user clicks back to the start it will always be sorted
// HINT If you have correctly implemented your updateBarchart function then you won't need to do anything extra to make sure it animates smoothly (just pass a sorted version of the data to updateBarchart)

function displaySortedRoseData() {
  const sortedData = [...roseChartData].sort((a, b) => b.count - a.count);
  updateBarChart(sortedData, "Distribution of Rose Colours");
}
// TODO define global variables
let svg = d3.select("#svg");
let keyframeIndex = 0;

const width = 800;
const height = 400;

let chart;
let chartWidth;
let chartHeight;

let xScale;
let yScale;

// TODO add event listeners to the buttons
document
  .getElementById("forward-button")
  .addEventListener("click", forwardClicked);
document
  .getElementById("backward-button")
  .addEventListener("click", backwardClicked);

// TODO write an asynchronous loadData function (DONE)
// TODO call that in our initalise function (DONE)
async function loadData() {
  await d3.json("./data/rose_colours.json").then((data) => {
    roseChartData = data;
  });
  console.log(roseChartData);

  await d3.json("./data/violet_colours.json").then((data) => {
    violetChartData = data;
  });

  // Load and format gender pay gap dataset
  await d3.csv("./data/gender-pay-gap-dataset-final.csv").then((data) => {
    // Format CSV data by converting strings to numbers for 'year' and 'incwage'
    genderPayGapData = data.map((d) => {
      return {
        year: +d.year, // Convert 'year' to a number
        age: +d.age, // Convert 'age' to a number
        sex: d.sex, // Keep 'sex' as a string
        race: d.race, // Keep 'race' as a string
        incwage: +d.incwage, // Convert 'incwage' to a number
        annhrs: +d.annhrs, // Convert 'annhrs' to a number
        Occupation: d.Occupation, // Keep 'Occupation' as a string
        Education: d.Education, // Keep 'Education' as a string
      };
    });

    console.log("Gender Pay Gap Data:", genderPayGapData); // Check the formatted data

    // Group the data by 'year' and 'sex' (Male/Female)
    const groupedData = d3.group(
      genderPayGapData,
      (d) => d.year, // Group by 'year'
      (d) => d.sex // Group by 'sex'
    );

    // Create an object with the average 'incwage' for each 'year'
    const avgIncwageByYear = [];

    // Calculate average income for each year (combined for both sexes)
    groupedData.forEach((sexGroups, year) => {
      // Separate entries for men and women
      const menEntries = sexGroups.get("Male") || []; // Use empty array if no data for Male
      const womenEntries = sexGroups.get("Female") || []; // Use empty array if no data for Female

      // Calculate the average wage for both sexes
      const avgMenWage = d3.mean(menEntries, (d) => d.incwage) || 0; // Default to 0 if no data
      const avgWomenWage = d3.mean(womenEntries, (d) => d.incwage) || 0; // Default to 0 if no data

      // Calculate the wage gap as a percentage
      const gapPercentage = ((avgMenWage - avgWomenWage) / avgMenWage) * 100;

      // Push a single entry with combined data for each year
      avgIncwageByYear.push({
        year: +year,
        menWage: Math.round(avgMenWage), // Round the wages
        womenWage: Math.round(avgWomenWage),
        gapPercentage: Math.round(gapPercentage * 10) / 10, // Round the gap to one decimal place
      });

      // Sort the data by year
      avgIncwageByYear.sort((a, b) => a.year - b.year);
    });

    console.log(avgIncwageByYear); // This will log the resulting data

    // Store the computed data into a global variable 'yearlyData'
    yearlyData = avgIncwageByYear;

    // Optionally, log or use 'yearlyData' further down the code
  });
}
// TODO draw a bar chart from the rose dataset
function drawRoseColours() {
  updateBarChart(roseChartData, "Distribution of Rose Colours");
}
// TODO draw a bar chart from the violet dataset
function drawVioletColours() {
  updateBarChart(violetChartData, "Distribution of Violet Colours");
}
// Clear SVG for new chart
function clearChartArea() {
  svg.selectAll("*").remove();
  g = null;
}
function createLineChart() {
  // Remove existing content from the chart area
  chart.selectAll("*").remove();

  // Increased right margin to accommodate legend
  const margin = { top: 50, right: 180, bottom: 50, left: 80 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const chartGroup = chart
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Group data by 'year' and 'sex'
  const groupedData = d3.group(
    yearlyData,
    (d) => d.year,
    (d) => d.sex
  );

  // Create an array with the data we need for plotting
  const processedData = [];

  groupedData.forEach((sexGroups, year) => {
    sexGroups.forEach((entries, sex) => {
      const avgIncwage = entries[0].avgIncwage;
      processedData.push({ year: +year, sex, avgIncwage });
    });
  });

  // Get unique years from the dataset
  const uniqueYears = Array.from(
    new Set(processedData.map((d) => d.year))
  ).sort();

  // Determine min and max years for padding
  const yearExtent = [uniqueYears[0], uniqueYears[uniqueYears.length - 1]];
  const yearPadding = 1;

  // Scales
  const xScale = d3
    .scaleLinear()
    .domain([yearExtent[0] - yearPadding, yearExtent[1] + yearPadding])
    .range([0, chartWidth]);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(processedData, (d) => d.avgIncwage) * 1.1]) // Add 10% padding
    .range([chartHeight, 0]);

  // Color scale with more distinctive colors
  const colorScale = d3
    .scaleOrdinal()
    .domain(["Male", "Female"])
    .range(["#1F77B4", "#FF7F0E"]); // Blue for Male, Orange for Female

  // Group by 'sex', sort each group by year, and draw lines
  const categories = Array.from(new Set(processedData.map((d) => d.sex)));

  categories.forEach((category) => {
    // Filter and sort data for each category
    const categoryData = processedData
      .filter((d) => d.sex === category)
      .sort((a, b) => a.year - b.year);

    // Line generator with curve interpolation for smoother lines
    const line = d3
      .line()
      .curve(d3.curveCatmullRom) // Smoother line interpolation
      .x((d) => xScale(d.year))
      .y((d) => yScale(d.avgIncwage));

    // Draw line
    chartGroup
      .append("path")
      .datum(categoryData)
      .attr("fill", "none")
      .attr("stroke", colorScale(category))
      .attr("stroke-width", 3)
      .attr("d", line)
      .attr("opacity", 0.7);

    // Add circle markers at data points
    chartGroup
      .selectAll(`.dot-${category}`)
      .data(categoryData)
      .enter()
      .append("circle")
      .attr("class", `dot-${category}`)
      .attr("cx", (d) => xScale(d.year))
      .attr("cy", (d) => yScale(d.avgIncwage))
      .attr("r", 5)
      .attr("fill", colorScale(category))
      .attr("stroke", "white")
      .attr("stroke-width", 2);
  });

  // X-Axis with only the years present in the dataset
  chartGroup
    .append("g")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(
      d3.axisBottom(xScale).tickFormat(d3.format("d")).tickValues(uniqueYears)
    )
    .selectAll("text")
    .style("font-size", "12px");

  // Y-Axis with dollar formatting
  chartGroup
    .append("g")
    .call(d3.axisLeft(yScale).tickFormat((d) => `$${d3.format(",")(d)}`))
    .selectAll("text")
    .style("font-size", "12px");

  // Axis Labels
  chartGroup
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 20)
    .attr("x", -chartHeight / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Average Annual Income");

  chartGroup
    .append("text")
    .attr("x", chartWidth / 2)
    .attr("y", chartHeight + margin.bottom)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Year");

  // Chart Title
  chart
    .append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text("Gender Pay Gap: Average Annual Income");

  // Legend
  const legend = chartGroup
    .append("g")
    .attr("transform", `translate(${chartWidth + 20}, 0)`);

  categories.forEach((category, i) => {
    const legendRow = legend
      .append("g")
      .attr("transform", `translate(0, ${i * 30})`);

    legendRow
      .append("rect")
      .attr("width", 20)
      .attr("height", 3)
      .attr("fill", colorScale(category));

    legendRow
      .append("text")
      .attr("x", 25)
      .attr("y", 0)
      .text(category)
      .style("font-size", "14px")
      .attr("alignment-baseline", "middle");
  });
}
function updateBarChart(data, title = "") {
  // TODO: Update the xScale domain to match new order
  xScale.domain(data.map((d) => d.colour));
  // TODO: Update the yScale domain for new values
  yScale.domain([0, d3.max(data, (d) => d.count)]).nice();

  // TODO: Select all the existing bars
  const bars = chart.selectAll(".bar").data(data, (d) => d.colour);

  // TODO: Remove any bars no longer in the dataset
  bars
    .exit()
    .transition()
    .duration(1000)
    .attr("height", 0)
    .attr("y", chartHeight)
    .remove();
  // TODO: Move any bars that already existed to their correct spot
  bars
    .transition()
    .duration(1000)
    .attr("x", (d) => xScale(d.colour))
    .attr("y", (d) => yScale(d.count))
    .attr("width", xScale.bandwidth())
    .attr("height", (d) => chartHeight - yScale(d.count))
    .attr("fill", (d) => d.color || "#999");
  // TODO: Add any new bars
  bars
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => xScale(d.colour))
    .attr("y", chartHeight)
    .attr("width", xScale.bandwidth())
    .attr("height", 0)
    .attr("fill", (d) => d.color || "#999")
    .transition()
    .duration(1000)
    .attr("y", (d) => yScale(d.count))
    .attr("height", (d) => chartHeight - yScale(d.count));
  // TODO: Update the x and y axis
  chart
    .select(".x-axis")
    .transition()
    .duration(1000)
    .call(d3.axisBottom(xScale));

  chart.select(".y-axis").transition().duration(1000).call(d3.axisLeft(yScale));
  // TODO: Update the title
  if (title.length > 0) {
    svg.select("#chart-title").transition().duration(1000).text(title);
  }
}

// TODO define behaviour when the forwards button is clicked
function forwardClicked() {
  if (chart) {
    chart.selectAll(".bar").attr("fill", "#999");
  }

  if (keyframeIndex < keyframes.length - 1) {
    keyframeIndex++;
    drawKeyframe(keyframeIndex);
  } else {
    svg.selectAll("*").remove();
    keyframeIndex = 0;
    initialiseSVG();
    drawKeyframe(keyframeIndex);
  }
}

// TODO define behaviour when the backwards button is clicked
function backwardClicked() {
  // if (chart && keyframeIndex !== keyframes.length - 1) {
  //     chart.selectAll(".bar").attr("fill", "#999");
  // }

  if (keyframeIndex > 0) {
    svg.selectAll("*").remove();

    keyframeIndex--;

    initialiseSVG();
    keyframeIndex--;
    drawKeyframe(keyframeIndex);
  } else {
    keyframeIndex = keyframes.length - 1;
    drawKeyframe(keyframeIndex);
  }
}

function drawKeyframe(kfi) {
  // TODO: Get keyframe at index position
  let kf = keyframes[kfi];

  // TODO: Reset any active lines
  resetActiveLines();

  // TODO: Update the active verse
  updateActiveVerse(kf.activeVerse);

  // TODO: Update any active lines
  for (line of kf.activeLines) {
    updateActiveLine(kf.activeVerse, line);
  }
  // TODO: Update the svg
  if (kf.svgUpdate) {
    kf.svgUpdate();
  }
}

// TODO write a function to reset any active lines
function resetActiveLines() {
  d3.selectAll(".line").classed("active-line", false);
}

// TODO: Write a function to scroll the left column to the right place
function scrollLeftColumnToActiveVerse(id) {
  // TODO: Select the div displaying the left column content
  var leftColumn = document.querySelector(".left-column-content");

  // TODO: Select the verse we want to display
  var activeVerse = document.getElementById("verse" + id);

  // TODO: Calculate the bounding rectangles of both of these elements
  var verseRect = activeVerse.getBoundingClientRect();
  var leftColumnRect = leftColumn.getBoundingClientRect();

  // TODO: Calculate the desired scroll position
  var desiredScrollTop =
    verseRect.top +
    leftColumn.scrollTop -
    leftColumnRect.top -
    (leftColumnRect.height - verseRect.height) / 2;

  // TODO: Scroll to the desired position
  leftColumn.scrollTo({
    top: desiredScrollTop,
    behavior: "smooth",
  });
}

// TODO: Write a function to update the active verse
function updateActiveVerse(id) {
  d3.selectAll(".verse").classed("active-verse", false);
  d3.select("#verse" + id).classed("active-verse", true);
  scrollLeftColumnToActiveVerse(id);
}

// TODO write a function to update the active line
function updateActiveLine(vid, lid) {
  let thisVerse = d3.select("#verse" + vid);

  thisVerse.select("#line" + lid).classed("active-line", true);
}
// TODO write a function to initialise the svg properly
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

// Reference: https://medium.com/%40aleksej.gudkov/creating-a-pie-chart-with-d3-js-a-complete-guide-b69fd35268ea
// Styling: ChatGPT
function createPieChart() {
  chart.selectAll("*").remove();

  const radius = Math.min(chartWidth, chartHeight) / 2;

  const pieGroup = chart
    .append("g")
    .attr("transform", `translate(${chartWidth / 2}, ${chartHeight / 2})`);

  const pie = d3.pie().value((d) => d.count);

  const arc = d3.arc().innerRadius(0).outerRadius(radius);

  const pieData = pie(roseChartData);

  const slices = pieGroup
    .selectAll("path")
    .data(pieData)
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("fill", (d) => d.data.colour) // Directly use the color from data
    .attr("stroke", "white");

  pieGroup
    .selectAll("text")
    .data(pieData)
    .enter()
    .append("text")
    .attr("transform", (d) => {
      let pos = arc.centroid(d); // Get slice centroid
      let scaleFactor = d.endAngle - d.startAngle < 0.3 ? 1.2 : 1.35; // Adjust based on slice size

      pos[0] *= scaleFactor; // Scale X position outward
      pos[1] *= scaleFactor; // Scale Y position outward

      return `translate(${pos[0]}, ${pos[1]})`;
    })
    .text((d) => `${d.data.colour} (${d.data.count})`)
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .style("fill", "black")
    .style("text-anchor", "middle")
    .style("alignment-baseline", "middle");

  pieGroup.select("#chart-title").text("Rose Colors Distribution (Pie Chart)");
}
async function initialise() {
  await loadData();
  initialiseSVG();
  drawKeyframe(keyframeIndex);
}

initialise();
