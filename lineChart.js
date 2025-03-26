// Draw yearly trends line chart
function drawLineChart(yearlyData) {
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
    .text("Gender Pay Gap Trends (1981-2013)");

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

  // Create a simple legend container below the SVG axes
  const legend = svg.append("g").attr(
    "transform",
    `translate(${margin.left + innerWidth / 4}, ${
      innerHeight + margin.bottom + 10
    })` // Adjusted for better centering
  ); // Centered and pushed further down

  // Men's wage legend
  legend
    .append("circle")
    .attr("cx", 0)
    .attr("cy", 10)
    .attr("r", 6)
    .attr("fill", "#2563EB");

  legend.append("text").attr("x", 15).attr("y", 15).text("Men's Wage");

  // Women's wage legend
  legend
    .append("circle")
    .attr("cx", 120)
    .attr("cy", 10)
    .attr("r", 6)
    .attr("fill", "#DB2777");

  legend.append("text").attr("x", 135).attr("y", 15).text("Women's Wage");

  // Gap percentage legend
  legend
    .append("line")
    .attr("x1", 240)
    .attr("y1", 10)
    .attr("x2", 260)
    .attr("y2", 10)
    .attr("stroke", "#047857")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "5,5");

  legend.append("text").attr("x", 270).attr("y", 15).text("Pay Gap (%)");
}
