// zoomFeatures.js
// Functionality to enable zooming on charts

// Store references to the original data and scales for reset operations
let originalZoomState = {
  yearlyData: null,
  xDomain: null,
  yDomain: null,
  currentZoom: false,
};

// Track if zoom controls are minimized
let zoomControlsMinimized = false;

// Common function to add zoom controls to any chart
function addZoomControls() {
  // Remove any existing zoom controls
  d3.select("#zoom-controls").remove();

  // Create zoom control panel
  const zoomControls = d3
    .select(".right-column")
    .append("div")
    .attr("id", "zoom-controls")
    .attr("class", "zoom-controls");

  // Add header bar with title and minimize button
  const headerBar = zoomControls
    .append("div")
    .attr("class", "zoom-controls-header");

  headerBar.append("h3").attr("class", "zoom-title").text("Zoom Controls");

  headerBar
    .append("button")
    .attr("class", "minimize-btn")
    .html(zoomControlsMinimized ? "+" : "−") // Unicode minus sign (or plus if minimized)
    .on("click", toggleZoomControlsVisibility);

  // Create content container (can be hidden)
  const contentContainer = zoomControls
    .append("div")
    .attr("id", "zoom-controls-content")
    .attr("class", "zoom-controls-content")
    .style("display", zoomControlsMinimized ? "none" : "block");

  // Add zoom reset button (always present)
  const resetBtn = contentContainer
    .append("button")
    .attr("id", "reset-zoom")
    .attr("class", "zoom-btn")
    .text("Reset View")
    .style("display", originalZoomState.currentZoom ? "inline-block" : "none")
    .on("click", resetZoom);

  // Add chart-specific zoom controls based on chart type
  if (currentChartType === "line") {
    addTimeRangeControls(contentContainer);
  } else if (currentChartType === "bar") {
    addFilterControls(contentContainer);
  } else if (currentChartType === "box") {
    addBoxPlotFilterControls(contentContainer);
  }
}

// Toggle visibility of zoom controls content
function toggleZoomControlsVisibility() {
  zoomControlsMinimized = !zoomControlsMinimized;

  // Update content visibility
  const content = d3.select("#zoom-controls-content");
  content.style("display", zoomControlsMinimized ? "none" : "block");

  // Update button text
  d3.select(".minimize-btn").html(zoomControlsMinimized ? "+" : "−");
}

// Add time range selector for line charts
function addTimeRangeControls(container) {
  const timeControls = container.append("div").attr("class", "time-controls");

  // Get the available years from the data
  const years = [...new Set(yearlyData.map((d) => d.year))].sort(
    (a, b) => a - b
  );
  const minYear = years[0];
  const maxYear = years[years.length - 1];

  // Add title
  timeControls.append("h3").text("Select Time Period");

  // Add range sliders
  const sliderContainer = timeControls
    .append("div")
    .attr("class", "slider-container");

  // Start year selection
  sliderContainer
    .append("label")
    .attr("for", "start-year")
    .text("Start Year: ");

  const startYearDisplay = sliderContainer
    .append("span")
    .attr("id", "start-year-display")
    .text(minYear);

  sliderContainer
    .append("input")
    .attr("type", "range")
    .attr("id", "start-year")
    .attr("min", minYear)
    .attr("max", maxYear)
    .attr("value", minYear)
    .attr("step", 1)
    .on("input", function () {
      const value = +this.value;
      startYearDisplay.text(value);
      // Ensure end year is not less than start year
      const endYearSlider = d3.select("#end-year");
      if (+endYearSlider.property("value") < value) {
        endYearSlider.property("value", value);
        d3.select("#end-year-display").text(value);
      }

      // Apply filter immediately
      applyTimeZoom();
    });

  // End year selection
  sliderContainer.append("br");
  sliderContainer.append("label").attr("for", "end-year").text("End Year: ");

  const endYearDisplay = sliderContainer
    .append("span")
    .attr("id", "end-year-display")
    .text(maxYear);

  sliderContainer
    .append("input")
    .attr("type", "range")
    .attr("id", "end-year")
    .attr("min", minYear)
    .attr("max", maxYear)
    .attr("value", maxYear)
    .attr("step", 1)
    .on("input", function () {
      const value = +this.value;
      endYearDisplay.text(value);
      // Ensure start year is not greater than end year
      const startYearSlider = d3.select("#start-year");
      if (+startYearSlider.property("value") > value) {
        startYearSlider.property("value", value);
        d3.select("#start-year-display").text(value);
      }

      // Apply filter immediately
      applyTimeZoom();
    });

  // We no longer need the Apply button since filtering is immediate
}

// Apply zoom on time period for line charts
function applyTimeZoom() {
  const startYear = +d3.select("#start-year").property("value");
  const endYear = +d3.select("#end-year").property("value");

  // Save original state if this is the first zoom
  if (!originalZoomState.currentZoom) {
    originalZoomState.yearlyData = [...yearlyData];
    originalZoomState.xDomain = xScale.domain();
    originalZoomState.yDomain = yScale.domain();
    originalZoomState.currentZoom = true;
  }

  // Filter data by selected years
  const filteredData = originalZoomState.yearlyData.filter(
    (d) => d.year >= startYear && d.year <= endYear
  );

  // Update the chart with filtered data
  clearChartArea();
  yearlyData = filteredData;
  drawLineChart(filteredData);

  // Show reset button
  d3.select("#reset-zoom").style("display", "inline-block");
}

// Get ordered categories for different chart types
function getOrderedCategories(dataSource) {
  // Define proper education order (from lowest to highest)
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

  // Check which type of data we're dealing with
  if (dataSource[0] && dataSource[0].education) {
    // For education data, return ordered categories
    return educationOrder.filter((level) =>
      dataSource.some((d) => d.education === level)
    );
  } else if (dataSource[0] && dataSource[0].occupation) {
    // For occupation data, sort by the wage values to match visualization order
    const sortedData = [...dataSource].sort((a, b) => b.menWage - a.menWage);
    return sortedData.map((d) => d.occupation);
  } else if (dataSource[0] && dataSource[0].race) {
    // For race data, sort by the wage values to match visualization order
    const sortedData = [...dataSource].sort((a, b) => b.menWage - a.menWage);
    return sortedData.map((d) => d.race);
  } else if (dataSource[0] && dataSource[0].ageGroup) {
    // For age data, maintain natural order
    return [...new Set(dataSource.map((d) => d.ageGroup))];
  }

  return [];
}

// Add demographic filter controls for bar charts
function addFilterControls(container) {
  const filterControls = container
    .append("div")
    .attr("class", "filter-controls");

  // Add title
  filterControls.append("h3").text("Filter Categories");

  // Get categories based on chart type
  let categories = [];
  let dataSource = [];

  if (currentChartType === "bar") {
    // Determine which data we're currently using
    if (g.selectAll(".men-bar").data()[0]?.ageGroup) {
      dataSource = ageData;
    } else if (g.selectAll(".men-bar").data()[0]?.race) {
      dataSource = raceData;
    } else if (g.selectAll(".men-bar").data()[0]?.occupation) {
      dataSource = occupationData;
    } else if (g.selectAll(".men-bar").data()[0]?.education) {
      dataSource = educationData;
    }

    // Get ordered categories based on the data source
    categories = getOrderedCategories(dataSource);
  }

  // Only continue if we have categories
  if (categories.length > 0) {
    // Create checkboxes for each category
    const checkboxContainer = filterControls
      .append("div")
      .attr("class", "checkbox-container");

    // Add "Select All" checkbox
    const selectAllDiv = checkboxContainer
      .append("div")
      .attr("class", "checkbox-item");

    selectAllDiv
      .append("input")
      .attr("type", "checkbox")
      .attr("id", "select-all")
      .attr("checked", true)
      .on("change", function () {
        const checked = this.checked;
        checkboxContainer
          .selectAll(".category-checkbox")
          .property("checked", checked);

        // Apply filter immediately when "Select All" changes
        applyDemographicFilter(dataSource);
      });

    selectAllDiv.append("label").attr("for", "select-all").text("Select All");

    // Add individual category checkboxes in the correct order
    categories.forEach((category) => {
      const div = checkboxContainer
        .append("div")
        .attr("class", "checkbox-item");

      div
        .append("input")
        .attr("type", "checkbox")
        .attr("id", `category-${category.replace(/\s+/g, "-").toLowerCase()}`)
        .attr("class", "category-checkbox")
        .attr("value", category)
        .attr("checked", true)
        .on("change", function () {
          // Update "Select All" checkbox
          const allChecked = checkboxContainer
            .selectAll(".category-checkbox")
            .nodes()
            .every((node) => node.checked);
          d3.select("#select-all").property("checked", allChecked);

          // Apply filter immediately when any checkbox changes
          applyDemographicFilter(dataSource);
        });

      div
        .append("label")
        .attr("for", `category-${category.replace(/\s+/g, "-").toLowerCase()}`)
        .text(category);
    });

    // Apply button is no longer needed since filtering is immediate
  }
}

// Updated applyDemographicFilter function to handle all chart types including income and gender
function applyDemographicFilter(dataSource) {
  // Get selected categories
  const selectedCategories = d3
    .selectAll(".category-checkbox:checked")
    .nodes()
    .map((node) => node.value);

  // Save original state if this is the first zoom
  if (!originalZoomState.currentZoom) {
    if (dataSource === occupationData) {
      originalZoomState.occupationData = [...occupationData];
    } else if (dataSource === ageData) {
      originalZoomState.ageData = [...ageData];
    } else if (dataSource === raceData) {
      originalZoomState.raceData = [...raceData];
    } else if (dataSource === educationData) {
      originalZoomState.educationData = [...educationData];
    } else if (dataSource === incomeData) {
      originalZoomState.incomeData = [...incomeData];
    } else if (dataSource === genderData) {
      originalZoomState.genderData = [...genderData];
    }
    originalZoomState.currentZoom = true;
  }

  // Handle different chart types

  // For occupation chart
  if (dataSource === occupationData) {
    // Try to find all occupation-related elements by their data attributes
    d3.selectAll("g").each(function (d) {
      if (d && d.occupation) {
        const visible = selectedCategories.includes(d.occupation);
        d3.select(this).style("display", visible ? null : "none");
      }
    });

    // Try directly with bars too
    d3.selectAll("rect").each(function (d) {
      if (d && d.occupation) {
        const visible = selectedCategories.includes(d.occupation);
        // If the rect is in a group, hide the group, otherwise hide the rect
        const element =
          this.parentNode.tagName === "g" ? this.parentNode : this;
        d3.select(element).style("display", visible ? null : "none");
      }
    });
  }
  // For age chart
  else if (dataSource === ageData) {
    d3.selectAll("rect").each(function (d) {
      if (d && d.ageGroup) {
        const visible = selectedCategories.includes(d.ageGroup);
        d3.select(this).style("display", visible ? null : "none");
      }
    });
  }
  // For race chart
  else if (dataSource === raceData) {
    d3.selectAll("rect").each(function (d) {
      if (d && d.race) {
        const visible = selectedCategories.includes(d.race);
        d3.select(this).style("display", visible ? null : "none");
      }
    });
  }
  // For education chart
  else if (dataSource === educationData) {
    d3.selectAll("g").each(function (d) {
      if (d && d.education) {
        const visible = selectedCategories.includes(d.education);
        d3.select(this).style("display", visible ? null : "none");
      }
    });

    d3.selectAll("rect").each(function (d) {
      if (d && d.education) {
        const visible = selectedCategories.includes(d.education);
        const element =
          this.parentNode.tagName === "g" ? this.parentNode : this;
        d3.select(element).style("display", visible ? null : "none");
      }
    });
  }
  // For income chart
  else if (dataSource === incomeData) {
    // Assuming income data has an "incomeGroup" or similar property
    d3.selectAll("rect, path").each(function (d) {
      if (d && (d.incomeGroup || d.income)) {
        const categoryKey = d.incomeGroup ? "incomeGroup" : "income";
        const visible = selectedCategories.includes(d[categoryKey]);
        d3.select(this).style("display", visible ? null : "none");
      }
    });

    // Also try with groups
    d3.selectAll("g").each(function (d) {
      if (d && (d.incomeGroup || d.income)) {
        const categoryKey = d.incomeGroup ? "incomeGroup" : "income";
        const visible = selectedCategories.includes(d[categoryKey]);
        d3.select(this).style("display", visible ? null : "none");
      }
    });
  }
  // For gender chart
  else if (dataSource === genderData) {
    // Assuming gender data has a "gender" property
    d3.selectAll("rect, path").each(function (d) {
      if (d && d.gender) {
        const visible = selectedCategories.includes(d.gender);
        d3.select(this).style("display", visible ? null : "none");
      }
    });

    // Also try with groups
    d3.selectAll("g").each(function (d) {
      if (d && d.gender) {
        const visible = selectedCategories.includes(d.gender);
        d3.select(this).style("display", visible ? null : "none");
      }
    });
  }

  // Show reset button
  d3.select("#reset-zoom").style("display", "inline-block");
}
// // Replace the applyDemographicFilter function with this version
// function applyDemographicFilter(dataSource) {
//   // Get selected categories
//   const selectedCategories = d3
//     .selectAll(".category-checkbox:checked")
//     .nodes()
//     .map((node) => node.value);

//   // Save original state if this is the first zoom
//   if (!originalZoomState.currentZoom) {
//     if (dataSource === ageData) {
//       originalZoomState.ageData = [...ageData];
//     } else if (dataSource === raceData) {
//       originalZoomState.raceData = [...raceData];
//     } else if (dataSource === occupationData) {
//       originalZoomState.occupationData = [...occupationData];
//     } else if (dataSource === educationData) {
//       originalZoomState.educationData = [...educationData];
//     }
//     originalZoomState.currentZoom = true;
//   }

//   // Instead of redrawing chart, just hide/show bars based on selection
//   if (dataSource === ageData || dataSource === raceData) {
//     // For vertical bar charts (age, race)
//     d3.selectAll(".men-bar, .women-bar").each(function (d) {
//       let categoryProperty;
//       if (d.ageGroup) categoryProperty = "ageGroup";
//       else if (d.race) categoryProperty = "race";

//       if (categoryProperty) {
//         const visible = selectedCategories.includes(d[categoryProperty]);
//         d3.select(this).style("display", visible ? null : "none");
//       }
//     });
//   } else {
//     // For horizontal bar charts (occupation, education)
//     d3.selectAll(".bar-group").each(function (d) {
//       let categoryProperty;
//       if (d && d.occupation) categoryProperty = "occupation";
//       else if (d && d.education) categoryProperty = "education";

//       if (categoryProperty && d) {
//         const visible = selectedCategories.includes(d[categoryProperty]);
//         d3.select(this).style("display", visible ? null : "none");
//       }
//     });
//   }

//   // Show reset button
//   d3.select("#reset-zoom").style("display", "inline-block");
// }
// Add filter controls for box plot
function addBoxPlotFilterControls(container) {
  const filterControls = container
    .append("div")
    .attr("class", "filter-controls");

  // Add title
  filterControls.append("h3").text("Filter Employment Types");

  // Get categories
  const employmentTypes = [
    ...new Set(
      hoursData.map((d) => {
        // Extract employment type (part-time/full-time)
        const parts = d.category.split(" ");
        return parts[0]; // First part is employment type
      })
    ),
  ];

  // Create radio buttons for employment type
  const radioContainer = filterControls
    .append("div")
    .attr("class", "radio-container");

  // Add "All" option
  const allDiv = radioContainer.append("div").attr("class", "radio-item");

  allDiv
    .append("input")
    .attr("type", "radio")
    .attr("id", "filter-all")
    .attr("name", "employment-filter")
    .attr("value", "all")
    .attr("checked", true)
    .on("change", function () {
      // Apply filter immediately when radio button changes
      if (this.checked) {
        applyBoxPlotFilter();
      }
    });

  allDiv.append("label").attr("for", "filter-all").text("All Types");

  // Add individual employment type options
  employmentTypes.forEach((type) => {
    const div = radioContainer.append("div").attr("class", "radio-item");

    div
      .append("input")
      .attr("type", "radio")
      .attr("id", `filter-${type.toLowerCase()}`)
      .attr("name", "employment-filter")
      .attr("value", type)
      .on("change", function () {
        // Apply filter immediately when radio button changes
        if (this.checked) {
          applyBoxPlotFilter();
        }
      });

    div.append("label").attr("for", `filter-${type.toLowerCase()}`).text(type);
  });

  // Apply button is no longer needed since filtering is immediate
}

// Apply filter to box plot
function applyBoxPlotFilter() {
  const selectedType = d3
    .select('input[name="employment-filter"]:checked')
    .property("value");

  // Save original state if this is the first zoom
  if (!originalZoomState.currentZoom) {
    originalZoomState.hoursData = [...hoursData];
    originalZoomState.currentZoom = true;
  }

  // Filter data by selected employment type
  let filteredData;
  if (selectedType === "all") {
    filteredData = originalZoomState.hoursData;
  } else {
    filteredData = originalZoomState.hoursData.filter((d) =>
      d.category.startsWith(selectedType)
    );
  }

  // Redraw chart with filtered data
  clearChartArea();
  hoursData = filteredData;
  drawHoursBoxPlot(filteredData);

  // Show reset button
  d3.select("#reset-zoom").style("display", "inline-block");
}

// Reset zoom to original data
function resetZoom() {
  if (!originalZoomState.currentZoom) return;

  // Reset data to original state
  if (originalZoomState.yearlyData)
    yearlyData = [...originalZoomState.yearlyData];
  if (originalZoomState.ageData) ageData = [...originalZoomState.ageData];
  if (originalZoomState.raceData) raceData = [...originalZoomState.raceData];
  if (originalZoomState.occupationData)
    occupationData = [...originalZoomState.occupationData];
  if (originalZoomState.educationData)
    educationData = [...originalZoomState.educationData];
  if (originalZoomState.hoursData) hoursData = [...originalZoomState.hoursData];

  // Redraw current chart
  clearChartArea();
  keyframes[keyframeIndex].svgUpdate();

  // Hide reset button
  d3.select("#reset-zoom").style("display", "none");

  // Reset zoom state
  originalZoomState.currentZoom = false;
}

// When navigating away or clearing chart, remember minimize state
function saveZoomControlsState() {
  // Only save state if we have zoom controls
  const zoomControls = d3.select("#zoom-controls");
  if (!zoomControls.empty()) {
    zoomControlsMinimized =
      d3.select("#zoom-controls-content").style("display") === "none";
  }
}

// Modify the existing chart drawing functions to call addZoomControls after drawing
// These wrappers will replace the original functions

// Wrap the drawLineChart function
const originalDrawLineChart = drawLineChart;
drawLineChart = function (data) {
  originalDrawLineChart(data);
  addZoomControls();
};

// Wrap drawAgeVerticalBarChart
const originalDrawAgeVerticalBarChart = drawAgeVerticalBarChart;
drawAgeVerticalBarChart = function (data) {
  originalDrawAgeVerticalBarChart(data);
  addZoomControls();
};

// Wrap drawRaceVerticalBarChart
const originalDrawRaceVerticalBarChart = drawRaceVerticalBarChart;
drawRaceVerticalBarChart = function (data) {
  originalDrawRaceVerticalBarChart(data);
  addZoomControls();
};

// Wrap drawOccupationHorizontalBarChart
const originalDrawOccupationHorizontalBarChart =
  drawOccupationHorizontalBarChart;
drawOccupationHorizontalBarChart = function (data) {
  originalDrawOccupationHorizontalBarChart(data);
  addZoomControls();
};

// Wrap drawEducationHorizontalBarChart
const originalDrawEducationHorizontalBarChart = drawEducationHorizontalBarChart;
drawEducationHorizontalBarChart = function (data) {
  originalDrawEducationHorizontalBarChart(data);
  addZoomControls();
};

// Wrap drawOccupationStackedBarChart
const originalDrawOccupationStackedBarChart = drawOccupationStackedBarChart;
drawOccupationStackedBarChart = function (data) {
  originalDrawOccupationStackedBarChart(data);
  addZoomControls();
};

// Wrap drawHoursBoxPlot
const originalDrawHoursBoxPlot = drawHoursBoxPlot;
drawHoursBoxPlot = function (data) {
  originalDrawHoursBoxPlot(data);
  addZoomControls();
};

// Update clearChartArea to also save zoom control state before clearing
const originalClearChartArea = clearChartArea;
clearChartArea = function () {
  saveZoomControlsState();
  d3.select("#zoom-controls").remove();
  return originalClearChartArea();
};

// Add CSS for the minimize feature
// This would typically be in a CSS file, but included here for reference
/*
.zoom-controls-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ccc;
  padding-bottom: 8px;
  margin-bottom: 10px;
}

.zoom-title {
  margin: 0;
}

.minimize-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 0 5px;
}

.minimize-btn:hover {
  background-color: #f0f0f0;
}

.zoom-controls-content {
  transition: display 0.3s ease;
}
*/
