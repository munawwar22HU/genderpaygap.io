function drawOccupationStackedBarChart(occupationProportionData) {
  clearChartArea();
  currentChartType = "bar";
  const tooltip = d3.select("#tooltip");

  const bottomMargin = 100;
  const chartHeight = typeof height !== "undefined" ? height : 600;
  const chartWidth = typeof width !== "undefined" ? width : 800;
  const marginTop =
    typeof margin !== "undefined" && margin.top ? margin.top : 50;
  const marginRight =
    typeof margin !== "undefined" && margin.right ? margin.right : 50;
  const marginBottom =
    typeof margin !== "undefined" && margin.bottom ? margin.bottom : 50;
  const marginLeft =
    typeof margin !== "undefined" && margin.left ? margin.left : 50;

  const adjustedInnerHeight =
    chartHeight - marginTop - marginBottom - bottomMargin;
  const adjustedInnerWidth = chartWidth - marginLeft - marginRight;

  const g = svg
    .append("g")
    .attr("transform", `translate(${marginLeft}, ${marginTop})`);

  const xScale = d3
    .scaleBand()
    .domain(occupationProportionData.map((d) => d.occupation))
    .range([0, adjustedInnerWidth])
    .padding(0.2);

  g.append("g")
    .attr("transform", `translate(0, ${adjustedInnerHeight})`)
    .call(d3.axisBottom(xScale).tickSize(0))
    .selectAll("text")
    .style("text-anchor", "start")
    .attr("dx", "0.5em")
    .attr("dy", "0")
    .attr("transform", "rotate(90)");

  const yScale = d3
    .scaleLinear()
    .domain([0, 100])
    .range([adjustedInnerHeight, 0]);

  g.append("g").call(d3.axisLeft(yScale).tickFormat((d) => `${d}%`));

  const colors = {
    men: CHART_COLORS.PRIMARY_1,
    women: CHART_COLORS.PRIMARY_2,
  };

  const stackKeys = ["menPercentage", "womenPercentage"];
  const stackedData = d3.stack().keys(stackKeys)(occupationProportionData);

  const mouseover = function (event, d) {
    const parentData = d3.select(this.parentNode).datum();
    const key = parentData.key;
    const percentage = d[1] - d[0];
    const gender = key === "menPercentage" ? "Men" : "Women";

    tooltip
      .html(
        `<strong>Occupation:</strong> ${d.data.occupation}<br/>` +
          `<strong>${gender}:</strong> ${percentage.toFixed(1)}%`
      )
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

  g.append("g")
    .selectAll("g")
    .data(stackedData)
    .join("g")
    .attr("fill", (d) => colors[d.key === "menPercentage" ? "men" : "women"])
    .attr("class", (d) =>
      d.key === "menPercentage" ? "men-stack" : "women-stack"
    )
    .selectAll("rect")
    .data((d) => d)
    .join("rect")
    .attr("x", (d) => xScale(d.data.occupation))
    .attr("y", (d) => yScale(d[1]))
    .attr("height", (d) => Math.max(0, yScale(d[0]) - yScale(d[1])))
    .attr("width", xScale.bandwidth())
    .style("cursor", "pointer")
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseout", mouseout);

  g.append("text")
    .attr("x", adjustedInnerWidth / 2)
    .attr("y", adjustedInnerHeight + 150)
    .attr("text-anchor", "middle")
    .text("Occupation Types");

  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -50)
    .attr("x", -adjustedInnerHeight / 2)
    .attr("text-anchor", "middle")
    .text("Percentage (%)");

  const legend = svg.append("g").attr(
    "transform",
    `translate(${marginLeft + adjustedInnerWidth / 4}, ${
      chartHeight - bottomMargin + 50 
    })`
  );

  legend
    .append("circle")
    .attr("cx", 0)
    .attr("cy", 20)
    .attr("r", 6)
    .attr("fill", CHART_COLORS.PRIMARY_1);
  legend
    .append("text")
    .attr("x", 15)
    .attr("y", 25)
    .text("Men (% of Workforce)");

  legend
    .append("circle")
    .attr("cx", 145)
    .attr("cy", 20)
    .attr("r", 6)
    .attr("fill", CHART_COLORS.PRIMARY_2);
  legend
    .append("text")
    .attr("x", 160)
    .attr("y", 25)
    .text("Women (% of Workforce)");

  g.append("text")
    .attr("x", adjustedInnerWidth / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .attr("class", "chart-title")
    .text("Gender Distribution by Occupation");
}
