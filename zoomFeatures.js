// zoomFeatures.js
// Functionality to enable zooming on charts

// Store references to the original data and scales for reset operations
let originalZoomState = {
  yearlyData: null,
  xDomain: null,
  yDomain: null,
  currentZoom: false
};

// Common function to add zoom controls to any chart
function addZoomControls() {
  // Remove any existing zoom controls
  d3.select("#zoom-controls").remove();
  
  // Create zoom control panel
  const zoomControls = d3.select(".right-column")
    .append("div")
    .attr("id", "zoom-controls")
    .attr("class", "zoom-controls");
  
  // Add zoom reset button (always present)
  const resetBtn = zoomControls.append("button")
    .attr("id", "reset-zoom")
    .attr("class", "zoom-btn")
    .text("Reset View")
    .style("display", originalZoomState.currentZoom ? "inline-block" : "none")
    .on("click", resetZoom);
  
  // Add chart-specific zoom controls based on chart type
  if (currentChartType === "line") {
    addTimeRangeControls(zoomControls);
  } else if (currentChartType === "bar") {
    addFilterControls(zoomControls);
  } else if (currentChartType === "box") {
    addBoxPlotFilterControls(zoomControls);
  }
}

// Add time range selector for line charts
function addTimeRangeControls(container) {
  const timeControls = container.append("div")
    .attr("class", "time-controls");
  
  // Get the available years from the data
  const years = [...new Set(yearlyData.map(d => d.year))].sort((a, b) => a - b);
  const minYear = years[0];
  const maxYear = years[years.length - 1];
  
  // Add title
  timeControls.append("h3")
    .text("Select Time Period");
  
  // Add range sliders
  const sliderContainer = timeControls.append("div")
    .attr("class", "slider-container");
  
  // Start year selection
  sliderContainer.append("label")
    .attr("for", "start-year")
    .text("Start Year: ");
  
  const startYearDisplay = sliderContainer.append("span")
    .attr("id", "start-year-display")
    .text(minYear);
  
  sliderContainer.append("input")
    .attr("type", "range")
    .attr("id", "start-year")
    .attr("min", minYear)
    .attr("max", maxYear)
    .attr("value", minYear)
    .attr("step", 1)
    .on("input", function() {
      const value = +this.value;
      startYearDisplay.text(value);
      // Ensure end year is not less than start year
      const endYearSlider = d3.select("#end-year");
      if (+endYearSlider.property("value") < value) {
        endYearSlider.property("value", value);
        d3.select("#end-year-display").text(value);
      }
    });
  
  // End year selection
  sliderContainer.append("br");
  sliderContainer.append("label")
    .attr("for", "end-year")
    .text("End Year: ");
  
  const endYearDisplay = sliderContainer.append("span")
    .attr("id", "end-year-display")
    .text(maxYear);
  
  sliderContainer.append("input")
    .attr("type", "range")
    .attr("id", "end-year")
    .attr("min", minYear)
    .attr("max", maxYear)
    .attr("value", maxYear)
    .attr("step", 1)
    .on("input", function() {
      const value = +this.value;
      endYearDisplay.text(value);
      // Ensure start year is not greater than end year
      const startYearSlider = d3.select("#start-year");
      if (+startYearSlider.property("value") > value) {
        startYearSlider.property("value", value);
        d3.select("#start-year-display").text(value);
      }
    });
  
  // Apply zoom button
  timeControls.append("button")
    .attr("id", "apply-time-zoom")
    .attr("class", "zoom-btn")
    .text("Apply Time Filter")
    .on("click", applyTimeZoom);
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
  const filteredData = yearlyData.filter(d => d.year >= startYear && d.year <= endYear);
  
  // Update the chart with filtered data
  clearChartArea();
  yearlyData = filteredData;
  drawLineChart(filteredData);
  
  // Show reset button
  d3.select("#reset-zoom").style("display", "inline-block");
}

// Add demographic filter controls for bar charts
function addFilterControls(container) {
  const filterControls = container.append("div")
    .attr("class", "filter-controls");
  
  // Add title
  filterControls.append("h3")
    .text("Filter Categories");
  
  // Get categories based on chart type
  let categories = [];
  let dataSource = [];
  
  if (currentChartType === "bar") {
    // Determine which data we're currently using
    if (g.selectAll(".men-bar").data()[0]?.ageGroup) {
      categories = ageData.map(d => d.ageGroup);
      dataSource = ageData;
    } else if (g.selectAll(".men-bar").data()[0]?.race) {
      categories = raceData.map(d => d.race);
      dataSource = raceData;
    } else if (g.selectAll(".men-bar").data()[0]?.occupation) {
      categories = occupationData.map(d => d.occupation);
      dataSource = occupationData;
    } else if (g.selectAll(".men-bar").data()[0]?.education) {
      categories = educationData.map(d => d.education);
      dataSource = educationData;
    }
  }
  
  // Only continue if we have categories
  if (categories.length > 0) {
    // Create checkboxes for each category
    const checkboxContainer = filterControls.append("div")
      .attr("class", "checkbox-container");
    
    // Add "Select All" checkbox
    const selectAllDiv = checkboxContainer.append("div")
      .attr("class", "checkbox-item");
    
    selectAllDiv.append("input")
      .attr("type", "checkbox")
      .attr("id", "select-all")
      .attr("checked", true)
      .on("change", function() {
        const checked = this.checked;
        checkboxContainer.selectAll(".category-checkbox")
          .property("checked", checked);
      });
    
    selectAllDiv.append("label")
      .attr("for", "select-all")
      .text("Select All");
    
    // Add individual category checkboxes
    categories.forEach(category => {
      const div = checkboxContainer.append("div")
        .attr("class", "checkbox-item");
      
      div.append("input")
        .attr("type", "checkbox")
        .attr("id", `category-${category.replace(/\s+/g, '-').toLowerCase()}`)
        .attr("class", "category-checkbox")
        .attr("value", category)
        .attr("checked", true)
        .on("change", function() {
          // Update "Select All" checkbox
          const allChecked = checkboxContainer.selectAll(".category-checkbox").nodes()
            .every(node => node.checked);
          d3.select("#select-all").property("checked", allChecked);
        });
      
      div.append("label")
        .attr("for", `category-${category.replace(/\s+/g, '-').toLowerCase()}`)
        .text(category);
    });
    
    // Apply filter button
    filterControls.append("button")
      .attr("id", "apply-filter")
      .attr("class", "zoom-btn")
      .text("Apply Filter")
      .on("click", function() {
        applyDemographicFilter(dataSource);
      });
  }
}

// Apply demographic filters to bar charts
function applyDemographicFilter(dataSource) {
  // Get selected categories
  const selectedCategories = d3.selectAll(".category-checkbox:checked").nodes()
    .map(node => node.value);
  
  // Save original state if this is the first zoom
  if (!originalZoomState.currentZoom) {
    if (dataSource === ageData) {
      originalZoomState.ageData = [...ageData];
    } else if (dataSource === raceData) {
      originalZoomState.raceData = [...raceData];
    } else if (dataSource === occupationData) {
      originalZoomState.occupationData = [...occupationData];
    } else if (dataSource === educationData) {
      originalZoomState.educationData = [...educationData];
    }
    originalZoomState.currentZoom = true;
  }
  
  // Filter data by selected categories
  let filteredData = dataSource.filter(d => {
    // Determine which property contains the category
    let categoryProperty;
    if ('ageGroup' in d) categoryProperty = 'ageGroup';
    else if ('race' in d) categoryProperty = 'race';
    else if ('occupation' in d) categoryProperty = 'occupation';
    else if ('education' in d) categoryProperty = 'education';
    
    return selectedCategories.includes(d[categoryProperty]);
  });
  
  // Redraw chart with filtered data
  clearChartArea();
  if (dataSource === ageData) {
    ageData = filteredData;
    drawAgeVerticalBarChart(filteredData);
  } else if (dataSource === raceData) {
    raceData = filteredData;
    drawRaceVerticalBarChart(filteredData);
  } else if (dataSource === occupationData) {
    occupationData = filteredData;
    drawOccupationHorizontalBarChart(filteredData);
  } else if (dataSource === educationData) {
    educationData = filteredData;
    drawEducationHorizontalBarChart(filteredData);
  }
  
  // Show reset button
  d3.select("#reset-zoom").style("display", "inline-block");
}

// Add filter controls for box plot
function addBoxPlotFilterControls(container) {
  const filterControls = container.append("div")
    .attr("class", "filter-controls");
  
  // Add title
  filterControls.append("h3")
    .text("Filter Employment Types");
  
  // Get categories
  const employmentTypes = [...new Set(hoursData.map(d => {
    // Extract employment type (part-time/full-time)
    const parts = d.category.split(" ");
    return parts[0]; // First part is employment type
  }))];
  
  // Create radio buttons for employment type
  const radioContainer = filterControls.append("div")
    .attr("class", "radio-container");
  
  // Add "All" option
  const allDiv = radioContainer.append("div")
    .attr("class", "radio-item");
  
  allDiv.append("input")
    .attr("type", "radio")
    .attr("id", "filter-all")
    .attr("name", "employment-filter")
    .attr("value", "all")
    .attr("checked", true);
  
  allDiv.append("label")
    .attr("for", "filter-all")
    .text("All Types");
  
  // Add individual employment type options
  employmentTypes.forEach(type => {
    const div = radioContainer.append("div")
      .attr("class", "radio-item");
    
    div.append("input")
      .attr("type", "radio")
      .attr("id", `filter-${type.toLowerCase()}`)
      .attr("name", "employment-filter")
      .attr("value", type);
    
    div.append("label")
      .attr("for", `filter-${type.toLowerCase()}`)
      .text(type);
  });
  
  // Apply filter button
  filterControls.append("button")
    .attr("id", "apply-box-filter")
    .attr("class", "zoom-btn")
    .text("Apply Filter")
    .on("click", applyBoxPlotFilter);
}

// Apply filter to box plot
function applyBoxPlotFilter() {
  const selectedType = d3.select('input[name="employment-filter"]:checked').property("value");
  
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
    filteredData = originalZoomState.hoursData.filter(d => d.category.startsWith(selectedType));
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
  if (originalZoomState.yearlyData) yearlyData = [...originalZoomState.yearlyData];
  if (originalZoomState.ageData) ageData = [...originalZoomState.ageData];
  if (originalZoomState.raceData) raceData = [...originalZoomState.raceData];
  if (originalZoomState.occupationData) occupationData = [...originalZoomState.occupationData];
  if (originalZoomState.educationData) educationData = [...originalZoomState.educationData];
  if (originalZoomState.hoursData) hoursData = [...originalZoomState.hoursData];
  
  // Redraw current chart
  clearChartArea();
  keyframes[keyframeIndex].svgUpdate();
  
  // Hide reset button
  d3.select("#reset-zoom").style("display", "none");
  
  // Reset zoom state
  originalZoomState.currentZoom = false;
}

// Modify the existing chart drawing functions to call addZoomControls after drawing
// These wrappers will replace the original functions

// Wrap the drawLineChart function
const originalDrawLineChart = drawLineChart;
drawLineChart = function(data) {
  originalDrawLineChart(data);
  addZoomControls();
};

// Wrap drawAgeVerticalBarChart
const originalDrawAgeVerticalBarChart = drawAgeVerticalBarChart;
drawAgeVerticalBarChart = function(data) {
  originalDrawAgeVerticalBarChart(data);
  addZoomControls();
};

// Wrap drawRaceVerticalBarChart
const originalDrawRaceVerticalBarChart = drawRaceVerticalBarChart;
drawRaceVerticalBarChart = function(data) {
  originalDrawRaceVerticalBarChart(data);
  addZoomControls();
};

// Wrap drawOccupationHorizontalBarChart
const originalDrawOccupationHorizontalBarChart = drawOccupationHorizontalBarChart;
drawOccupationHorizontalBarChart = function(data) {
  originalDrawOccupationHorizontalBarChart(data);
  addZoomControls();
};

// Wrap drawEducationHorizontalBarChart
const originalDrawEducationHorizontalBarChart = drawEducationHorizontalBarChart;
drawEducationHorizontalBarChart = function(data) {
  originalDrawEducationHorizontalBarChart(data);
  addZoomControls();
};

// Wrap drawOccupationStackedBarChart
const originalDrawOccupationStackedBarChart = drawOccupationStackedBarChart;
drawOccupationStackedBarChart = function(data) {
  originalDrawOccupationStackedBarChart(data);
  addZoomControls();
};

// Wrap drawHoursBoxPlot
const originalDrawHoursBoxPlot = drawHoursBoxPlot;
drawHoursBoxPlot = function(data) {
  originalDrawHoursBoxPlot(data);
  addZoomControls();
};

// Update clearChartArea to also clear zoom controls
const originalClearChartArea = clearChartArea;
clearChartArea = function() {
  d3.select("#zoom-controls").remove();
  return originalClearChartArea();
};