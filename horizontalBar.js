function drawOccupationHorizontalBarChart(occupationData) {
  clearChartArea();
  currentChartType = "bar";
  const sortedData = [...occupationData].sort((a, b) => b.menWage - a.menWage);
  const adjustedMargin = { ...margin, left: margin.left + 100 }; // Assuming margin is global
  const adjustedInnerWidth = width - adjustedMargin.left - margin.right; // Assuming width is global
  g = svg.append("g").attr("transform", `translate(${adjustedMargin.left}, ${adjustedMargin.top})`);
  g.append("text").attr("class", "chart-title").attr("x", adjustedInnerWidth / 2).attr("y", -20).attr("text-anchor", "middle").text("Income by Occupation and Gender");
  drawHorizontalBars(sortedData, adjustedMargin, adjustedInnerWidth, 'occupation');
}

function drawEducationHorizontalBarChart(educationData) {
  clearChartArea();
  currentChartType = "bar";
  const educationOrder = [ "None", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12", "Some College", "Associate", "Bachelors", "Advanced Degree", ];
  const sortedData = [...educationData].sort( (a, b) => educationOrder.indexOf(a.education) - educationOrder.indexOf(b.education) );
  const adjustedMargin = { ...margin, left: margin.left + 100 }; // Assuming margin is global
  const adjustedInnerWidth = width - adjustedMargin.left - margin.right; // Assuming width is global
  g = svg.append("g").attr("transform", `translate(${adjustedMargin.left}, ${adjustedMargin.top})`);
  g.append("text").attr("class", "chart-title").attr("x", adjustedInnerWidth / 2).attr("y", -20).attr("text-anchor", "middle").text("Income by Education Level and Gender");
  drawHorizontalBars(sortedData, adjustedMargin, adjustedInnerWidth, 'education');
}


// Combined function to draw horizontal bars
function drawHorizontalBars(data, adjustedMargin, adjustedInnerWidth, dataType) {
  // Select Tooltip
  const tooltip = d3.select("#tooltip");
  if (tooltip.empty()) { console.error("Tooltip element #tooltip not found."); return; }

  const categoryKey = dataType === 'occupation' ? 'occupation' : 'education';
  const categories = data.map((d) => d[categoryKey]);

  // Y-axis scale with increased padding (0.3 instead of 0.1)
  const y = d3.scaleBand()
    .domain(categories)
    .range([0, innerHeight])
    .padding(0.3); // Increased padding for better separation

  // Y-axis draw and wrap
  const yAxis = g.append("g").call(d3.axisLeft(y));
  yAxis.selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-10px")
    .style("font-size", "10px")
    .call(wrap, adjustedMargin.left - 20); // Use wrap function

  // X-axis scale
  const maxWage = d3.max(data, (d) => Math.max(d.menWage, d.womenWage));
  const x = d3.scaleLinear()
    .domain([0, maxWage * 1.2])
    .range([0, adjustedInnerWidth - 50]);

  // X-axis draw
  g.append("g")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(x).tickFormat((d) => `$${d / 1000}k`));

  // X-axis label
  g.append("text")
    .attr("x", adjustedInnerWidth / 2 - 50)
    .attr("y", innerHeight + 40)
    .attr("text-anchor", "middle")
    .text("Annual Income ($)");

  // Add Y-axis label for clarity
  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -adjustedMargin.left + 20)
    .attr("x", -innerHeight / 2)
    .attr("text-anchor", "middle")
    .text(dataType === 'occupation' ? "Occupation Type" : "Education Level");

  // --- Tooltip Event Handlers ---
  const mousemove = function(event, d) { // Generic mousemove
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

  const mouseout = function(event, d) { // Generic mouseout
    tooltip.classed('visible', false);
  };

  // Specific mouseover for Men
  const mouseoverMen = function(event, d) {
    tooltip
      .html(
        `<strong>${dataType === 'occupation' ? 'Occupation' : 'Education'}:</strong> ${d[categoryKey]}<br/>` +
        `<strong>Men's Income:</strong> $${d.menWage.toLocaleString()}`
      )
      .classed('visible', true);
  };

   // Specific mouseover for Women
   const mouseoverWomen = function(event, d) {
    tooltip
      .html(
        `<strong>${dataType === 'occupation' ? 'Occupation' : 'Education'}:</strong> ${d[categoryKey]}<br/>` +
        `<strong>Women's Income:</strong> $${d.womenWage.toLocaleString()}`
      )
      .classed('visible', true);
  };
  // --- End Tooltip Handlers ---

  // Men's bars with updated colors
  g.selectAll(".men-bar")
    .data(data)
    .join("rect")
    .attr("class", "bar men-bar")
    .attr("y", (d) => y(d[categoryKey]))
    .attr("x", 0)
    .attr("height", y.bandwidth() / 2 - 2)
    .attr("width", 0)
    .attr("fill", CHART_COLORS.PRIMARY_1)  // Updated color
    .style("cursor", "pointer")
    .on("mouseover", mouseoverMen)
    .on("mousemove", mousemove)
    .on("mouseout", mouseout)
    .transition()
    .duration(800)
    .attr("width", (d) => x(d.menWage));

  // Women's bars with updated colors
  g.selectAll(".women-bar")
    .data(data)
    .join("rect")
    .attr("class", "bar women-bar")
    .attr("y", (d) => y(d[categoryKey]) + y.bandwidth() / 2 + 2)
    .attr("x", 0)
    .attr("height", y.bandwidth() / 2 - 2)
    .attr("width", 0)
    .attr("fill", CHART_COLORS.PRIMARY_2)  // Updated color
    .style("cursor", "pointer")
    .on("mouseover", mouseoverWomen)
    .on("mousemove", mousemove)
    .on("mouseout", mouseout)
    .transition()
    .duration(800)
    .attr("width", (d) => x(d.womenWage));

  // Wage labels (keep setTimeout)
  setTimeout(() => {
    g.selectAll(".men-wage-label")
      .data(data)
      .join("text")
      .attr("class", "men-wage-label")
      .attr("x", (d) => { 
        const barWidth = x(d.menWage); 
        return barWidth > adjustedInnerWidth - 100 ? barWidth - 40 : barWidth + 5; 
      })
      .attr("y", (d) => y(d[categoryKey]) + y.bandwidth() / 4)
      .attr("dominant-baseline", "middle")
      .attr("font-size", "11px")
      .attr("fill", (d) => x(d.menWage) > adjustedInnerWidth - 100 ? "white" : "black")
      .attr("text-anchor", (d) => x(d.menWage) > adjustedInnerWidth - 100 ? "end" : "start")
      .text((d) => `$${Math.round(d.menWage / 1000)}k`);
    
    g.selectAll(".women-wage-label")
      .data(data)
      .join("text")
      .attr("class", "women-wage-label")
      .attr("x", (d) => { 
        const barWidth = x(d.womenWage); 
        return barWidth > adjustedInnerWidth - 100 ? barWidth - 40 : barWidth + 5; 
      })
      .attr("y", (d) => y(d[categoryKey]) + (y.bandwidth() * 3) / 4)
      .attr("dominant-baseline", "middle")
      .attr("font-size", "11px")
      .attr("fill", (d) => x(d.womenWage) > adjustedInnerWidth - 100 ? "white" : "black")
      .attr("text-anchor", (d) => x(d.womenWage) > adjustedInnerWidth - 100 ? "end" : "start")
      .text((d) => `$${Math.round(d.womenWage / 1000)}k`);
  }, 1000);

  // Updated legend with new colors and better labels
  const legend = svg.append("g")
    .attr("transform", `translate(${adjustedMargin.left + adjustedInnerWidth / 4}, ${innerHeight + margin.bottom + 10})`);
  
  // Men legend item with circle
  legend.append("rect")
    .attr("x", 0)
    .attr("y", 6)
    .attr("width", 12)
    .attr("height", 12)
    .attr("fill", CHART_COLORS.PRIMARY_1);
  legend.append("text")
    .attr("x", 20)
    .attr("y", 15)
    .text("Men's Income");
  
  // Women legend item with circle
  legend.append("rect")
    .attr("x", 140)
    .attr("y", 6)
    .attr("width", 12)
    .attr("height", 12)
    .attr("fill", CHART_COLORS.PRIMARY_2);
  legend.append("text")
    .attr("x", 160)
    .attr("y", 15)
    .text("Women's Income");
}

// Text wrapping function (ensure it's present)
function wrap(text, width) {
  text.each(function () {
    const text = d3.select(this); const words = text.text().split(/\s+/).reverse();
    let word; let line = []; let lineNumber = 0; const lineHeight = 1.1; // ems
    const y = text.attr("y"); const dy = parseFloat(text.attr("dy") || 0);
    let tspan = text.text(null).append("tspan").attr("x", -10).attr("y", y).attr("dy", dy + "em");
    while ((word = words.pop())) {
      line.push(word); tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width && line.length > 1) {
        line.pop(); tspan.text(line.join(" ")); line = [word];
        tspan = text.append("tspan").attr("x", -10).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}