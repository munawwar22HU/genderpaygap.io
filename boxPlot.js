function drawHoursBoxPlot(hoursData) {
  clearChartArea();
  currentChartType = "box";

  // Select Tooltip
  const tooltip = d3.select("#tooltip");
  if (tooltip.empty()) {
    console.error("Tooltip element #tooltip not found.");
    return; // Exit if tooltip doesn't exist
  }

  // Prepare data (can likely remove if not needed elsewhere)
  const boxplotData = hoursData.map((d) => ({ ...d }));

  // Adjust margins and dimensions (use global vars if available)
  const chartHeight = typeof height !== "undefined" ? height : 600;
  const chartWidth = typeof width !== "undefined" ? width : 800;
  const adjustedMargin = { top: 80, right: 100, bottom: 80, left: 200 }; // Increased left margin for labels
  const innerWidth = chartWidth - adjustedMargin.left - adjustedMargin.right;
  const innerHeight = chartHeight - adjustedMargin.top - adjustedMargin.bottom;

  // Create the container group
  const g = svg
    .append("g")
    .attr(
      "transform",
      `translate(${adjustedMargin.left}, ${adjustedMargin.top})`
    );

  // Title
  g.append("text")
    .attr("class", "chart-title")
    .attr("x", innerWidth / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .text("Annual Hours Worked Distribution");

  // Y axis scale and axis
  const y = d3
    .scaleBand()
    .domain(boxplotData.map((d) => d.category))
    .range([0, innerHeight])
    .padding(0.2);

  g.append("g").call(d3.axisLeft(y));

  // X axis scale and axis
  const x = d3
    .scaleLinear()
    .domain([
      Math.min(0, d3.min(boxplotData, (d) => d.min) * 0.95), // Adjust domain slightly
      d3.max(boxplotData, (d) => d.max) * 1.05,
    ])
    .range([0, innerWidth]);

  g.append("g")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(x).tickFormat(d3.format(".0f")));

  // X axis label
  g.append("text")
    .attr("x", innerWidth / 2)
    .attr("y", innerHeight + 40)
    .attr("text-anchor", "middle")
    .text("Annual Hours Worked");

  // --- Tooltip Event Handlers for Box Plot Group ---
  const mouseover = function (event, d) {
    tooltip
      .html(
        `<strong>Category:</strong> ${d.category}<br/>` +
          `<strong>Min Hours:</strong> ${d.min.toFixed(0)}<br/>` +
          `<strong>Q1 Hours:</strong> ${d.q1.toFixed(0)}<br/>` +
          `<strong>Median Hours:</strong> ${d.median.toFixed(0)}<br/>` +
          `<strong>Q3 Hours:</strong> ${d.q3.toFixed(0)}<br/>` +
          `<strong>Max Hours:</strong> ${d.max.toFixed(0)}<br/>` +
          `<strong>Median Wage:</strong> $${d.medianWage.toLocaleString()}`
      )
      .classed("visible", true);
    // Rely on CSS :hover pseudo-class for highlighting the group now
    // Example CSS rule needed: .box-group:hover .box { opacity: 0.5; }
    // Example CSS rule needed: .box-group:hover .median-line { stroke-width: 3.5px; }
  };

  const mousemove = function (event, d) {
    const tooltipNode = tooltip.node();
    if (!tooltipNode) return;

    const tooltipWidth = tooltipNode.offsetWidth;
    const tooltipHeight = tooltipNode.offsetHeight;
    const pageX = event.pageX;
    const pageY = event.pageY;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollY = window.scrollY;

    let xPosition = pageX + 15;
    let yPosition = pageY - 10;

    // Check horizontal bounds
    if (xPosition + tooltipWidth > viewportWidth) {
      xPosition = pageX - tooltipWidth - 15;
    }
    // Check vertical bounds
    if (yPosition < scrollY) {
      yPosition = scrollY + 5;
    } else if (yPosition + tooltipHeight > scrollY + viewportHeight) {
      yPosition = scrollY + viewportHeight - tooltipHeight - 5;
    }

    tooltip.style("left", xPosition + "px").style("top", yPosition + "px");
  };

  const mouseout = function (event, d) {
    tooltip.classed("visible", false);
    // Highlight removed via CSS when :hover pseudo-class no longer applies
  };
  // --- End Tooltip Handlers ---

  // Box plots group - Create groups and attach events HERE
  const boxGroups = g
    .selectAll(".box-group")
    .data(boxplotData)
    .join("g") // Use .join() to handle data updates smoothly
    .attr("class", "box-group") // Apply class for CSS interaction styles
    .attr("transform", (d) => `translate(0, ${y(d.category)})`) // Position the group vertically
    .style("cursor", "pointer")
    .on("mouseover", mouseover) // Attach handlers TO THE GROUP
    .on("mousemove", mousemove)
    .on("mouseout", mouseout);

  // Draw elements WITHIN each group, using relative positioning
  boxGroups.each(function (d) {
    const currentGroup = d3.select(this); // Reference the group 'g' element
    const boxHeight = y.bandwidth();
    // yPos is now relative to the group's translated position (use 0 or boxHeight)
    const baseColor = d.category.includes("Male") ? "#5A67D8" : "#F6AD55";

    // Min-max line (whisker line)
    currentGroup
      .append("line")
      .attr("class", "whisker-line")
      .attr("x1", x(d.min))
      .attr("x2", x(d.max))
      .attr("y1", boxHeight / 2) // Centered vertically within the band
      .attr("y2", boxHeight / 2)
      .attr("stroke", "#999")
      .attr("stroke-width", 1.5);
    // Removed pointer-events: none

    // Whiskers ends
    ["min", "max"].forEach((type) => {
      currentGroup
        .append("line")
        .attr("class", "whisker-end")
        .attr("x1", x(d[type]))
        .attr("x2", x(d[type]))
        .attr("y1", boxHeight / 2 - 5) // Relative position
        .attr("y2", boxHeight / 2 + 5)
        .attr("stroke", "#666")
        .attr("stroke-width", 1.5);
      // Removed pointer-events: none
    });

    // Box from Q1 to Q3
    currentGroup
      .append("rect")
      .attr("class", "box")
      .attr("x", x(d.q1))
      .attr("y", boxHeight / 4) // Relative position
      .attr("width", Math.max(0, x(d.q3) - x(d.q1)))
      .attr("height", boxHeight / 2)
      .attr("fill", baseColor)
      .attr("opacity", 0.2) // Base opacity
      .attr("stroke", baseColor)
      .attr("stroke-width", 1);
    // Removed pointer-events: none

    // Median line
    currentGroup
      .append("line")
      .attr("class", "median-line")
      .attr("x1", x(d.median))
      .attr("x2", x(d.median))
      .attr("y1", boxHeight / 4) // Relative position
      .attr("y2", (boxHeight * 3) / 4)
      .attr("stroke", baseColor)
      .attr("stroke-width", 2.5);
    // Removed pointer-events: none
  });

  // // Legend (unchanged)
  // const legend = svg.append("g").attr(
  //   "transform",
  //   `translate(${adjustedMargin.left + innerWidth / 4}, ${
  //     chartHeight - adjustedMargin.bottom + 40 // Position below chart
  //   })`
  // );

  // legend
  //   .append("circle")
  //   .attr("cx", 0)
  //   .attr("cy", 10)
  //   .attr("r", 6)
  //   .attr("fill", "#5A67D8");
  // legend.append("text").attr("x", 15).attr("y", 15).text("Men's Wage");
  // legend
  //   .append("circle")
  //   .attr("cx", 120)
  //   .attr("cy", 10)
  //   .attr("r", 6)
  //   .attr("fill", "#F6AD55");
  // legend.append("text").attr("x", 135).attr("y", 15).text("Women's Wage");
}
