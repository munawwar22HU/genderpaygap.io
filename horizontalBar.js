function drawOccupationHorizontalBarChart(occupationData) {
  clearChartArea();
  currentChartType = "bar";

  const sortedData = [...occupationData].sort((a, b) => b.menWage - a.menWage);

  // Adjust margins and width
  const adjustedMargin = { ...margin, left: margin.left + 100 };
  const adjustedInnerWidth = width - adjustedMargin.left - margin.right;

  // Create the container group
  g = svg
    .append("g")
    .attr(
      "transform",
      `translate(${adjustedMargin.left}, ${adjustedMargin.top})`
    );

  // Add chart title
  g.append("text")
    .attr("class", "chart-title")
    .attr("x", adjustedInnerWidth / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .text("Income by Occupation and Gender");

  // Draw horizontal bar chart
  drawHorizontalBars(sortedData, adjustedMargin, adjustedInnerWidth, 'occupation');
}

function drawEducationHorizontalBarChart(educationData) {
  clearChartArea();
  currentChartType = "bar";

  // Order and sort data
  const educationOrder = [ "None", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12", "Some College", "Associate", "Bachelors", "Advanced Degree", ];
  const sortedData = [...educationData].sort( (a, b) => educationOrder.indexOf(a.education) - educationOrder.indexOf(b.education) );

  // Adjust margins and width
  const adjustedMargin = { ...margin, left: margin.left + 100 };
  const adjustedInnerWidth = width - adjustedMargin.left - margin.right;

  // Create the container group
  g = svg
    .append("g")
    .attr(
      "transform",
      `translate(${adjustedMargin.left}, ${adjustedMargin.top})`
    );

  // Add chart title
  g.append("text")
    .attr("class", "chart-title")
    .attr("x", adjustedInnerWidth / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .text("Income by Education Level and Gender");

  // Draw horizontal bar chart
  drawHorizontalBars(sortedData, adjustedMargin, adjustedInnerWidth, 'education');
}


// Combined function to draw horizontal bars
function drawHorizontalBars(data, adjustedMargin, adjustedInnerWidth, dataType) {
  // Select Tooltip
  const tooltip = d3.select("#tooltip");

  const categoryKey = dataType === 'occupation' ? 'occupation' : 'education';
  const categories = data.map((d) => d[categoryKey]);

  // Y-axis scale
  const y = d3.scaleBand().domain(categories).range([0, innerHeight]).padding(0.1);

  // Y-axis draw and wrap
  const yAxis = g.append("g").call(d3.axisLeft(y));
  yAxis.selectAll("text").style("text-anchor", "end").attr("dx", "-10px").style("font-size", "10px").call(wrap, adjustedMargin.left - 20);

  // X-axis scale
  const maxWage = d3.max(data, (d) => Math.max(d.menWage, d.womenWage));
  const x = d3.scaleLinear().domain([0, maxWage * 1.2]).range([0, adjustedInnerWidth - 50]);

  // X-axis draw
  g.append("g").attr("transform", `translate(0, ${innerHeight})`).call(d3.axisBottom(x).tickFormat((d) => `$${d / 1000}k`));

  // X-axis label
  g.append("text").attr("x", adjustedInnerWidth / 2 - 50).attr("y", innerHeight + 40).attr("text-anchor", "middle").text("Income ($)");

  // --- Tooltip Event Handlers ---
  const mouseover = function(event, d) {
    tooltip
      .html(
        `<strong>${dataType === 'occupation' ? 'Occupation' : 'Education'}:</strong> ${d[categoryKey]}<br/>` +
        `<strong>Men's Wage:</strong> $${d.menWage.toLocaleString()}<br/>` +
        `<strong>Women's Wage:</strong> $${d.womenWage.toLocaleString()}<br/>` +
        `<strong>Gap:</strong> ${d.gapPercentage}%`
      )
      .classed('visible', true);
    //d3.select(this).style("opacity", 0.7); // Use CSS :hover
  };

  const mousemove = function(event, d) {
    tooltip
      .style("left", (event.pageX + 15) + "px")
      .style("top", (event.pageY - 10) + "px");
  };

  const mouseout = function(event, d) {
    tooltip.classed('visible', false);
    //d3.select(this).style("opacity", 1); // Use CSS :hover
  };
  // --- End Tooltip Handlers ---

  // Men's bars
  g.selectAll(".men-bar")
    .data(data)
    .join("rect") // Use .join()
    .attr("class", "bar men-bar") // Add "bar" class
    .attr("y", (d) => y(d[categoryKey]))
    .attr("x", 0)
    .attr("height", y.bandwidth() / 2 - 2)
    .attr("width", 0) // Start for animation
    .attr("fill", "#2563EB")
    .style("cursor", "pointer")
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseout", mouseout)
    .transition()
    .duration(800)
    .attr("width", (d) => x(d.menWage));

  // Women's bars
  g.selectAll(".women-bar")
    .data(data)
    .join("rect") // Use .join()
    .attr("class", "bar women-bar") // Add "bar" class
    .attr("y", (d) => y(d[categoryKey]) + y.bandwidth() / 2 + 2)
    .attr("x", 0)
    .attr("height", y.bandwidth() / 2 - 2)
    .attr("width", 0) // Start for animation
    .attr("fill", "#DB2777") // Pink color
    .style("cursor", "pointer")
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseout", mouseout)
    .transition()
    .duration(800)
    .attr("width", (d) => x(d.womenWage));

  // Wage labels (keep setTimeout)
  setTimeout(() => {
    g.selectAll(".men-wage-label").data(data).join("text").attr("class", "men-wage-label").attr("x", (d) => { const barWidth = x(d.menWage); return barWidth > adjustedInnerWidth - 100 ? barWidth - 40 : barWidth + 5; }).attr("y", (d) => y(d[categoryKey]) + y.bandwidth() / 4).attr("dominant-baseline", "middle").attr("font-size", "11px").attr("fill", (d) => x(d.menWage) > adjustedInnerWidth - 100 ? "white" : "black").attr("text-anchor", (d) => x(d.menWage) > adjustedInnerWidth - 100 ? "end" : "start").text((d) => `$${Math.round(d.menWage / 1000)}k`);
    g.selectAll(".women-wage-label").data(data).join("text").attr("class", "women-wage-label").attr("x", (d) => { const barWidth = x(d.womenWage); return barWidth > adjustedInnerWidth - 100 ? barWidth - 40 : barWidth + 5; }).attr("y", (d) => y(d[categoryKey]) + (y.bandwidth() * 3) / 4).attr("dominant-baseline", "middle").attr("font-size", "11px").attr("fill", (d) => x(d.womenWage) > adjustedInnerWidth - 100 ? "white" : "black").attr("text-anchor", (d) => x(d.womenWage) > adjustedInnerWidth - 100 ? "end" : "start").text((d) => `$${Math.round(d.womenWage / 1000)}k`);
  }, 1000);


  // Legend
  const legend = svg.append("g").attr("transform", `translate(${adjustedMargin.left + adjustedInnerWidth / 4}, ${innerHeight + margin.bottom + 10})`);
  legend.append("circle").attr("cx", 0).attr("cy", 10).attr("r", 6).attr("fill", "#2563EB");
  legend.append("text").attr("x", 15).attr("y", 15).text("Men's Wage");
  legend.append("circle").attr("cx", 120).attr("cy", 10).attr("r", 6).attr("fill", "#DB2777");
  legend.append("text").attr("x", 135).attr("y", 15).text("Women's Wage");
}

// Text wrapping function
function wrap(text, width) {
  text.each(function () {
    const text = d3.select(this);
    const words = text.text().split(/\s+/).reverse();
    let word;
    let line = [];
    let lineNumber = 0;
    const lineHeight = 1.1; // ems
    const y = text.attr("y");
    const dy = parseFloat(text.attr("dy") || 0);
    let tspan = text.text(null).append("tspan").attr("x", -10).attr("y", y).attr("dy", dy + "em"); // Use existing x/y/dy

    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width && line.length > 1) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", -10).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word); // Increment dy for new line
      }
    }
  });
}
