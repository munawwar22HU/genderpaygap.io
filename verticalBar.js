// Draw age groups bar chart
function drawAgeVerticalBarChart(ageData) {
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
}

function drawRaceVerticalBarChart(raceData) {
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
}
