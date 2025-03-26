function drawHoursBoxPlot(hoursData) {
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
