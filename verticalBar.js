// Draw age groups bar chart
function drawAgeVerticalBarChart(ageData) {
  clearChartArea();
  currentChartType = "bar";

  // Select the tooltip element ONCE
  const tooltip = d3.select("#tooltip");
  if (tooltip.empty()) { console.error("Tooltip element #tooltip not found."); return; }

  // Create the container group
  g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

  // X axis scale and axis
  xScale = d3.scaleBand().domain(ageData.map((d) => d.ageGroup)).range([0, innerWidth]).padding(0.3);
  g.append("g").attr("transform", `translate(0, ${innerHeight})`).call(d3.axisBottom(xScale));

  // Y axis for wages
  yScale = d3.scaleLinear().domain([0, d3.max(ageData, (d) => Math.max(d.menWage, d.womenWage)) * 1.1]).range([innerHeight, 0]);
  g.append("g").call(d3.axisLeft(yScale).tickFormat((d) => `${d / 1000}k`));

  // Add axis labels
  g.append("text").attr("x", innerWidth / 2).attr("y", innerHeight + 40).attr("text-anchor", "middle").text("Age Group");
  g.append("text").attr("transform", "rotate(-90)").attr("y", -60).attr("x", -innerHeight / 2).attr("text-anchor", "middle").text("Annual Wage ($)");

  // Add chart title
  g.append("text").attr("class", "chart-title").attr("x", innerWidth / 2).attr("y", -20).attr("text-anchor", "middle").text("Gender Pay Gap by Age Group");

  // Group width for men's and women's bars
  const xSubgroup = d3.scaleBand().domain(["men", "women"]).range([0, xScale.bandwidth()]).padding(0.05);

  // --- Tooltip Event Handlers for Age Chart ---
  const mousemove = function(event, d) {
    // Standard mousemove logic to position tooltip, checking bounds
    const tooltipNode = tooltip.node(); if (!tooltipNode) return;
    const tooltipWidth = tooltipNode.offsetWidth; const tooltipHeight = tooltipNode.offsetHeight;
    const pageX = event.pageX; const pageY = event.pageY;
    const viewportWidth = window.innerWidth; const viewportHeight = window.innerHeight;
    const scrollY = window.scrollY;
    let xPosition = pageX + 15; let yPosition = pageY - 10;
    if (xPosition + tooltipWidth > viewportWidth) { xPosition = pageX - tooltipWidth - 15; }
    if (yPosition < scrollY) { yPosition = scrollY + 5; }
    else if (yPosition + tooltipHeight > scrollY + viewportHeight) { yPosition = scrollY + viewportHeight - tooltipHeight - 5; }
    tooltip.style("left", xPosition + "px").style("top", yPosition + "px");
  };

  const mouseout = function(event, d) {
    tooltip.classed('visible', false);
  };

  // Specific mouseover for Men - Age
  const mouseoverMenAge = function(event, d) {
    tooltip
      .html(
        `<strong>Age Group:</strong> ${d.ageGroup}<br/>` +
        `<strong>Men's Wage:</strong> $${d.menWage.toLocaleString()}`
      )
      .classed('visible', true);
  };

  // Specific mouseover for Women - Age
   const mouseoverWomenAge = function(event, d) {
    tooltip
      .html(
        `<strong>Age Group:</strong> ${d.ageGroup}<br/>` +
        `<strong>Women's Wage:</strong> $${d.womenWage.toLocaleString()}`
      )
      .classed('visible', true);
  };
  // --- End Tooltip Handlers ---

  // Men's bars with animation and specific tooltip events - updated colors
  g.selectAll(".men-bar")
    .data(ageData)
    .join("rect")
    .attr("class", "bar men-bar")
    .attr("x", (d) => xScale(d.ageGroup) + xSubgroup("men"))
    .attr("y", innerHeight)
    .attr("width", xSubgroup.bandwidth())
    .attr("height", 0)
    .attr("fill", CHART_COLORS.PRIMARY_1) // Updated color
    .style("cursor", "pointer")
    .on("mouseover", mouseoverMenAge)
    .on("mousemove", mousemove)
    .on("mouseout", mouseout)
    .transition()
    .duration(1000)
    .attr("y", (d) => yScale(d.menWage))
    .attr("height", (d) => innerHeight - yScale(d.menWage));

  // Women's bars with animation and specific tooltip events - updated colors
  g.selectAll(".women-bar")
    .data(ageData)
    .join("rect")
    .attr("class", "bar women-bar")
    .attr("x", (d) => xScale(d.ageGroup) + xSubgroup("women"))
    .attr("y", innerHeight)
    .attr("width", xSubgroup.bandwidth())
    .attr("height", 0)
    .attr("fill", CHART_COLORS.PRIMARY_2) // Updated color
    .style("cursor", "pointer")
    .on("mouseover", mouseoverWomenAge)
    .on("mousemove", mousemove)
    .on("mouseout", mouseout)
    .transition()
    .duration(1000)
    .attr("y", (d) => yScale(d.womenWage))
    .attr("height", (d) => innerHeight - yScale(d.womenWage));

  // Updated legend with new colors
  const legend = svg.append("g")
    .attr("transform", `translate(${margin.left + innerWidth / 4}, ${innerHeight + margin.bottom + 10})`);
  
  // Men's legend item
  legend.append("circle")
    .attr("cx", 0)
    .attr("cy", 10)
    .attr("r", 6)
    .attr("fill", CHART_COLORS.PRIMARY_1);
  legend.append("text")
    .attr("x", 15)
    .attr("y", 15)
    .text("Men's Wage");
  
  // Women's legend item
  legend.append("circle")
    .attr("cx", 120)
    .attr("cy", 10)
    .attr("r", 6)
    .attr("fill", CHART_COLORS.PRIMARY_2);
  legend.append("text")
    .attr("x", 135)
    .attr("y", 15)
    .text("Women's Wage");
}

// Draw Race Vertical Bar Chart
function drawRaceVerticalBarChart(raceData) {
  clearChartArea();
  currentChartType = "bar";

  // Select Tooltip
  const tooltip = d3.select("#tooltip");
   if (tooltip.empty()) { console.error("Tooltip element #tooltip not found."); return; }

  // Sort data
  const sortedData = [...raceData].sort((a, b) => b.menWage - a.menWage);

  // Create group
  g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Title
  g.append("text")
    .attr("class", "chart-title")
    .attr("x", innerWidth / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .text("Wage Comparison by Race/Ethnicity");

  // X axis
  const x = d3.scaleBand()
    .domain(sortedData.map((d) => d.race))
    .range([0, innerWidth])
    .padding(0.4); // Increased padding
  g.append("g")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(x));

  // Y axis
  const y = d3.scaleLinear()
    .domain([0, d3.max(sortedData, (d) => Math.max(d.menWage, d.womenWage)) * 1.1])
    .range([innerHeight, 0]);
  g.append("g")
    .call(d3.axisLeft(y).tickFormat((d) => `${d / 1000}k`));

  // Y axis label
  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -60)
    .attr("x", -innerHeight / 2)
    .attr("text-anchor", "middle")
    .text("Annual Wage ($)");

  // X axis label
  g.append("text")
    .attr("x", innerWidth / 2)
    .attr("y", innerHeight + 40)
    .attr("text-anchor", "middle")
    .text("Race/Ethnicity");

  // Subgroup scale with increased padding
  const xSubgroup = d3.scaleBand()
    .domain(["men", "women"])
    .range([0, x.bandwidth()])
    .padding(0.3);

  // --- Tooltip Handlers for Race ---
   const mousemove = function(event, d) { // Generic mousemove reused
     const tooltipNode = tooltip.node(); if (!tooltipNode) return;
     const tooltipWidth = tooltipNode.offsetWidth; const tooltipHeight = tooltipNode.offsetHeight;
     const pageX = event.pageX; const pageY = event.pageY;
     const viewportWidth = window.innerWidth; const viewportHeight = window.innerHeight;
     const scrollY = window.scrollY;
     let xPosition = pageX + 15; let yPosition = pageY - 10;
     if (xPosition + tooltipWidth > viewportWidth) { xPosition = pageX - tooltipWidth - 15; }
     if (yPosition < scrollY) { yPosition = scrollY + 5; }
     else if (yPosition + tooltipHeight > scrollY + viewportHeight) { yPosition = scrollY + viewportHeight - tooltipHeight - 5; }
     tooltip.style("left", xPosition + "px").style("top", yPosition + "px");
   };

   const mouseout = function(event, d) { // Generic mouseout reused
     tooltip.classed('visible', false);
   };

  // Specific mouseover for Men - Race
   const mouseoverMenRace = function(event, d) {
    tooltip
      .html(
        `<strong>Race/Ethnicity:</strong> ${d.race}<br/>` +
        `<strong>Men's Wage:</strong> $${d.menWage.toLocaleString()}`
      )
      .classed('visible', true);
  };

  // Specific mouseover for Women - Race
   const mouseoverWomenRace = function(event, d) {
    tooltip
      .html(
        `<strong>Race/Ethnicity:</strong> ${d.race}<br/>` +
        `<strong>Women's Wage:</strong> $${d.womenWage.toLocaleString()}`
      )
      .classed('visible', true);
  };
  // --- End Tooltip Handlers ---

  // Men's bars - updated colors
  g.selectAll(".men-bar")
    .data(sortedData)
    .join("rect")
    .attr("class", "bar men-bar")
    .attr("x", (d) => x(d.race) + xSubgroup("men"))
    .attr("y", innerHeight)
    .attr("width", xSubgroup.bandwidth())
    .attr("height", 0)
    .attr("fill", CHART_COLORS.PRIMARY_1) // Updated color
    .style("cursor", "pointer")
    .on("mouseover", mouseoverMenRace)
    .on("mousemove", mousemove)
    .on("mouseout", mouseout)
    .transition()
    .duration(800)
    .attr("y", (d) => y(d.menWage))
    .attr("height", (d) => innerHeight - y(d.menWage));

  // Women's bars - updated colors
  g.selectAll(".women-bar")
    .data(sortedData)
    .join("rect")
    .attr("class", "bar women-bar")
    .attr("x", (d) => x(d.race) + xSubgroup("women"))
    .attr("y", innerHeight)
    .attr("width", xSubgroup.bandwidth())
    .attr("height", 0)
    .attr("fill", CHART_COLORS.PRIMARY_2) // Updated color
    .style("cursor", "pointer")
    .on("mouseover", mouseoverWomenRace)
    .on("mousemove", mousemove)
    .on("mouseout", mouseout)
    .transition()
    .duration(800)
    .attr("y", (d) => y(d.womenWage))
    .attr("height", (d) => innerHeight - y(d.womenWage));

  // Add wage labels (keep setTimeout)
  setTimeout(() => {
    g.selectAll(".men-wage-label")
      .data(sortedData)
      .join("text")
      .attr("class", "men-wage-label")
      .attr("x", (d) => x(d.race) + xSubgroup("men") + xSubgroup.bandwidth() / 2)
      .attr("y", (d) => y(d.menWage) - 5)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("paint-order", "stroke")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", "2px")
      .text((d) => `${(d.menWage / 1000).toFixed(0)}k`);
    
    g.selectAll(".women-wage-label")
      .data(sortedData)
      .join("text")
      .attr("class", "women-wage-label")
      .attr("x", (d) => x(d.race) + xSubgroup("women") + xSubgroup.bandwidth() / 2)
      .attr("y", (d) => y(d.womenWage) - 5)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("paint-order", "stroke")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", "2px")
      .text((d) => `${(d.womenWage / 1000).toFixed(0)}k`);
  }, 900);

  // Updated legend with new colors
  const legend = svg.append("g")
    .attr("transform", `translate(${margin.left + innerWidth / 4}, ${innerHeight + margin.bottom + 10})`);
  
  // Men's legend item
  legend.append("circle")
    .attr("cx", 0)
    .attr("cy", 10)
    .attr("r", 6)
    .attr("fill", CHART_COLORS.PRIMARY_1);
  legend.append("text")
    .attr("x", 15)
    .attr("y", 15)
    .text("Men's Wage");
  
  // Women's legend item
  legend.append("circle")
    .attr("cx", 120)
    .attr("cy", 10)
    .attr("r", 6)
    .attr("fill", CHART_COLORS.PRIMARY_2);
  legend.append("text")
    .attr("x", 135)
    .attr("y", 15)
    .text("Women's Wage");
}