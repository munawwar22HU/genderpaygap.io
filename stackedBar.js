function drawOccupationStackedBarChart(occupationProportionData) {
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
    .domain(occupationProportionData.map((d) => d.occupation))
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

  // Define colors using the new color scheme
  const colors = { 
    men: CHART_COLORS.PRIMARY_1,
    women: CHART_COLORS.PRIMARY_2
  };

  // Data transformation for stacking
  const stackKeys = ["menPercentage", "womenPercentage"]; // Keys in your data objects
  const stackedData = d3.stack()
    .keys(stackKeys)(occupationProportionData);

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
  };

  const mousemove = function(event, d) {
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
     if (xPosition + tooltipWidth > viewportWidth) {
       xPosition = pageX - tooltipWidth - 15;
     }
     if (yPosition < scrollY) {
       yPosition = scrollY + 5;
     } else if (yPosition + tooltipHeight > scrollY + viewportHeight) {
       yPosition = scrollY + viewportHeight - tooltipHeight - 5;
     }
     tooltip.style("left", xPosition + "px")
            .style("top", yPosition + "px");
  };

  const mouseout = function(event, d) {
    tooltip.classed('visible', false);
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

  // X-axis label for clarity
  g.append("text")
    .attr("x", adjustedInnerWidth / 2 )
    .attr("y", adjustedInnerHeight + 110)
    .attr("text-anchor", "middle")
    .text("Occupation Types");

  // Y-axis label for clarity
  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -50)
    .attr("x", -adjustedInnerHeight / 2)
    .attr("text-anchor", "middle")
    .text("Percentage (%)");

  // Updated legend with clearer labels
  const legend = svg.append("g").attr(
    "transform",
    `translate(${marginLeft + adjustedInnerWidth / 4}, ${
       chartHeight - bottomMargin + 10 // Position below chart
    })`
  );

  // Men's legend item
  legend.append("circle")
    .attr("cx", 0)
    .attr("cy", 20)
    .attr("r", 6)
    .attr("fill", CHART_COLORS.PRIMARY_1);
  legend.append("text")
    .attr("x", 15)
    .attr("y", 25)
    .text("Men (% of Workforce)");
  
  // Women's legend item
  legend.append("circle")
    .attr("cx", 145)
    .attr("cy", 20)
    .attr("r", 6)
    .attr("fill", CHART_COLORS.PRIMARY_2);
  legend.append("text")
    .attr("x", 160)
    .attr("y", 25)
    .text("Women (% of Workforce)");
  
  
  // Chart title
  g.append("text")
    .attr("x", adjustedInnerWidth / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .attr("class", "chart-title")
    .text("Gender Distribution by Occupation");
}