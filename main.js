// Define keyframes for the visualization
let keyframes = [
  {
    activeVerse: 1,
    activeLines: [1, 2, 3, 4],
    svgUpdate: drawLineChart,
  },
  {
    activeVerse: 2,
    activeLines: [1, 2, 3, 4],
    svgUpdate: drawBarChart,
  },
  {
    activeVerse: 3,
    activeLines: [1, 2],
    svgUpdate: drawStackedBarChart,
  },
  {
    activeVerse: 3,
    activeLines: [3, 4],
    svgUpdate: drawStackedBarChart1,
  },
  {
    activeVerse: 4,
    activeLines: [1, 2, 3, 4],
    svgUpdate: drawBoxPlot,
  },
  {
    activeVerse: 5,
    activeLines: [1, 2, 3, 4],
    svgUpdate: drawEducationBar,
  },
  {
    activeVerse: 6,
    activeLines: [1, 2, 3, 4],
    svgUpdate: drawRaceBars,
    // svgUpdate: () => drawRaceData(data.raceData),
  },
];

function drawLineChart() {
  drawYearlyTrends(yearlyData);
}

function drawBarChart() {
  drawAgeGroups(ageData);
}

function drawStackedBarChart() {
  drawCombinedOccupationViz(occupationData);
}

function drawStackedBarChart1() {
  showOccupationStackedBarChart(occupationProportionData);
}

function drawBoxPlot() {
  drawHoursWorked(hoursData);
}
function drawEducationBar() {
  drawCombinedEducationViz(educationData);
}

function drawRaceBars() {
  drawRaceData(raceData);
}
// Load data from the dataset
async function loadData() {
  const numBins = 5; // User-defined age bins

  // Load and format gender pay gap dataset
  await d3.csv("gender-pay-gap-dataset-final.csv").then((data) => {
    genderPayGapData = data.map((d) => ({
      year: +d.year,
      age: +d.age,
      sex: d.sex,
      race: d.race,
      incwage: +d.incwage,
      annhrs: +d.annhrs,
      Occupation: d.Occupation,
      Education: d.Education,
      ft: d.ft_status,
    }));

    console.log("Loaded data:", genderPayGapData);

    // === Compute Average Wage by Year ===
    const groupedData = d3.group(
      genderPayGapData,
      (d) => d.year,
      (d) => d.sex
    );
    const avgIncwageByYear = [];

    groupedData.forEach((sexGroups, year) => {
      const menEntries = sexGroups.get("Male") || [];
      const womenEntries = sexGroups.get("Female") || [];

      const avgMenWage = d3.mean(menEntries, (d) => d.incwage) || 0;
      const avgWomenWage = d3.mean(womenEntries, (d) => d.incwage) || 0;
      const gapPercentage = avgMenWage
        ? Math.round(((avgMenWage - avgWomenWage) / avgMenWage) * 100 * 10) / 10
        : 0;

      avgIncwageByYear.push({
        year: +year,
        menWage: Math.round(avgMenWage),
        womenWage: Math.round(avgWomenWage),
        gapPercentage: gapPercentage,
      });
    });

    yearlyData = avgIncwageByYear.sort((a, b) => a.year - b.year);

    // === Compute User-Specified Equal-Width Age Bins ===
    const ageExtent = d3.extent(genderPayGapData, (d) => d.age);
    const binWidth = Math.ceil((ageExtent[1] - ageExtent[0]) / numBins);

    const binGenerator = d3
      .bin()
      .domain(ageExtent)
      .thresholds(d3.range(ageExtent[0], ageExtent[1] + binWidth, binWidth))
      .value((d) => d.age);

    const bins = binGenerator(genderPayGapData);
    ageData.length = 0;

    bins.forEach((bin) => {
      const menEntries = bin.filter((d) => d.sex === "Male");
      const womenEntries = bin.filter((d) => d.sex === "Female");

      const avgMenWage = d3.mean(menEntries, (d) => d.incwage) || 0;
      const avgWomenWage = d3.mean(womenEntries, (d) => d.incwage) || 0;
      const gap = avgMenWage
        ? Math.round(((avgMenWage - avgWomenWage) / avgMenWage) * 100 * 10) / 10
        : 0;

      ageData.push({
        ageGroup: `${Math.round(bin.x0)}-${Math.round(bin.x1)}`,
        menWage: Math.round(avgMenWage),
        womenWage: Math.round(avgWomenWage),
        gap: gap,
      });
    });

    console.log("Yearly Data:", yearlyData);
    console.log("Age Data:", ageData);

    // === Compute Occupation Data ===
    const occupationGroups = d3.group(genderPayGapData, (d) => d.Occupation);

    occupationData.length = 0;
    occupationProportionData.length = 0; // Clear existing data

    occupationGroups.forEach((entries, occupation) => {
      const menEntries = entries.filter((d) => d.sex === "Male");
      const womenEntries = entries.filter((d) => d.sex === "Female");

      const totalMen = menEntries.length;
      const totalWomen = womenEntries.length;
      const totalWorkers = totalMen + totalWomen;

      const menPercentage = totalWorkers
        ? Math.round((totalMen / totalWorkers) * 100)
        : 0;
      const womenPercentage = totalWorkers
        ? Math.round((totalWomen / totalWorkers) * 100)
        : 0;

      occupationData.push({
        occupation: occupation,
        menDominated: menPercentage > womenPercentage,
        menWage: Math.round(d3.mean(menEntries, (d) => d.incwage) || 0),
        womenWage: Math.round(d3.mean(womenEntries, (d) => d.incwage) || 0),
      });

      occupationProportionData.push({
        occupation: occupation,
        menPercentage: menPercentage,
        womenPercentage: womenPercentage,
      });
    });

    console.log("Occupation Data:", occupationData);
    console.log("Occupation Proportion Data:", occupationProportionData);

    const groupedByGenderAndTime = d3.group(
      genderPayGapData,
      (d) => d.sex,
      (d) => d.ft
    );

    // Initialize an empty array to hold the formatted hours data for the box plot
    hoursData.length = 0;

    // Function to compute the box plot data (min, Q1, median, Q3, max)
    function computeBoxPlotStats(hours) {
      const sortedHours = hours.slice().sort(d3.ascending); // Sort the hours
      const min = d3.min(sortedHours);
      const max = d3.max(sortedHours);
      const q1 = d3.quantile(sortedHours, 0.25); // 25th percentile
      const median = d3.quantile(sortedHours, 0.5); // 50th percentile (median)
      const q3 = d3.quantile(sortedHours, 0.75); // 75th percentile

      return { min, q1, median, q3, max };
    }

    // Iterate over the grouped data to calculate the box plot stats for each category
    groupedByGenderAndTime.forEach((sexGroups, gender) => {
      sexGroups.forEach((entries, timeStatus) => {
        const hours = entries.map((d) => d.annhrs); // Extract the hours worked data

        // Compute the box plot statistics for hours worked
        const stats = computeBoxPlotStats(hours);

        // Calculate the median wage for the current group
        const medianWage = d3.median(entries, (d) => d.incwage);

        // Determine the category label based on gender and time status
        const category = `${timeStatus} ${gender}`;

        // Add the data to the hoursData array in the desired format, including quantiles for the box plot
        hoursData.push({
          category: category,
          min: stats.min,
          q1: stats.q1,
          median: stats.median,
          q3: stats.q3,
          max: stats.max,
          medianWage: Math.round(medianWage), // Median wage for the group
        });
      });
    });

    console.log("Hours Data:", hoursData);

    educationData.length = 0; // Clear existing data
    const educationGroups = d3.group(
      genderPayGapData,
      (d) => d.Education,
      (d) => d.sex
    );
    // const educationData = [];

    educationGroups.forEach((sexGroups, educationLevel) => {
      const menEntries = sexGroups.get("Male") || [];
      const womenEntries = sexGroups.get("Female") || [];

      const avgMenWage = d3.mean(menEntries, (d) => d.incwage) || 0;
      const avgWomenWage = d3.mean(womenEntries, (d) => d.incwage) || 0;
      const gapPercentage = avgMenWage
        ? Math.round(((avgMenWage - avgWomenWage) / avgMenWage) * 100 * 10) / 10
        : 0;

      educationData.push({
        education: educationLevel,
        menWage: Math.round(avgMenWage),
        womenWage: Math.round(avgWomenWage),
        gapPercentage: gapPercentage,
      });
    });

    console.log("Education Data:", educationData);

    console.log("Yearly Data:", yearlyData);

    raceData.length = 0; // Clear existing data
    const raceGroups = d3.group(genderPayGapData, (d) => d.race);

    raceGroups.forEach((entries, race) => {
      // Filter data by gender
      const menEntries = entries.filter((d) => d.sex === "Male");
      const womenEntries = entries.filter((d) => d.sex === "Female");

      // Calculate average wage for men and women
      const avgMenWage = d3.mean(menEntries, (d) => d.incwage) || 0;
      const avgWomenWage = d3.mean(womenEntries, (d) => d.incwage) || 0;

      // Add to the raceGenderData array in the desired format
      raceData.push({
        race: race,
        menWage: Math.round(avgMenWage),
        womenWage: Math.round(avgWomenWage),
      });
    });

    console.log("Race and Gender Wage Data:", raceData);
  });

  return {
    yearlyData,
    ageData,
    occupationData,
    occupationProportionData,
    hoursData,
    educationData,
    raceData,
  };
}

// Draw yearly trends line chart
function drawYearlyTrends(yearlyData) {
  clearChartArea();
  currentChartType = "line";

  // Create the container group
  g = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // X axis scale and axis
  xScale = d3
    .scaleLinear()
    .domain(d3.extent(yearlyData, (d) => d.year))
    .range([0, innerWidth]);

  g.append("g")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

  // Y axis for wages
  yScale = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(yearlyData, (d) => Math.max(d.menWage, d.womenWage)) * 1.1,
    ])
    .range([innerHeight, 0]);

  g.append("g").call(d3.axisLeft(yScale).tickFormat((d) => `${d / 1000}k`));

  // Set y2Scale to range from 0 to 100%
  y2Scale = d3
    .scaleLinear()
    .domain([0, 100]) // Fixed scale from 0% to 100%
    .range([innerHeight, 0]);

  // Apply the updated y2Scale to the right Y-axis
  g.append("g")
    .attr("transform", `translate(${innerWidth}, 0)`)
    .call(d3.axisRight(y2Scale).tickFormat((d) => `${d}%`));
  // Add axis labels
  g.append("text")
    .attr("x", innerWidth / 2)
    .attr("y", innerHeight + 40)
    .attr("text-anchor", "middle")
    .text("Year");

  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -60)
    .attr("x", -innerHeight / 2)
    .attr("text-anchor", "middle")
    .text("Annual Wage ($)");

  g.append("text")
    .attr("transform", "rotate(90)")
    .attr("y", -innerWidth - 60)
    .attr("x", innerHeight / 2)
    .attr("text-anchor", "middle")
    .text("Pay Gap (%)");

  // Add chart title
  g.append("text")
    .attr("class", "chart-title")
    .attr("x", innerWidth / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .text("Gender Pay Gap Trends (1999-2013)");

  // Define line generators
  const menLine = d3
    .line()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d.menWage));

  const womenLine = d3
    .line()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d.womenWage));

  const gapLine = d3
    .line()
    .x((d) => xScale(d.year))
    .y((d) => y2Scale(d.gapPercentage));

  // Add men's wage line with animation
  const menPath = g
    .append("path")
    .datum(yearlyData)
    .attr("class", "men-line")
    .attr("fill", "none")
    .attr("stroke", "#2563EB")
    .attr("stroke-width", 2.5)
    .attr("d", menLine);

  const menPathLength = menPath.node().getTotalLength();

  menPath
    .attr("stroke-dasharray", menPathLength)
    .attr("stroke-dashoffset", menPathLength)
    .transition()
    .duration(1500)
    .attr("stroke-dashoffset", 0);

  // Add women's wage line with animation
  const womenPath = g
    .append("path")
    .datum(yearlyData)
    .attr("class", "women-line")
    .attr("fill", "none")
    .attr("stroke", "#DB2777")
    .attr("stroke-width", 2.5)
    .attr("d", womenLine);

  const womenPathLength = womenPath.node().getTotalLength();

  womenPath
    .attr("stroke-dasharray", womenPathLength)
    .attr("stroke-dashoffset", womenPathLength)
    .transition()
    .duration(1500)
    .attr("stroke-dashoffset", 0);

  // Add gap percentage line with animation
  const gapPath = g
    .append("path")
    .datum(yearlyData)
    .attr("class", "gap-line")
    .attr("fill", "none")
    .attr("stroke", "#047857")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "5,5")
    .attr("d", gapLine);

  const gapPathLength = gapPath.node().getTotalLength();

  gapPath
    .attr("stroke-dasharray", `5,5,${gapPathLength}`)
    .attr("stroke-dashoffset", gapPathLength)
    .transition()
    .duration(1500)
    .attr("stroke-dashoffset", 0);

  // Add legend
  const legend = g
    .append("g")
    .attr("transform", `translate(${innerWidth - 600}, 0)`);

  // Men legend
  legend
    .append("line")
    .attr("x1", 0)
    .attr("y1", 10)
    .attr("x2", 20)
    .attr("y2", 10)
    .attr("stroke", "#2563EB")
    .attr("stroke-width", 2.5);

  legend.append("text").attr("x", 25).attr("y", 15).text("Men's Wage");

  // Women legend
  legend
    .append("line")
    .attr("x1", 0)
    .attr("y1", 35)
    .attr("x2", 20)
    .attr("y2", 35)
    .attr("stroke", "#DB2777")
    .attr("stroke-width", 2.5);

  legend.append("text").attr("x", 25).attr("y", 40).text("Women's Wage");

  // Gap legend
  legend
    .append("line")
    .attr("x1", 0)
    .attr("y1", 60)
    .attr("x2", 20)
    .attr("y2", 60)
    .attr("stroke", "#047857")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "5,5");

  legend.append("text").attr("x", 25).attr("y", 65).text("Pay Gap (%)");

  // Add data points for selected years
  const pointYears = [1999, 2003, 2007, 2011, 2013];
  const selectedPoints = yearlyData.filter((d) => pointYears.includes(d.year));

  // Animate data points with a delay
  setTimeout(() => {
    // Men's data points
    g.selectAll(".men-point")
      .data(selectedPoints)
      .enter()
      .append("circle")
      .attr("class", "men-point")
      .attr("cx", (d) => xScale(d.year))
      .attr("cy", (d) => yScale(d.menWage))
      .attr("r", 0)
      .attr("fill", "#2563EB")
      .transition()
      .duration(500)
      .attr("r", 5);

    // Women's data points
    g.selectAll(".women-point")
      .data(selectedPoints)
      .enter()
      .append("circle")
      .attr("class", "women-point")
      .attr("cx", (d) => xScale(d.year))
      .attr("cy", (d) => yScale(d.womenWage))
      .attr("r", 0)
      .attr("fill", "#DB2777")
      .transition()
      .duration(500)
      .attr("r", 5);

    // Gap percentage data points
    g.selectAll(".gap-point")
      .data(selectedPoints)
      .enter()
      .append("circle")
      .attr("class", "gap-point")
      .attr("cx", (d) => xScale(d.year))
      .attr("cy", (d) => y2Scale(d.gapPercentage))
      .attr("r", 0)
      .attr("fill", "#047857")
      .transition()
      .duration(500)
      .attr("r", 5);
  }, 1600);
}

// Draw age groups bar chart
function drawAgeGroups(ageData) {
  clearChartArea();
  currentChartType = "bar";

  // Create the container group
  g = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // X axis scale and axis
  xScale = d3
    .scaleBand()
    .domain(ageData.map((d) => d.ageGroup))
    .range([0, innerWidth])
    .padding(0.3);

  g.append("g")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(xScale));

  // Y axis for wages
  yScale = d3
    .scaleLinear()
    .domain([0, d3.max(ageData, (d) => Math.max(d.menWage, d.womenWage)) * 1.1])
    .range([innerHeight, 0]);

  g.append("g").call(d3.axisLeft(yScale).tickFormat((d) => `${d / 1000}k`));

  // Set y2Scale to range from 0 to 100%
  y2Scale = d3
    .scaleLinear()
    .domain([0, 100]) // Fixed scale from 0% to 100%
    .range([innerHeight, 0]);

  // Apply the updated y2Scale to the right Y-axis
  g.append("g")
    .attr("transform", `translate(${innerWidth}, 0)`)
    .call(d3.axisRight(y2Scale).tickFormat((d) => `${d}%`));

  // Add axis labels
  g.append("text")
    .attr("x", innerWidth / 2)
    .attr("y", innerHeight + 40)
    .attr("text-anchor", "middle")
    .text("Age Group");

  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -60)
    .attr("x", -innerHeight / 2)
    .attr("text-anchor", "middle")
    .text("Annual Wage ($)");

  // Add chart title
  g.append("text")
    .attr("class", "chart-title")
    .attr("x", innerWidth / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .text("Gender Pay Gap by Age Group");

  // Group width for men's and women's bars
  const xSubgroup = d3
    .scaleBand()
    .domain(["men", "women"])
    .range([0, xScale.bandwidth()])
    .padding(0.05);

  // Men's bars with animation
  g.selectAll(".men-bar")
    .data(ageData)
    .enter()
    .append("rect")
    .attr("class", "bar men-bar")
    .attr("x", (d) => xScale(d.ageGroup) + xSubgroup("men"))
    .attr("y", innerHeight)
    .attr("width", xSubgroup.bandwidth())
    .attr("height", 0)
    .attr("fill", "#2563EB")
    .transition()
    .duration(1000)
    .attr("y", (d) => yScale(d.menWage))
    .attr("height", (d) => innerHeight - yScale(d.menWage));

  // Women's bars with animation
  g.selectAll(".women-bar")
    .data(ageData)
    .enter()
    .append("rect")
    .attr("class", "bar women-bar")
    .attr("x", (d) => xScale(d.ageGroup) + xSubgroup("women"))
    .attr("y", innerHeight)
    .attr("width", xSubgroup.bandwidth())
    .attr("height", 0)
    .attr("fill", "#DB2777")
    .transition()
    .duration(1000)
    .attr("y", (d) => yScale(d.womenWage))
    .attr("height", (d) => innerHeight - yScale(d.womenWage));

  // Connect gap points with a line after delay
  setTimeout(() => {
    // Gap percentage line
    const gapLine = d3
      .line()
      .x((d) => xScale(d.ageGroup) + xScale.bandwidth() / 2)
      .y((d) => y2Scale(d.gap))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(ageData)
      .attr("class", "gap-line")
      .attr("fill", "none")
      .attr("stroke", "#047857")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .attr("d", gapLine);

    // Gap percentage points
    g.selectAll(".gap-point")
      .data(ageData)
      .enter()
      .append("circle")
      .attr("class", "gap-point")
      .attr("cx", (d) => xScale(d.ageGroup) + xScale.bandwidth() / 2)
      .attr("cy", (d) => y2Scale(d.gap))
      .attr("r", 5)
      .attr("fill", "#047857");

    // Add gap percentage labels
    g.selectAll(".gap-label")
      .data(ageData)
      .enter()
      .append("text")
      .attr("class", "gap-label")
      .attr("x", (d) => xScale(d.ageGroup) + xScale.bandwidth() / 2)
      .attr("y", (d) => y2Scale(d.gap) - 10)
      .attr("text-anchor", "middle")
      .attr("fill", "#047857")
      .text((d) => `${d.gap}%`);
  }, 1100);

  // Add legend
  const legend = g
    .append("g")
    .attr("transform", `translate(${innerWidth - 150}, 0)`);

  // Men legend
  legend
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", "#2563EB");

  legend.append("text").attr("x", 20).attr("y", 12).text("Men's Wage");

  // Women legend
  legend
    .append("rect")
    .attr("x", 0)
    .attr("y", 25)
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", "#DB2777");

  legend.append("text").attr("x", 20).attr("y", 37).text("Women's Wage");

  // Gap legend
  legend
    .append("circle")
    .attr("cx", 7)
    .attr("cy", 55)
    .attr("r", 5)
    .attr("fill", "#047857");

  legend.append("text").attr("x", 20).attr("y", 58).text("Pay Gap (%)");
} // Define global variables
let svg = d3.select("#svg");
let width = parseInt(svg.style("width")) || 800;
let height = parseInt(svg.style("height")) || 500;
let margin = { top: 50, right: 80, bottom: 50, left: 80 };
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
let currentChartType = "line"; // Track current chart type
let yearlyData = [];
let ageData = [];
let occupationData = [];
let occupationProportionData = [];
let hoursData = [];
let educationData = [];
let raceData = [];
let data = {};

// Clear SVG for new chart
function clearChartArea() {
  svg.selectAll("*").remove();
  g = null;
}

// Forward button click handler
function forwardClicked() {
  if (keyframeIndex < keyframes.length - 1) {
    keyframeIndex++;
    drawKeyframe(keyframeIndex);
  }
}

// Backward button click handler
function backwardClicked() {
  if (keyframeIndex > 0) {
    keyframeIndex--;
    drawKeyframe(keyframeIndex);
  }
}

// Draw keyframe at given index
function drawKeyframe(kfi) {
  const keyframe = keyframes[kfi];

  // Reset any active lines
  resetActiveLines();

  // Update active verse
  updateActiveVerse(keyframe.activeVerse);

  // Update active lines
  keyframe.activeLines.forEach((lid) => {
    updateActiveLine(keyframe.activeVerse, lid);
  });

  // Update the svg
  if (keyframe.svgUpdate) {
    keyframe.svgUpdate();
  }

  // Scroll to appropriate verse
  scrollToVerse(keyframe.activeVerse);
}

// Reset active lines
function resetActiveLines() {
  d3.selectAll(".line").classed("active-line", false);
  d3.selectAll(".verse").classed("active-verse", false);
}

// Update active verse
function updateActiveVerse(id) {
  d3.select(`#verse${id}`).classed("active-verse", true);
}

// Update active line
function updateActiveLine(vid, lid) {
  d3.select(`#verse${vid} #line${lid}`).classed("active-line", true);
}

// Scroll to verse
function scrollToVerse(id) {
  const leftColumn = document.querySelector(".left-column-content");
  const verse = document.querySelector(`#verse${id}`);

  if (!leftColumn || !verse) return;

  const leftRect = leftColumn.getBoundingClientRect();
  const verseRect = verse.getBoundingClientRect();
  const scrollTop =
    verseRect.top -
    leftRect.top -
    leftRect.height / 2 +
    verseRect.height / 2 +
    leftColumn.scrollTop;

  leftColumn.scrollTo({
    top: scrollTop,
    behavior: "smooth",
  });
}

// Add scroll wheel navigation
function addScrollWheelNavigation() {
  // Track last scroll time to prevent too many events firing at once
  let lastScrollTime = 0;
  const scrollCooldown = 300;

  window.addEventListener(
    "wheel",
    function (event) {
      // Get current time
      const now = new Date().getTime();

      // Check if enough time has passed since the last scroll event
      if (now - lastScrollTime < scrollCooldown) {
        return;
      }

      // Update the last scroll time
      lastScrollTime = now;

      // Determine scroll direction
      if (event.deltaY > 0) {
        // Scrolling down - move forward
        forwardClicked();
      } else {
        // Scrolling up - move backward
        backwardClicked();
      }
    },
    { passive: true }
  );
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

function drawCombinedOccupationViz(occupationData) {
  clearChartArea();
  currentChartType = "bar";

  const sortedData = [...occupationData].sort((a, b) => b.menWage - a.menWage);

  // Increase left margin to accommodate longer occupation labels
  const adjustedMargin = { ...margin, left: margin.left + 100 };

  // Create the container group with adjusted margin
  g = svg
    .append("g")
    .attr(
      "transform",
      `translate(${adjustedMargin.left}, ${adjustedMargin.top})`
    );

  // Adjust inner width to account for increased left margin
  const adjustedInnerWidth = width - adjustedMargin.left - margin.right;

  // Add chart title
  g.append("text")
    .attr("class", "chart-title")
    .attr("x", adjustedInnerWidth / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .text("Income by Occupation and Gender");

  // Draw horizontal bar chart with adjusted parameters
  drawHorizontalBars(sortedData, adjustedMargin, adjustedInnerWidth);
}

function drawHorizontalBars(data, adjustedMargin, adjustedInnerWidth) {
  const occupations = data.map((d) => d.occupation);

  // Y-axis scale with reduced padding
  const y = d3
    .scaleBand()
    .domain(occupations)
    .range([0, innerHeight])
    .padding(0.1); // Reduced from 0.2 to 0.1 for tighter spacing

  // Y-axis with full occupation names
  const yAxis = g.append("g").call(d3.axisLeft(y));

  // Ensure full occupation names are visible
  yAxis
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-10px")
    .style("font-size", "10px")
    .call(wrap, adjustedMargin.left - 20); // Custom text wrapping

  // X-axis scale
  const maxWage = d3.max(data, (d) => Math.max(d.menWage, d.womenWage));
  const x = d3
    .scaleLinear()
    .domain([0, maxWage * 1.2]) // Extra padding to prevent clipping
    .range([0, adjustedInnerWidth - 50]); // Space for labels

  g.append("g")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(x).tickFormat((d) => `$${d / 1000}k`));

  // X-axis label
  g.append("text")
    .attr("x", adjustedInnerWidth / 2 - 50)
    .attr("y", innerHeight + 40)
    .attr("text-anchor", "middle")
    .text("Income ($)");

  // Men's bars (blue)
  g.selectAll(".men-bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "men-bar")
    .attr("y", (d) => y(d.occupation))
    .attr("x", 0)
    .attr("height", y.bandwidth() / 2 - 2) // Slightly reduced height with a small gap
    .attr("width", 0)
    .attr("fill", "#2563EB")
    .transition()
    .duration(800)
    .attr("width", (d) => x(d.menWage));

  // Women's bars (orange)
  g.selectAll(".women-bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "women-bar")
    .attr("y", (d) => y(d.occupation) + y.bandwidth() / 2 + 2) // Added small gap
    .attr("x", 0)
    .attr("height", y.bandwidth() / 2 - 2) // Slightly reduced height with a small gap
    .attr("width", 0)
    .attr("fill", "#F97316")
    .transition()
    .duration(800)
    .attr("width", (d) => x(d.womenWage));

  // Wage labels
  setTimeout(() => {
    g.selectAll(".men-wage-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "men-wage-label")
      .attr("x", (d) => {
        const barWidth = x(d.menWage);
        return barWidth > adjustedInnerWidth - 100
          ? barWidth - 40
          : barWidth + 5;
      })
      .attr("y", (d) => y(d.occupation) + y.bandwidth() / 4)
      .attr("dominant-baseline", "middle")
      .attr("font-size", "11px")
      .attr("fill", (d) =>
        x(d.menWage) > adjustedInnerWidth - 100 ? "white" : "black"
      )
      .attr("text-anchor", (d) =>
        x(d.menWage) > adjustedInnerWidth - 100 ? "end" : "start"
      )
      .text((d) => `$${Math.round(d.menWage / 1000)}k`);

    g.selectAll(".women-wage-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "women-wage-label")
      .attr("x", (d) => {
        const barWidth = x(d.womenWage);
        return barWidth > adjustedInnerWidth - 100
          ? barWidth - 40
          : barWidth + 5;
      })
      .attr("y", (d) => y(d.occupation) + (y.bandwidth() * 3) / 4)
      .attr("dominant-baseline", "middle")
      .attr("font-size", "11px")
      .attr("fill", (d) =>
        x(d.womenWage) > adjustedInnerWidth - 100 ? "white" : "black"
      )
      .attr("text-anchor", (d) =>
        x(d.womenWage) > adjustedInnerWidth - 100 ? "end" : "start"
      )
      .text((d) => `$${Math.round(d.womenWage / 1000)}k`);
  }, 1000);

  // Legend
  const legend = g
    .append("g")
    .attr("transform", `translate(${adjustedInnerWidth - 140}, 10)`);

  legend
    .append("rect")
    .attr("x", -10)
    .attr("y", -5)
    .attr("width", 110)
    .attr("height", 60)
    .attr("fill", "white")
    .attr("opacity", 0.8)
    .attr("rx", 5);

  legend
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", "#2563EB");
  legend.append("text").attr("x", 20).attr("y", 12).text("Male Income");

  legend
    .append("rect")
    .attr("x", 0)
    .attr("y", 25)
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", "#F97316");
  legend.append("text").attr("x", 20).attr("y", 37).text("Female Income");
}

// Helper function to wrap long text (remains the same as in previous version)
function wrap(text, width) {
  text.each(function () {
    const text = d3.select(this);
    const words = text.text().split(/\s+/).reverse();
    let word;
    let line = [];
    let lineNumber = 0;
    const lineHeight = 1.1; // ems
    const y = text.attr("y");
    const dy = parseFloat(text.attr("dy") || 0);
    let tspan = text
      .text(null)
      .append("tspan")
      .attr("x", -10)
      .attr("y", y)
      .attr("dy", dy + "em");

    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text
          .append("tspan")
          .attr("x", -10)
          .attr("y", y)
          .attr("dy", ++lineNumber * lineHeight + dy + "em")
          .text(word);
      }
    }
  });
}

function showOccupationStackedBarChart(occupationData) {
  clearChartArea();
  currentChartType = "bar";

  // Increase bottom margin to provide more space for rotated labels
  const bottomMargin = 100; // Increased margin for labels
  const adjustedInnerHeight = innerHeight - bottomMargin;

  // Create the container group
  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // X-axis scale (categorical for occupations)
  const xScale = d3
    .scaleBand()
    .domain(occupationData.map((d) => d.occupation))
    .range([0, innerWidth])
    .padding(0.2);

  // Append x-axis with rotated labels
  g.append("g")
    .attr("transform", `translate(0, ${adjustedInnerHeight})`)
    .call(d3.axisBottom(xScale).tickSize(0))
    .selectAll("text")
    .style("text-anchor", "start")
    .attr("dx", "0.5em")
    .attr("dy", "0")
    .attr("transform", "rotate(45)"); // Rotate 45 degrees for readability

  // Y-axis scale (percentage from 0 to 100)
  const yScale = d3
    .scaleLinear()
    .domain([0, 100])
    .range([adjustedInnerHeight, 0]);

  // Append y-axis with label
  const yAxis = g
    .append("g")
    .call(d3.axisLeft(yScale).tickFormat((d) => `${d}%`));

  // Y-axis label
  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -adjustedInnerHeight / 2)
    .attr("y", -40) // Adjust this value to move label left or right
    .attr("text-anchor", "middle")
    .text("Percentage (%)");

  // Define colors
  const colors = { men: "#2563EB", women: "#DB2777" };

  // Create groups for bars
  const bars = g
    .selectAll(".bar-group")
    .data(occupationData)
    .enter()
    .append("g")
    .attr("transform", (d) => `translate(${xScale(d.occupation)}, 0)`);

  // Draw men bars
  bars
    .append("rect")
    .attr("y", (d) => yScale(d.menPercentage))
    .attr("height", (d) => adjustedInnerHeight - yScale(d.menPercentage))
    .attr("width", xScale.bandwidth())
    .attr("fill", colors.men);

  // Draw women bars stacked on top
  bars
    .append("rect")
    .attr("y", (d) => yScale(d.menPercentage + d.womenPercentage))
    .attr("height", (d) => adjustedInnerHeight - yScale(d.womenPercentage))
    .attr("width", xScale.bandwidth())
    .attr("fill", colors.women);

  // Add legend - positioned inside the chart but not overlapping
  const legend = g
    .append("g")
    .attr("transform", `translate(${innerWidth - 120}, 20)`);

  legend
    .append("rect")
    .attr("x", 0)
    .attr("y", 10)
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", colors.men);
  legend.append("text").attr("x", 25).attr("y", 22).text("Men");
  legend
    .append("rect")
    .attr("x", 0)
    .attr("y", 35)
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", colors.women);
  legend.append("text").attr("x", 25).attr("y", 47).text("Women");

  // Chart title
  g.append("text")
    .attr("x", innerWidth / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .attr("class", "chart-title")
    .text("Gender Proportion by Occupation");
}
function showOccupationStackedBarChart(occupationData) {
  clearChartArea();
  currentChartType = "bar";

  // Increase bottom margin to provide more space for rotated labels
  const bottomMargin = 100; // Increased margin for labels
  const adjustedInnerHeight = innerHeight - bottomMargin;

  // Create the container group
  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // X-axis scale (categorical for occupations)
  const xScale = d3
    .scaleBand()
    .domain(occupationData.map((d) => d.occupation))
    .range([0, innerWidth])
    .padding(0.2);

  // Append x-axis with rotated labels
  g.append("g")
    .attr("transform", `translate(0, ${adjustedInnerHeight})`)
    .call(d3.axisBottom(xScale).tickSize(0))
    .selectAll("text")
    .style("text-anchor", "start")
    .attr("dx", "0.5em")
    .attr("dy", "0")
    .attr("transform", "rotate(45)"); // Rotate 45 degrees instead of 90 for better readability

  // Y-axis scale (percentage from 0 to 100)
  const yScale = d3
    .scaleLinear()
    .domain([0, 100])
    .range([adjustedInnerHeight, 0]);

  g.append("g").call(d3.axisLeft(yScale).tickFormat((d) => `${d}%`));

  // Define colors
  const colors = { men: "#2563EB", women: "#DB2777" };

  // Create groups for bars
  const bars = g
    .selectAll(".bar-group")
    .data(occupationData)
    .enter()
    .append("g")
    .attr("transform", (d) => `translate(${xScale(d.occupation)}, 0)`);

  // Draw men bars
  bars
    .append("rect")
    .attr("y", (d) => yScale(d.menPercentage))
    .attr("height", (d) => adjustedInnerHeight - yScale(d.menPercentage))
    .attr("width", xScale.bandwidth())
    .attr("fill", colors.men);

  // Draw women bars stacked on top
  bars
    .append("rect")
    .attr("y", (d) => yScale(d.menPercentage + d.womenPercentage))
    .attr("height", (d) => adjustedInnerHeight - yScale(d.womenPercentage))
    .attr("width", xScale.bandwidth())
    .attr("fill", colors.women);

  // Add legend at bottom left
  const legend = g
    .append("g")
    .attr("transform", `translate(10, ${adjustedInnerHeight + 50})`);

  legend
    .append("rect")
    .attr("x", 0)
    .attr("y", 10)
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", colors.men);
  legend.append("text").attr("x", 25).attr("y", 22).text("Men");
  legend
    .append("rect")
    .attr("x", 0)
    .attr("y", 35)
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", colors.women);
  legend.append("text").attr("x", 25).attr("y", 47).text("Women");

  // Chart title
  g.append("text")
    .attr("x", innerWidth / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .attr("class", "chart-title")
    .text("Gender Proportion by Occupation");
}
function drawHoursWorked(hoursData) {
  clearChartArea();
  currentChartType = "box";

  // Create boxplot-ready data from the hoursData
  const boxplotData = hoursData.map((d) => ({
    category: d.category,
    min: d.min,
    q1: d.q1,
    median: d.median,
    q3: d.q3,
    max: d.max,
    medianWage: d.medianWage,
  }));

  // Enhanced margins with more proportional spacing
  const margin = { top: 80, right: 100, bottom: 100, left: 220 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Create the container group
  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Improved title with more styling
  g.append("text")
    .attr("class", "chart-title")
    .attr("x", innerWidth / 2)
    .attr("y", -50)
    .attr("text-anchor", "middle")
    .attr("font-size", "18px")
    .attr("font-weight", "bold")
    .style("fill", "#333")
    .text("Hours Worked Distribution & Median Wage");

  // Y axis scale and axis for the boxplot with improved styling
  const y = d3
    .scaleBand()
    .domain(boxplotData.map((d) => d.category))
    .range([0, innerHeight])
    .padding(0.3);

  g.append("g")
    .call(d3.axisLeft(y).tickSize(0))
    .selectAll("text")
    .style("text-anchor", "end")
    .style("font-size", "12px")
    .style("fill", "#666")
    .attr("dx", "-0.5em");

  // X axis scale and axis for the boxplot with more intelligent domain
  const x = d3
    .scaleLinear()
    .domain([
      Math.min(
        0,
        d3.min(boxplotData, (d) => d.min)
      ),
      Math.max(
        60,
        d3.max(boxplotData, (d) => d.max)
      ),
    ])
    .range([0, innerWidth]);

  g.append("g")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(x).ticks(8))
    .selectAll("text")
    .style("font-size", "10px")
    .style("fill", "#666");

  // Add X axis label with improved styling
  g.append("text")
    .attr("x", innerWidth / 2)
    .attr("y", innerHeight + 50)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("fill", "#666")
    .text("Hours per Week");

  // Enhanced box plots with smoother color gradients
  boxplotData.forEach((d, i) => {
    const boxHeight = y.bandwidth();
    const category = d.category;
    const yPos = y(category);

    // Color with soft gradient
    const baseColor = category.includes("Male") ? "#2563EB" : "#DB2777";
    const lightColor = d3.color(baseColor).brighter(0.5);

    // Min-max line with softer stroke
    g.append("line")
      .attr("x1", x(d.min))
      .attr("x2", x(d.max))
      .attr("y1", yPos + boxHeight / 2)
      .attr("y2", yPos + boxHeight / 2)
      .attr("stroke", "#999")
      .attr("stroke-width", 1);

    // Whiskers with soft caps
    ["min", "max"].forEach((type) => {
      g.append("line")
        .attr("x1", x(d[type]))
        .attr("x2", x(d[type]))
        .attr("y1", yPos + boxHeight / 2 - 4)
        .attr("y2", yPos + boxHeight / 2 + 4)
        .attr("stroke", "#666")
        .attr("stroke-width", 1.5);
    });

    // Box with gradient and soft shadow
    g.append("rect")
      .attr("x", x(d.q1))
      .attr("y", yPos + boxHeight / 4)
      .attr("width", x(d.q3) - x(d.q1))
      .attr("height", boxHeight / 2)
      .attr("fill", lightColor)
      .attr("stroke", baseColor)
      .attr("stroke-width", 1.5)
      .attr("opacity", 0.8)
      .attr("filter", "url(#drop-shadow)");

    // Median line with emphasis
    g.append("line")
      .attr("x1", x(d.median))
      .attr("x2", x(d.median))
      .attr("y1", yPos + boxHeight / 4)
      .attr("y2", yPos + (boxHeight * 3) / 4)
      .attr("stroke", "#000")
      .attr("stroke-width", 2.5);

    // Enhanced median wage annotation
    g.append("text")
      .attr("x", x(d.max) + 15)
      .attr("y", yPos + boxHeight / 2)
      .attr("font-size", "11px")
      .attr("font-weight", "bold")
      .attr("fill", "#444")
      .text(`$${d.medianWage.toLocaleString()} annual`)
      .attr("alignment-baseline", "middle");
  });

  // Modern, centered legend with soft hover effect
  const legendGroup = svg
    .append("g")
    .attr(
      "transform",
      `translate(${margin.left + (innerWidth - 250) / 2}, ${height - 70})`
    );

  const legendItems = [
    { color: "#2563EB", label: "Male" },
    { color: "#DB2777", label: "Female" },
  ];

  // Add drop shadow definition
  svg
    .append("defs")
    .append("filter")
    .attr("id", "drop-shadow")
    .append("feDropShadow")
    .attr("dx", "1")
    .attr("dy", "1")
    .attr("stdDeviation", "1");

  // Legend with hover interactions
  const legendContainer = legendGroup
    .append("rect")
    .attr("width", 250)
    .attr("height", 40)
    .attr("fill", "#f4f4f4")
    .attr("rx", 10)
    .attr("ry", 10)
    .attr("stroke", "#ddd")
    .attr("stroke-width", 1);

  legendGroup
    .selectAll("rect.legend-item")
    .data(legendItems)
    .enter()
    .append("rect")
    .attr("class", "legend-item")
    .attr("x", (d, i) => 25 + i * 125)
    .attr("y", 10)
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", (d) => d.color)
    .attr("stroke", "#333")
    .attr("stroke-width", 1)
    .attr("rx", 4)
    .attr("ry", 4);

  legendGroup
    .selectAll("text.legend-label")
    .data(legendItems)
    .enter()
    .append("text")
    .attr("x", (d, i) => 50 + i * 125)
    .attr("y", 25)
    .attr("text-anchor", "start")
    .attr("font-size", "12px")
    .attr("fill", "#333")
    .text((d) => d.label);
}
// Draw race data visualization - FIXED to prevent bar overlap
function drawRaceData(raceData) {
  clearChartArea();
  currentChartType = "bar";

  // Sort data by wage (highest to lowest)
  const sortedData = [...raceData].sort((a, b) => b.menWage - a.menWage);

  // Create the container group
  g = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Add chart title
  g.append("text")
    .attr("class", "chart-title")
    .attr("x", innerWidth / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .text("Wages by Race/Ethnicity");

  // X axis scale and axis with more padding between groups
  const x = d3
    .scaleBand()
    .domain(sortedData.map((d) => d.race))
    .range([0, innerWidth])
    .padding(0.4); // Increased padding between race groups

  g.append("g")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(x));

  // Y axis scale and axis
  const y = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(sortedData, (d) => Math.max(d.menWage, d.womenWage)) * 1.1,
    ])
    .range([innerHeight, 0]);

  g.append("g").call(d3.axisLeft(y).tickFormat((d) => `${d / 1000}k`));

  // Add Y axis label
  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -60)
    .attr("x", -innerHeight / 2)
    .attr("text-anchor", "middle")
    .text("Annual Wage ($)");

  // Group width for men's and women's bars - FIXED with increased padding and narrower bars
  const xSubgroup = d3
    .scaleBand()
    .domain(["men", "women"])
    .range([0, x.bandwidth()])
    .padding(0.3); // Significantly increased padding to prevent overlap

  // Men's bars with animation
  g.selectAll(".men-bar")
    .data(sortedData)
    .enter()
    .append("rect")
    .attr("class", "bar men-bar")
    .attr("x", (d) => x(d.race) + xSubgroup("men"))
    .attr("y", innerHeight)
    .attr("width", xSubgroup.bandwidth())
    .attr("height", 0)
    .attr("fill", "#2563EB")
    .transition()
    .duration(800)
    .attr("y", (d) => y(d.menWage))
    .attr("height", (d) => innerHeight - y(d.menWage));

  // Women's bars with animation
  g.selectAll(".women-bar")
    .data(sortedData)
    .enter()
    .append("rect")
    .attr("class", "bar women-bar")
    .attr("x", (d) => x(d.race) + xSubgroup("women"))
    .attr("y", innerHeight)
    .attr("width", xSubgroup.bandwidth())
    .attr("height", 0)
    .attr("fill", "#DB2777")
    .transition()
    .duration(800)
    .attr("y", (d) => y(d.womenWage))
    .attr("height", (d) => innerHeight - y(d.womenWage));

  // Add wage labels
  setTimeout(() => {
    // Men's wage labels
    g.selectAll(".men-wage-label")
      .data(sortedData)
      .enter()
      .append("text")
      .attr("class", "men-wage-label")
      .attr(
        "x",
        (d) => x(d.race) + xSubgroup("men") + xSubgroup.bandwidth() / 2
      )
      .attr("y", (d) => y(d.menWage) - 5)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .text((d) => `${(d.menWage / 1000).toFixed(0)}k`);

    // Women's wage labels
    g.selectAll(".women-wage-label")
      .data(sortedData)
      .enter()
      .append("text")
      .attr("class", "women-wage-label")
      .attr(
        "x",
        (d) => x(d.race) + xSubgroup("women") + xSubgroup.bandwidth() / 2
      )
      .attr("y", (d) => y(d.womenWage) - 5)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .text((d) => `${(d.womenWage / 1000).toFixed(0)}k`);
  }, 900);

  // Create a legend background for better visibility
  g.append("rect")
    .attr("x", innerWidth - 110)
    .attr("y", 10)
    .attr("width", 100)
    .attr("height", 60)
    .attr("fill", "white")
    .attr("opacity", 0.8)
    .attr("rx", 5);

  // Add legend - MOVED to top-right corner with background
  const legend = g
    .append("g")
    .attr("transform", `translate(${innerWidth - 100}, 20)`);

  legend
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", "#2563EB");

  legend.append("text").attr("x", 20).attr("y", 12).text("Men");

  legend
    .append("rect")
    .attr("x", 0)
    .attr("y", 25)
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", "#DB2777");

  legend.append("text").attr("x", 20).attr("y", 37).text("Women");
}

// Draw occupation visualization - FIXED to prevent legend overlap
function drawOccupations(occupationData) {
  console.log(occupationData);
  clearChartArea();
  currentChartType = "bar";

  // Sort data by wage (highest to lowest)
  const sortedData = [...occupationData].sort((a, b) => b.menWage - a.menWage);

  // Create the container group
  g = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Y axis scale and axis
  const y = d3
    .scaleBand()
    .domain(sortedData.map((d) => d.occupation))
    .range([0, innerHeight])
    .padding(0.2);

  g.append("g").call(d3.axisLeft(y));

  // X axis scale and axis - MODIFIED to leave space for legend
  // Reduce innerWidth by 180px to leave space for legend
  const adjustedWidth = innerWidth - 180;

  const x = d3
    .scaleLinear()
    .domain([0, d3.max(sortedData, (d) => d.menWage) * 1.1])
    .range([0, adjustedWidth]);

  g.append("g")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(x).tickFormat((d) => `${d / 1000}k`));

  // Add axis labels
  g.append("text")
    .attr("x", adjustedWidth / 2)
    .attr("y", innerHeight + 40)
    .attr("text-anchor", "middle")
    .text("Annual Wage ($)");

  // Add chart title
  g.append("text")
    .attr("class", "chart-title")
    .attr("x", innerWidth / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .text("Gender Pay Gap by Occupation");

  // Men's bars with animation
  g.selectAll(".men-bar")
    .data(sortedData)
    .enter()
    .append("rect")
    .attr("class", "men-bar bar")
    .attr("y", (d) => y(d.occupation))
    .attr("x", 0)
    .attr("height", y.bandwidth() / 2)
    .attr("width", 0)
    .attr("fill", (d) => (d.menDominated ? "#9333EA" : "#0891B2"))
    .transition()
    .duration(1000)
    .attr("width", (d) => x(d.menWage));

  // Women's bars with animation
  g.selectAll(".women-bar")
    .data(sortedData)
    .enter()
    .append("rect")
    .attr("class", "women-bar bar")
    .attr("y", (d) => y(d.occupation) + y.bandwidth() / 2)
    .attr("x", 0)
    .attr("height", y.bandwidth() / 2)
    .attr("width", 0)
    .attr("fill", (d) => (d.menDominated ? "#9333EA" : "#0891B2"))
    .attr("opacity", 0.7)
    .transition()
    .duration(1000)
    .attr("width", (d) => x(d.womenWage));

  // Add legends in the empty space on the right side
  // Create a background for the legend area
  g.append("rect")
    .attr("x", adjustedWidth + 20)
    .attr("y", 0)
    .attr("width", 160)
    .attr("height", 150)
    .attr("fill", "#f8f8f8")
    .attr("stroke", "#ccc")
    .attr("stroke-width", 1)
    .attr("rx", 5);

  // Legend title
  g.append("text")
    .attr("x", adjustedWidth + 100)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .attr("font-weight", "bold")
    .text("Legend");

  // Add a legend for men-dominated vs women-dominated
  const domLegend = g
    .append("g")
    .attr("transform", `translate(${adjustedWidth + 30}, 40)`);

  domLegend
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", "#9333EA")
    .attr("opacity", 1);

  domLegend
    .append("text")
    .attr("x", 20)
    .attr("y", 12)
    .text("Men-dominated field");

  domLegend
    .append("rect")
    .attr("x", 0)
    .attr("y", 25)
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", "#0891B2")
    .attr("opacity", 1);

  domLegend
    .append("text")
    .attr("x", 20)
    .attr("y", 37)
    .text("Women-dominated field");

  // Add legend for men's and women's bars
  const barLegend = g
    .append("g")
    .attr("transform", `translate(${adjustedWidth + 30}, 90)`);

  barLegend
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 15)
    .attr("height", 7.5)
    .attr("fill", "#2563EB");

  barLegend.append("text").attr("x", 20).attr("y", 8).text("Men");

  barLegend
    .append("rect")
    .attr("x", 0)
    .attr("y", 15)
    .attr("width", 15)
    .attr("height", 7.5)
    .attr("fill", "#DB2777");

  barLegend.append("text").attr("x", 20).attr("y", 23).text("Women");
}

// Draw education levels visualization (with gap part removed)
function drawCombinedEducationViz(educationData) {
  clearChartArea();
  currentChartType = "bar";

  // Predefined education level order
  const educationOrder = [
    "None",
    "Grade 1",
    "Grade 2",
    "Grade 3",
    "Grade 4",
    "Grade 5",
    "Grade 6",
    "Grade 7",
    "Grade 8",
    "Grade 9",
    "Grade 10",
    "Grade 11",
    "Grade 12",
    "Some College",
    "Associate",
    "Bachelors",
    "Advanced Degree",
  ];

  // Sort data by education level (using the same logic as occupation viz)
  const sortedData = [...educationData].sort(
    (a, b) =>
      educationOrder.indexOf(a.education) - educationOrder.indexOf(b.education)
  );

  // Increase left margin to accommodate longer education labels
  const adjustedMargin = { ...margin, left: margin.left + 100 };

  // Create the container group with adjusted margin
  g = svg
    .append("g")
    .attr(
      "transform",
      `translate(${adjustedMargin.left}, ${adjustedMargin.top})`
    );

  // Adjust inner width to account for increased left margin
  const adjustedInnerWidth = width - adjustedMargin.left - margin.right;

  // Add chart title
  g.append("text")
    .attr("class", "chart-title")
    .attr("x", adjustedInnerWidth / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .text("Income by Education Level and Gender");

  // Draw horizontal bar chart with adjusted parameters
  drawHorizontalEducationBars(sortedData, adjustedMargin, adjustedInnerWidth);
}

function drawHorizontalEducationBars(data, adjustedMargin, adjustedInnerWidth) {
  const educations = data.map((d) => d.education);

  // Y-axis scale with reduced padding
  const y = d3
    .scaleBand()
    .domain(educations)
    .range([0, innerHeight])
    .padding(0.1); // Reduced from 0.2 to 0.1 for tighter spacing

  // Y-axis with full education labels
  const yAxis = g.append("g").call(d3.axisLeft(y));

  // Ensure full education names are visible
  yAxis
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-10px")
    .style("font-size", "10px")
    .call(wrap, adjustedMargin.left - 20); // Custom text wrapping

  // X-axis scale
  const maxWage = d3.max(data, (d) => Math.max(d.menWage, d.womenWage));
  const x = d3
    .scaleLinear()
    .domain([0, maxWage * 1.2]) // Extra padding to prevent clipping
    .range([0, adjustedInnerWidth - 50]); // Space for labels

  g.append("g")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(x).tickFormat((d) => `$${d / 1000}k`));

  // X-axis label
  g.append("text")
    .attr("x", adjustedInnerWidth / 2 - 50)
    .attr("y", innerHeight + 40)
    .attr("text-anchor", "middle")
    .text("Income ($)");

  // Men's bars (blue)
  g.selectAll(".men-bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "men-bar")
    .attr("y", (d) => y(d.education))
    .attr("x", 0)
    .attr("height", y.bandwidth() / 2 - 2) // Slightly reduced height with a small gap
    .attr("width", 0)
    .attr("fill", "#2563EB")
    .transition()
    .duration(800)
    .attr("width", (d) => x(d.menWage));

  // Women's bars (orange)
  g.selectAll(".women-bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "women-bar")
    .attr("y", (d) => y(d.education) + y.bandwidth() / 2 + 2) // Added small gap
    .attr("x", 0)
    .attr("height", y.bandwidth() / 2 - 2) // Slightly reduced height with a small gap
    .attr("width", 0)
    .attr("fill", "#F97316")
    .transition()
    .duration(800)
    .attr("width", (d) => x(d.womenWage));

  // Wage labels
  setTimeout(() => {
    g.selectAll(".men-wage-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "men-wage-label")
      .attr("x", (d) => {
        const barWidth = x(d.menWage);
        return barWidth > adjustedInnerWidth - 100
          ? barWidth - 40
          : barWidth + 5;
      })
      .attr("y", (d) => y(d.education) + y.bandwidth() / 4)
      .attr("dominant-baseline", "middle")
      .attr("font-size", "11px")
      .attr("fill", (d) =>
        x(d.menWage) > adjustedInnerWidth - 100 ? "white" : "black"
      )
      .attr("text-anchor", (d) =>
        x(d.menWage) > adjustedInnerWidth - 100 ? "end" : "start"
      )
      .text((d) => `$${Math.round(d.menWage / 1000)}k`);

    g.selectAll(".women-wage-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "women-wage-label")
      .attr("x", (d) => {
        const barWidth = x(d.womenWage);
        return barWidth > adjustedInnerWidth - 100
          ? barWidth - 40
          : barWidth + 5;
      })
      .attr("y", (d) => y(d.education) + (y.bandwidth() * 3) / 4)
      .attr("dominant-baseline", "middle")
      .attr("font-size", "11px")
      .attr("fill", (d) =>
        x(d.womenWage) > adjustedInnerWidth - 100 ? "white" : "black"
      )
      .attr("text-anchor", (d) =>
        x(d.womenWage) > adjustedInnerWidth - 100 ? "end" : "start"
      )
      .text((d) => `$${Math.round(d.womenWage / 1000)}k`);
  }, 1000);

  // Legend
  const legend = g
    .append("g")
    .attr("transform", `translate(${adjustedInnerWidth - 140}, 10)`);

  legend
    .append("rect")
    .attr("x", -10)
    .attr("y", -5)
    .attr("width", 110)
    .attr("height", 60)
    .attr("fill", "white")
    .attr("opacity", 0.8)
    .attr("rx", 5);

  legend
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", "#2563EB");
  legend.append("text").attr("x", 20).attr("y", 12).text("Male Income");

  legend
    .append("rect")
    .attr("x", 0)
    .attr("y", 25)
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", "#F97316");
  legend.append("text").attr("x", 20).attr("y", 37).text("Female Income");
}
