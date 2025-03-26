function drawOccupationHorizontalBarChart(occupationData) {
  clearChartArea();
  currentChartType = "bar";

  const sortedData = [...occupationData].sort((a, b) => b.menWage - a.menWage);

  // Increase left margin to accommodate longer occupation labels
  const adjustedMargin = { ...margin, left: margin.left + 100 };

  // Create the container group with adjusted margin
  g = svg
    .append("g")
    .attr(
      "transform",
      `translate(${adjustedMargin.left}, ${adjustedMargin.top})`
    );

  // Adjust inner width to account for increased left margin
  const adjustedInnerWidth = width - adjustedMargin.left - margin.right;

  // Add chart title
  g.append("text")
    .attr("class", "chart-title")
    .attr("x", adjustedInnerWidth / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .text("Income by Occupation and Gender");

  // Draw horizontal bar chart with adjusted parameters
  drawHorizontalBars(sortedData, adjustedMargin, adjustedInnerWidth);
}

function drawHorizontalBars(data, adjustedMargin, adjustedInnerWidth) {
  const occupations = data.map((d) => d.occupation);

  // Y-axis scale with reduced padding
  const y = d3
    .scaleBand()
    .domain(occupations)
    .range([0, innerHeight])
    .padding(0.1); // Reduced from 0.2 to 0.1 for tighter spacing

  // Y-axis with full occupation names
  const yAxis = g.append("g").call(d3.axisLeft(y));

  // Ensure full occupation names are visible
  yAxis
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-10px")
    .style("font-size", "10px")
    .call(wrap, adjustedMargin.left - 20); // Custom text wrapping

  // X-axis scale
  const maxWage = d3.max(data, (d) => Math.max(d.menWage, d.womenWage));
  const x = d3
    .scaleLinear()
    .domain([0, maxWage * 1.2]) // Extra padding to prevent clipping
    .range([0, adjustedInnerWidth - 50]); // Space for labels

  g.append("g")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(x).tickFormat((d) => `$${d / 1000}k`));

  // X-axis label
  g.append("text")
    .attr("x", adjustedInnerWidth / 2 - 50)
    .attr("y", innerHeight + 40)
    .attr("text-anchor", "middle")
    .text("Income ($)");

  // Men's bars (blue)
  g.selectAll(".men-bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "men-bar")
    .attr("y", (d) => y(d.occupation))
    .attr("x", 0)
    .attr("height", y.bandwidth() / 2 - 2) // Slightly reduced height with a small gap
    .attr("width", 0)
    .attr("fill", "#2563EB")
    .transition()
    .duration(800)
    .attr("width", (d) => x(d.menWage));

  // Women's bars (orange)
  g.selectAll(".women-bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "women-bar")
    .attr("y", (d) => y(d.occupation) + y.bandwidth() / 2 + 2) // Added small gap
    .attr("x", 0)
    .attr("height", y.bandwidth() / 2 - 2) // Slightly reduced height with a small gap
    .attr("width", 0)
    .attr("fill", "#F97316")
    .transition()
    .duration(800)
    .attr("width", (d) => x(d.womenWage));

  // Wage labels
  setTimeout(() => {
    g.selectAll(".men-wage-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "men-wage-label")
      .attr("x", (d) => {
        const barWidth = x(d.menWage);
        return barWidth > adjustedInnerWidth - 100
          ? barWidth - 40
          : barWidth + 5;
      })
      .attr("y", (d) => y(d.occupation) + y.bandwidth() / 4)
      .attr("dominant-baseline", "middle")
      .attr("font-size", "11px")
      .attr("fill", (d) =>
        x(d.menWage) > adjustedInnerWidth - 100 ? "white" : "black"
      )
      .attr("text-anchor", (d) =>
        x(d.menWage) > adjustedInnerWidth - 100 ? "end" : "start"
      )
      .text((d) => `$${Math.round(d.menWage / 1000)}k`);

    g.selectAll(".women-wage-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "women-wage-label")
      .attr("x", (d) => {
        const barWidth = x(d.womenWage);
        return barWidth > adjustedInnerWidth - 100
          ? barWidth - 40
          : barWidth + 5;
      })
      .attr("y", (d) => y(d.occupation) + (y.bandwidth() * 3) / 4)
      .attr("dominant-baseline", "middle")
      .attr("font-size", "11px")
      .attr("fill", (d) =>
        x(d.womenWage) > adjustedInnerWidth - 100 ? "white" : "black"
      )
      .attr("text-anchor", (d) =>
        x(d.womenWage) > adjustedInnerWidth - 100 ? "end" : "start"
      )
      .text((d) => `$${Math.round(d.womenWage / 1000)}k`);
  }, 1000);

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

function drawEducationHorizontalBarChart(educationData) {
  clearChartArea();
  currentChartType = "bar";

  // Predefined education level order
  const educationOrder = [
    "None",
    "Grade 1",
    "Grade 2",
    "Grade 3",
    "Grade 4",
    "Grade 5",
    "Grade 6",
    "Grade 7",
    "Grade 8",
    "Grade 9",
    "Grade 10",
    "Grade 11",
    "Grade 12",
    "Some College",
    "Associate",
    "Bachelors",
    "Advanced Degree",
  ];

  // Sort data by education level (using the same logic as occupation viz)
  const sortedData = [...educationData].sort(
    (a, b) =>
      educationOrder.indexOf(a.education) - educationOrder.indexOf(b.education)
  );

  // Increase left margin to accommodate longer education labels
  const adjustedMargin = { ...margin, left: margin.left + 100 };

  // Create the container group with adjusted margin
  g = svg
    .append("g")
    .attr(
      "transform",
      `translate(${adjustedMargin.left}, ${adjustedMargin.top})`
    );

  // Adjust inner width to account for increased left margin
  const adjustedInnerWidth = width - adjustedMargin.left - margin.right;

  // Add chart title
  g.append("text")
    .attr("class", "chart-title")
    .attr("x", adjustedInnerWidth / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .text("Income by Education Level and Gender");

  // Draw horizontal bar chart with adjusted parameters
  drawHorizontalEducationBars(sortedData, adjustedMargin, adjustedInnerWidth);
}

function drawHorizontalEducationBars(data, adjustedMargin, adjustedInnerWidth) {
  const educations = data.map((d) => d.education);

  // Y-axis scale with reduced padding
  const y = d3
    .scaleBand()
    .domain(educations)
    .range([0, innerHeight])
    .padding(0.1); // Reduced from 0.2 to 0.1 for tighter spacing

  // Y-axis with full education labels
  const yAxis = g.append("g").call(d3.axisLeft(y));

  // Ensure full education names are visible
  yAxis
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-10px")
    .style("font-size", "10px")
    .call(wrap, adjustedMargin.left - 20); // Custom text wrapping

  // X-axis scale
  const maxWage = d3.max(data, (d) => Math.max(d.menWage, d.womenWage));
  const x = d3
    .scaleLinear()
    .domain([0, maxWage * 1.2]) // Extra padding to prevent clipping
    .range([0, adjustedInnerWidth - 50]); // Space for labels

  g.append("g")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(x).tickFormat((d) => `$${d / 1000}k`));

  // X-axis label
  g.append("text")
    .attr("x", adjustedInnerWidth / 2 - 50)
    .attr("y", innerHeight + 40)
    .attr("text-anchor", "middle")
    .text("Income ($)");

  // Men's bars (blue)
  g.selectAll(".men-bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "men-bar")
    .attr("y", (d) => y(d.education))
    .attr("x", 0)
    .attr("height", y.bandwidth() / 2 - 2) // Slightly reduced height with a small gap
    .attr("width", 0)
    .attr("fill", "#2563EB")
    .transition()
    .duration(800)
    .attr("width", (d) => x(d.menWage));

  // Women's bars (orange)
  g.selectAll(".women-bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "women-bar")
    .attr("y", (d) => y(d.education) + y.bandwidth() / 2 + 2) // Added small gap
    .attr("x", 0)
    .attr("height", y.bandwidth() / 2 - 2) // Slightly reduced height with a small gap
    .attr("width", 0)
    .attr("fill", "#F97316")
    .transition()
    .duration(800)
    .attr("width", (d) => x(d.womenWage));

  // Wage labels
  setTimeout(() => {
    g.selectAll(".men-wage-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "men-wage-label")
      .attr("x", (d) => {
        const barWidth = x(d.menWage);
        return barWidth > adjustedInnerWidth - 100
          ? barWidth - 40
          : barWidth + 5;
      })
      .attr("y", (d) => y(d.education) + y.bandwidth() / 4)
      .attr("dominant-baseline", "middle")
      .attr("font-size", "11px")
      .attr("fill", (d) =>
        x(d.menWage) > adjustedInnerWidth - 100 ? "white" : "black"
      )
      .attr("text-anchor", (d) =>
        x(d.menWage) > adjustedInnerWidth - 100 ? "end" : "start"
      )
      .text((d) => `$${Math.round(d.menWage / 1000)}k`);

    g.selectAll(".women-wage-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "women-wage-label")
      .attr("x", (d) => {
        const barWidth = x(d.womenWage);
        return barWidth > adjustedInnerWidth - 100
          ? barWidth - 40
          : barWidth + 5;
      })
      .attr("y", (d) => y(d.education) + (y.bandwidth() * 3) / 4)
      .attr("dominant-baseline", "middle")
      .attr("font-size", "11px")
      .attr("fill", (d) =>
        x(d.womenWage) > adjustedInnerWidth - 100 ? "white" : "black"
      )
      .attr("text-anchor", (d) =>
        x(d.womenWage) > adjustedInnerWidth - 100 ? "end" : "start"
      )
      .text((d) => `$${Math.round(d.womenWage / 1000)}k`);
  }, 1000);

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
    let tspan = text
      .text(null)
      .append("tspan")
      .attr("x", -10)
      .attr("y", y)
      .attr("dy", dy + "em");

    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text
          .append("tspan")
          .attr("x", -10)
          .attr("y", y)
          .attr("dy", ++lineNumber * lineHeight + dy + "em")
          .text(word);
      }
    }
  });
}
