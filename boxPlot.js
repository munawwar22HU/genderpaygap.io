function drawHoursBoxPlot(hoursData) {
  clearChartArea();
  currentChartType = "box";
  
  // Prepare data - calculate hourly rate and normalize hours
  const boxplotData = hoursData.map(d => ({
    ...d,
    // Convert total hours to hours per week
    hourlyRate: Math.round(d.medianWage / (d.median / 40)),
    averageHoursPerWeek: d.median / 40
  }));
  
  // Maximize margins for full use of the available space
  const margin = { top: 80, right: 100, bottom: 80, left: 200 };  // Reduced bottom margin
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Create the container group
  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Title 
  g.append("text")
    .attr("class", "chart-title")
    .attr("x", innerWidth / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .text("Annual Hours Worked Distribution");

  // Y axis scale and axis for the boxplot
  const y = d3
    .scaleBand()
    .domain(boxplotData.map(d => d.category))
    .range([0, innerHeight])
    .padding(0.2);
    
  g.append("g")
    .call(d3.axisLeft(y));

  // X axis scale and axis for the boxplot (annual hours)
  const x = d3
    .scaleLinear()
    .domain([
      Math.min(0, d3.min(boxplotData, d => d.min)),
      Math.max(6000, d3.max(boxplotData, d => d.max))
    ])
    .range([0, innerWidth]);
    
  g.append("g")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(x).tickFormat(d3.format(".0f")));

  // X axis label for annual hours
  g.append("text")
    .attr("x", innerWidth / 2)
    .attr("y", innerHeight + 40)
    .attr("text-anchor", "middle")
    .text("Annual Hours Worked");

  // Box plots
  boxplotData.forEach((d, i) => {
    const boxHeight = y.bandwidth();
    const category = d.category;
    const yPos = y(category);
    const baseColor = category.includes('Male') ? "#2563EB" : "#DB2777";
    
    // Min-max line
    g.append("line")
      .attr("x1", x(d.min))
      .attr("x2", x(d.max))
      .attr("y1", yPos + boxHeight / 2)
      .attr("y2", yPos + boxHeight / 2)
      .attr("stroke", "#999")
      .attr("stroke-width", 1.5);

    // Whiskers
    ["min", "max"].forEach((type) => {
      g.append("line")
        .attr("x1", x(d[type]))
        .attr("x2", x(d[type]))
        .attr("y1", yPos + boxHeight / 2 - 5)
        .attr("y2", yPos + boxHeight / 2 + 5)
        .attr("stroke", "#666")
        .attr("stroke-width", 1.5);
    });

    // Box from Q1 to Q3
    g.append("rect")
      .attr("x", x(d.q1))
      .attr("y", yPos + boxHeight / 4)
      .attr("width", x(d.q3) - x(d.q1))
      .attr("height", boxHeight / 2)
      .attr("fill", baseColor)
      .attr("opacity", 0.2)
      .attr("stroke", baseColor)
      .attr("stroke-width", 1);

    // Median line
    g.append("line")
      .attr("x1", x(d.median))
      .attr("x2", x(d.median))
      .attr("y1", yPos + boxHeight / 4)
      .attr("y2", yPos + boxHeight * 3/4)
      .attr("stroke", baseColor)
      .attr("stroke-width", 2.5);

    // Median wage annotation
    g.append("text")
      .attr("x", x(d.max) + 15)
      .attr("y", yPos + boxHeight / 2)
      .attr("font-size", "11px")
      .attr("fill", "#444")
      .text(`$${d.medianWage.toLocaleString()} annual`)
      .attr("alignment-baseline", "middle");
  });

  // Create a simple legend container below the SVG axes
  const legend = svg.append("g").attr(
    "transform",
    `translate(${margin.left + innerWidth / 4}, ${
      innerHeight + margin.bottom + 40
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
