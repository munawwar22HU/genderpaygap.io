function drawHoursBoxPlot(hoursData) {
  clearChartArea();
  currentChartType = "box";

  const tooltip = d3.select("#tooltip");
  if (tooltip.empty()) {
    console.error("Tooltip element #tooltip not found.");
    return;
  }

  const boxplotData = hoursData.map((d) => ({ ...d }));

  const chartHeight = typeof height !== "undefined" ? height : 600;
  const chartWidth = typeof width !== "undefined" ? width : 800;
  const adjustedMargin = { top: 80, right: 100, bottom: 80, left: 200 };
  const innerWidth = chartWidth - adjustedMargin.left - adjustedMargin.right;
  const innerHeight = chartHeight - adjustedMargin.top - adjustedMargin.bottom;

  const g = svg
    .append("g")
    .attr(
      "transform",
      `translate(${adjustedMargin.left}, ${adjustedMargin.top})`
    );

  g.append("text")
    .attr("class", "chart-title")
    .attr("x", innerWidth / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .text("Annual hours worked distribution by gender");

  const y = d3
    .scaleBand()
    .domain(boxplotData.map((d) => d.category))
    .range([0, innerHeight])
    .padding(0.2);

  g.append("g").call(d3.axisLeft(y));

  const x = d3
    .scaleLinear()
    .domain([
      Math.min(0, d3.min(boxplotData, (d) => d.min) * 0.95),
      d3.max(boxplotData, (d) => d.max) * 1.05,
    ])
    .range([0, innerWidth]);

  g.append("g")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(x).tickFormat(d3.format(".0f")));

  g.append("text")
    .attr("x", innerWidth / 2)
    .attr("y", innerHeight + 40)
    .attr("text-anchor", "middle")
    .text("Annual hours worked");

  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -120) // Adjusted position
    .attr("x", -innerHeight / 2)
    .attr("text-anchor", "middle")
    .text("Employment Type & Gender");

  const mouseover = function (event, d) {
    tooltip
      .html(`<strong>Median Wage:</strong> $${d.medianWage.toLocaleString()}`)
      .classed("visible", true);
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

    if (xPosition + tooltipWidth > viewportWidth) {
      xPosition = pageX - tooltipWidth - 15;
    }

    if (yPosition < scrollY) {
      yPosition = scrollY + 5;
    } else if (yPosition + tooltipHeight > scrollY + viewportHeight) {
      yPosition = scrollY + viewportHeight - tooltipHeight - 5;
    }

    tooltip.style("left", xPosition + "px").style("top", yPosition + "px");
  };

  const mouseout = function (event, d) {
    tooltip.classed("visible", false);
  };

  const boxGroups = g
    .selectAll(".box-group")
    .data(boxplotData)
    .join("g")
    .attr("class", "box-group")
    .attr("transform", (d) => `translate(0, ${y(d.category)})`)
    .style("cursor", "pointer")
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseout", mouseout);

  boxGroups.each(function (d) {
    const currentGroup = d3.select(this);
    const boxHeight = y.bandwidth();
    const baseColor = d.category.includes("Male")
      ? CHART_COLORS.PRIMARY_1
      : CHART_COLORS.PRIMARY_2;

    currentGroup
      .append("line")
      .attr("class", "whisker-line")
      .attr("x1", x(d.min))
      .attr("x2", x(d.max))
      .attr("y1", boxHeight / 2)
      .attr("y2", boxHeight / 2)
      .attr("stroke", "#999")
      .attr("stroke-width", 1.5);

    ["min", "max"].forEach((type) => {
      currentGroup
        .append("line")
        .attr("class", "whisker-end")
        .attr("x1", x(d[type]))
        .attr("x2", x(d[type]))
        .attr("y1", boxHeight / 2 - 5)
        .attr("y2", boxHeight / 2 + 5)
        .attr("stroke", "#666")
        .attr("stroke-width", 1.5);
    });

    currentGroup
      .append("rect")
      .attr("class", "box")
      .attr("x", x(d.q1))
      .attr("y", boxHeight / 4)
      .attr("width", Math.max(0, x(d.q3) - x(d.q1)))
      .attr("height", boxHeight / 2)
      .attr("fill", baseColor)
      .attr("opacity", 0.2)
      .attr("stroke", baseColor)
      .attr("stroke-width", 1);

    currentGroup
      .append("line")
      .attr("class", "median-line")
      .attr("x1", x(d.median))
      .attr("x2", x(d.median))
      .attr("y1", boxHeight / 4)
      .attr("y2", (boxHeight * 3) / 4)
      .attr("stroke", baseColor)
      .attr("stroke-width", 2.5);
  });

  
}
