function drawLineChart(yearlyData) {
  clearChartArea();
  currentChartType = "line";

  const tooltip = d3.select("#tooltip");
  if (tooltip.empty()) {
    console.error("Tooltip element #tooltip not found.");
    return;
  }

  g = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  xScale = d3
    .scaleLinear()
    .domain(d3.extent(yearlyData, (d) => d.year))
    .range([0, innerWidth]);

  g.append("g")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

  yScale = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(yearlyData, (d) => Math.max(d.menWage, d.womenWage)) * 1.1,
    ])
    .range([innerHeight, 0]);

  g.append("g").call(d3.axisLeft(yScale).tickFormat((d) => `${d / 1000}k`));

  y2Scale = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0]);

  g.append("g")
    .attr("transform", `translate(${innerWidth}, 0)`)
    .call(d3.axisRight(y2Scale).tickFormat((d) => `${d}%`));

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

  g.append("text")
    .attr("class", "chart-title")
    .attr("x", innerWidth / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .text("Gender Pay Gap Trends (1981-2013)");

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

  const menPath = g
    .append("path")
    .datum(yearlyData)
    .attr("class", "men-line")
    .attr("fill", "none")
    .attr("stroke", CHART_COLORS.PRIMARY_1)
    .attr("stroke-width", 2.5)
    .attr("d", menLine);

  const menPathLength = menPath.node().getTotalLength();
  menPath
    .attr("stroke-dasharray", menPathLength)
    .attr("stroke-dashoffset", menPathLength)
    .transition()
    .duration(1500)
    .attr("stroke-dashoffset", 0);

  const womenPath = g
    .append("path")
    .datum(yearlyData)
    .attr("class", "women-line")
    .attr("fill", "none")
    .attr("stroke", CHART_COLORS.PRIMARY_2)
    .attr("stroke-width", 2.5)
    .attr("d", womenLine);

  const womenPathLength = womenPath.node().getTotalLength();
  womenPath
    .attr("stroke-dasharray", womenPathLength)
    .attr("stroke-dashoffset", womenPathLength)
    .transition()
    .duration(1500)
    .attr("stroke-dashoffset", 0);

  const gapPath = g
    .append("path")
    .datum(yearlyData)
    .attr("class", "gap-line")
    .attr("fill", "none")
    .attr("stroke", CHART_COLORS.ACCENT)
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

  
  const mouseoverMen = function (event, d) {
    tooltip
      .html(
        `<strong>Year:</strong> ${d.year}<br/>` +
          `<strong>Men's Wage:</strong> $${d.menWage.toLocaleString()}`
      )
      .classed("visible", true);
  };

  const mouseoverWomen = function (event, d) {
    tooltip
      .html(
        `<strong>Year:</strong> ${d.year}<br/>` +
          `<strong>Women's Wage:</strong> $${d.womenWage.toLocaleString()}`
      )
      .classed("visible", true);
  };

  const mouseoverGap = function (event, d) {
    tooltip
      .html(
        `<strong>Year:</strong> ${d.year}<br/>` +
          `<strong>Percentage Gap:</strong> ${d.gapPercentage.toLocaleString()}%`
      )
      .classed("visible", true);
  };
  

  g.selectAll(".men-dot")
    .data(yearlyData)
    .join("circle")
    .attr("class", "men-dot")
    .attr("cx", (d) => xScale(d.year))
    .attr("cy", (d) => yScale(d.menWage))
    .attr("r", 5)
    .attr("fill", CHART_COLORS.PRIMARY_1)
    .style("cursor", "pointer")
    .on("mouseover", mouseoverMen)
    .on("mousemove", mousemove)
    .on("mouseout", mouseout);

  g.selectAll(".women-dot")
    .data(yearlyData)
    .join("circle")
    .attr("class", "women-dot")
    .attr("cx", (d) => xScale(d.year))
    .attr("cy", (d) => yScale(d.womenWage))
    .attr("r", 5)
    .attr("fill", CHART_COLORS.PRIMARY_2)
    .style("cursor", "pointer")
    .on("mouseover", mouseoverWomen)
    .on("mousemove", mousemove)
    .on("mouseout", mouseout);

  g.selectAll(".gap-dot")
    .data(yearlyData)
    .join("circle")
    .attr("class", "gap-dot")
    .attr("cx", (d) => xScale(d.year))
    .attr("cy", (d) => y2Scale(d.gapPercentage))
    .attr("r", 5)
    .attr("fill", CHART_COLORS.ACCENT)
    .style("cursor", "pointer")
    .on("mouseover", mouseoverGap)
    .on("mousemove", mousemove)
    .on("mouseout", mouseout);

  const legend = svg
    .append("g")
    .attr(
      "transform",
      `translate(${margin.left + innerWidth / 4}, ${
        innerHeight + margin.bottom + 10
      })`
    );

  legend
    .append("circle")
    .attr("cx", 0)
    .attr("cy", 10)
    .attr("r", 6)
    .attr("fill", CHART_COLORS.PRIMARY_1);
  legend.append("text").attr("x", 15).attr("y", 15).text("Men's Wage");

  legend
    .append("circle")
    .attr("cx", 120)
    .attr("cy", 10)
    .attr("r", 6)
    .attr("fill", CHART_COLORS.PRIMARY_2);
  legend.append("text").attr("x", 135).attr("y", 15).text("Women's Wage");

  legend
    .append("line")
    .attr("x1", 240)
    .attr("y1", 10)
    .attr("x2", 260)
    .attr("y2", 10)
    .attr("stroke", CHART_COLORS.ACCENT)
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "5,5");
  legend.append("text").attr("x", 270).attr("y", 15).text("Pay Gap (%)");
}
