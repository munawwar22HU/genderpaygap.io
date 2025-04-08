function drawOccupationStackedBarChart(occupationData) {
  clearChartArea();
  currentChartType = "bar";

  // Select Tooltip
  const tooltip = d3.select("#tooltip");

  // Adjust margins and height (use global vars if available)
  const bottomMargin = 100;
  const chartHeight = (typeof height !== 'undefined' ? height : 600);
  const chartWidth = (typeof width !== 'undefined' ? width : 800);
  const marginTop = (typeof margin !== 'undefined' && margin.top) ? margin.top : 50;
  const marginRight = (typeof margin !== 'undefined' && margin.right) ? margin.right : 50;
  const marginBottom = (typeof margin !== 'undefined' && margin.bottom) ? margin.bottom : 50;
  const marginLeft = (typeof margin !== 'undefined' && margin.left) ? margin.left : 50;

  const adjustedInnerHeight = chartHeight - marginTop - marginBottom - bottomMargin;
  const adjustedInnerWidth = chartWidth - marginLeft - marginRight;

  // Create the container group
  const g = svg
    .append("g")
    .attr("transform", `translate(${marginLeft}, ${marginTop})`);

  // X-axis scale
  const xScale = d3
    .scaleBand()
    .domain(occupationData.map((d) => d.occupation))
    .range([0, adjustedInnerWidth])
    .padding(0.2);

  // Append x-axis with rotated labels
  g.append("g")
    .attr("transform", `translate(0, ${adjustedInnerHeight})`)
    .call(d3.axisBottom(xScale).tickSize(0))
    .selectAll("text")
    .style("text-anchor", "start")
    .attr("dx", "0.5em")
    .attr("dy", "0")
    .attr("transform", "rotate(90)");

  // Y-axis scale
  const yScale = d3
    .scaleLinear()
    .domain([0, 100]) // Assuming data is in percentages 0-100
    .range([adjustedInnerHeight, 0]);

  g.append("g").call(d3.axisLeft(yScale).tickFormat((d) => `${d}%`));

  // Define colors
  const colors = { men: "#5A67D8", women: "#F6AD55" };

  // Data transformation for stacking
  const stackKeys = ["menPercentage", "womenPercentage"]; // Keys in your data objects
  const stackedData = d3.stack()
    .keys(stackKeys)(occupationData);

  // --- Tooltip Event Handlers ---
  const mouseover = function(event, d) {
    // d is the data for the segment: [startValue, endValue]
    // d.data is the original data object for the whole bar (occupation)
    const parentData = d3.select(this.parentNode).datum(); // Gets the stack layer data (key, index)
    const key = parentData.key; // "menPercentage" or "womenPercentage"
    const percentage = d[1] - d[0];
    const gender = key === "menPercentage" ? "Men" : "Women";

    tooltip
      .html(
        `<strong>Occupation:</strong> ${d.data.occupation}<br/>` + // Access occupation from original data
        `<strong>${gender}:</strong> ${percentage.toFixed(1)}%`
      )
      .classed('visible', true);
    // d3.select(this).style("opacity", 0.7); // Use CSS :hover
  };

  const mousemove = function(event, d) {
    tooltip
      .style("left", (event.pageX + 15) + "px")
      .style("top", (event.pageY - 10) + "px");
  };

  const mouseout = function(event, d) {
    tooltip.classed('visible', false);
    // d3.select(this).style("opacity", 1); // Use CSS :hover
  };
  // --- End Tooltip Handlers ---

  // Create groups for each stack layer (men, women)
  g.append("g")
    .selectAll("g")
    .data(stackedData)
    .join("g")
      .attr("fill", (d) => colors[d.key === 'menPercentage' ? 'men' : 'women'])
      .attr("class", (d) => d.key === 'menPercentage' ? 'men-stack' : 'women-stack') // For potential CSS styling
    .selectAll("rect")
    .data((d) => d) // Bind segments [start, end] array to rects
    .join("rect")
      .attr("x", (d) => xScale(d.data.occupation)) // Access occupation from original data obj
      .attr("y", (d) => yScale(d[1])) // Top of segment is end value
      .attr("height", (d) => Math.max(0, yScale(d[0]) - yScale(d[1]))) // Height based on difference, ensure non-negative
      .attr("width", xScale.bandwidth())
      .style("cursor", "pointer")
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseout", mouseout);


 
  const legend = svg.append("g").attr("transform", `translate(${margin.left + innerWidth / 4}, ${innerHeight + margin.bottom + 10})`);
  legend.append("circle").attr("cx", 0).attr("cy", 10).attr("r", 6).attr("fill", "#5A67D8");
  legend.append("text").attr("x", 15).attr("y", 15).text("Percentage of Men");
  legend.append("circle").attr("cx", 130).attr("cy", 10).attr("r", 6).attr("fill", "#F6AD55");
  legend.append("text").attr("x", 145).attr("y", 15).text("Percentage of Women");
 
  // Chart title
  g.append("text")
    .attr("x", adjustedInnerWidth / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .attr("class", "chart-title")
    .text("Gender Proportion by Occupation");
}
