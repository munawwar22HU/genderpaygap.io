function drawOccupationStackedBarChart(occupationData) {
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
    .attr("transform", "rotate(90)"); // Rotate 45 degrees instead of 90 for better readability

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

  
  // Chart title
  g.append("text")
    .attr("x", innerWidth / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .attr("class", "chart-title")
    .text("Gender Proportion by Occupation");
}
