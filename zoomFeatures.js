// Zoom State
let originalZoomState = {
  yearlyData: null,
  xDomain: null,
  yDomain: null,
  currentZoom: false,
};
// Flag to minize or unminimize zoom controls
let zoomControlsMinimized = false;

// Add zoom controls to the right column of the chart area
function addZoomControls() {
  d3.select("#zoom-controls").remove();

  const zoomControls = d3
    .select(".right-column")
    .append("div")
    .attr("id", "zoom-controls")
    .attr("class", "zoom-controls");

  const headerBar = zoomControls
    .append("div")
    .attr("class", "zoom-controls-header");

  headerBar.append("h3").attr("class", "zoom-title").text("Zoom Controls");

  headerBar
    .append("button")
    .attr("class", "minimize-btn")
    .html(zoomControlsMinimized ? "+" : "−")
    .on("click", toggleZoomControlsVisibility);

  const contentContainer = zoomControls
    .append("div")
    .attr("id", "zoom-controls-content")
    .attr("class", "zoom-controls-content")
    .style("display", zoomControlsMinimized ? "none" : "block");

  if (currentChartType === "line") {
    addTimeRangeControls(contentContainer);
  } else if (currentChartType === "bar" || currentChartType === "stackedbar") {
    addFilterControls(contentContainer);
  } else if (currentChartType === "box") {
    addBoxPlotFilterControls(contentContainer);
  }
}
// Toggle visibility of zoom controls
function toggleZoomControlsVisibility() {
  zoomControlsMinimized = !zoomControlsMinimized;

  const content = d3.select("#zoom-controls-content");
  content.style("display", zoomControlsMinimized ? "none" : "block");

  d3.select(".minimize-btn").html(zoomControlsMinimized ? "+" : "−");
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

function addFilterControls(container) {
  const filterControls = container
    .append("div")
    .attr("class", "filter-controls");

  // Add title
  filterControls.append("h3").text("Filter Categories");

  // Get categories based on chart type
  let categories = [];
  let dataSource = [];

  // Select SVG and chart group locally
  const svg = d3.select("#svg");
  if (svg.empty()) {
    console.warn("SVG #svg not found");
    filterControls.append("p").text("No filters available");
    return;
  }
  const chartGroup = svg.select("g"); // First <g> contains chart elements
  if (chartGroup.empty()) {
    console.warn("No chart group found in SVG");
    filterControls.append("p").text("No filters available");
    return;
  }

  if (currentChartType === "bar") {
    const barData = chartGroup.selectAll(".men-bar").data();
    const sample = barData[0] || {};

    if (sample.ageGroup) {
      dataSource = ageData;
    } else if (sample.race) {
      dataSource = raceData;
    } else if (sample.occupation) {
      dataSource = occupationData;
    } else if (sample.education) {
      dataSource = educationData;
    }
    categories = getOrderedCategories(dataSource);
  } else if (currentChartType === "stackedbar") {
    const stackData = chartGroup.selectAll(".men-stack").data();
    const sample =
      stackData.length > 0 && stackData[0].length > 0
        ? stackData[0][0].data
        : {};

    if (sample.occupation) {
      dataSource = occupationData;
    } else if (sample.ageGroup) {
      dataSource = ageData;
    } else if (sample.race) {
      dataSource = raceData;
    } else if (sample.education) {
      dataSource = educationData;
    }

    categories = getOrderedCategories(dataSource);
    console.log("Stacked bar categories:", categories);
  }

  const checkboxContainer = filterControls
    .append("div")
    .attr("class", "checkbox-container");

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
      applyDemographicFilter(dataSource);
    });

  selectAllDiv.append("label").attr("for", "select-all").text("Select All");
  checkboxContainer.on("wheel", function(event) {
    const containerElement = this; // The checkbox-container div

    // Check if the container is actually scrollable
    // (scrollHeight > clientHeight means content is taller than the visible area)
    if (containerElement.scrollHeight > containerElement.clientHeight) {

        // Prevent the main page scroll listener from firing
        event.stopPropagation();

        // Adjust the container's scroll position
        // deltaY is positive for scrolling down, negative for up
        containerElement.scrollTop += event.deltaY;

        // Optional: preventDefault() might be needed in some browsers
        // if stopPropagation() alone isn't enough, but try without it first.
        // event.preventDefault();
    }
    // If not scrollable, let the event bubble up naturally
});
  categories.forEach((category) => {
    const div = checkboxContainer.append("div").attr("class", "checkbox-item");

    div
      .append("input")
      .attr("type", "checkbox")
      .attr("id", `category-${category.replace(/\s+/g, "-").toLowerCase()}`)
      .attr("class", "category-checkbox")
      .attr("value", category)
      .attr("checked", true)
      .on("change", function () {
        const allChecked = checkboxContainer
          .selectAll(".category-checkbox")
          .nodes()
          .every((node) => node.checked);
        d3.select("#select-all").property("checked", allChecked);
        applyDemographicFilter(dataSource);
      });

    div
      .append("label")
      .attr("for", `category-${category.replace(/\s+/g, "-").toLowerCase()}`)
      .text(category);
  });
}

function applyDemographicFilter(dataSource) {
  const selectedCategories = d3
    .selectAll(".category-checkbox:checked")
    .nodes()
    .map((node) => node.value);

  if (!originalZoomState.currentZoom) {
    if (dataSource === occupationData) {
      originalZoomState.occupationData = [...occupationData];
      console.log("Saving original occupation data");
    } else if (dataSource === ageData) {
      originalZoomState.ageData = [...ageData];
    } else if (dataSource === raceData) {
      originalZoomState.raceData = [...raceData];
    } else if (dataSource === educationData) {
      originalZoomState.educationData = [...educationData];
    } else if (dataSource === incomeData) {
      originalZoomState.incomeData = [...incomeData];
    }
    originalZoomState.currentZoom = true;
  }

  // Handle different chart types

  // For occupation chart
  if (dataSource === occupationData) {
    if (currentChartType === "bar") {
      d3.selectAll("rect").each(function (d) {
        if (d && d.occupation) {
          const visible = selectedCategories.includes(d.occupation);
          d3.select(this).style("display", visible ? null : "none");
        }
      });
    } else if (currentChartType === "stackedbar") {
      // Select SVG and chart group
      const svg = d3.select("#svg");
      if (svg.empty()) {
        console.warn("SVG #svg not found");
        return;
      }
      const chartGroup = svg.select("g");
      if (chartGroup.empty()) {
        console.warn("No chart group found");
        return;
      }

      // Update visibility of rectangles in .men-stack and .women-stack
      chartGroup
        .selectAll(".men-stack rect, .women-stack rect")
        .style("display", (d) =>
          selectedCategories.includes(d.data.occupation) ? null : "none"
        );
    }
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
    d3.selectAll("rect").each(function (d) {
      if (d && d.education) {
        const visible = selectedCategories.includes(d.education);
        d3.select(this).style("display", visible ? null : "none");
      }
    });
  }
}

// Add filter controls for box plot
function addBoxPlotFilterControls(container) {
  const filterControls = container
    .append("div")
    .attr("class", "filter-controls");

  // Add title
  filterControls.append("h3").text("Filter Employment Types");

  // Define fixed employment types
  const employmentTypes = ["Full-time", "Part-time"];

  // Create checkbox container
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
    .attr("id", "select-all-employment")
    .attr("checked", true)
    .on("change", function () {
      const checked = this.checked;
      checkboxContainer
        .selectAll(".employment-checkbox")
        .property("checked", checked);
      applyBoxPlotFilter();
    });

  selectAllDiv
    .append("label")
    .attr("for", "select-all-employment")
    .text("Select All");

  // Add individual employment type checkboxes
  employmentTypes.forEach((type) => {
    const div = checkboxContainer.append("div").attr("class", "checkbox-item");

    div
      .append("input")
      .attr("type", "checkbox")
      .attr("id", `filter-${type.toLowerCase()}`)
      .attr("class", "employment-checkbox")
      .attr("value", type)
      .attr("checked", true)
      .on("change", function () {
        // Update "Select All" checkbox state
        const allChecked = checkboxContainer
          .selectAll(".employment-checkbox")
          .nodes()
          .every((node) => node.checked);
        d3.select("#select-all-employment").property("checked", allChecked);
        applyBoxPlotFilter();
      });

    div.append("label").attr("for", `filter-${type.toLowerCase()}`).text(type);
  });
}

// Apply box plot filter based on selected employment types
function applyBoxPlotFilter() {
  const selectedTypes = d3
    .selectAll(".employment-checkbox:checked")
    .nodes()
    .map((node) => node.value);

  // Update visibility of box plot elements
  let matched = false;
  d3.selectAll("g.box-group").each(function (d) {
    if (d && d.category) {
      // If no types are selected, hide all box plots
      if (selectedTypes.length === 0) {
        d3.select(this).style("display", "none");
      } else {
        // Map SVG category names to checkbox values
        const employmentType = d.category.startsWith("Full Time")
          ? "Full-time"
          : "Part-time";
        const visible = selectedTypes.includes(employmentType);
        d3.select(this).style("display", visible ? null : "none");
      }
      matched = true;
    }
  });

  // Debug: Log if no elements were matched
  if (!matched) {
    console.warn(
      "No box plot elements matched for visibility toggle. Expected <g class='box-group'> with d.category like 'Full Time Male'."
    );
    console.log(
      "Sample data from selection:",
      d3.select("g.box-group").datum()
    );
    console.log(
      "Available box groups:",
      d3.selectAll("g.box-group").nodes().length
    );
  }
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

// const originalDrawLineChart = drawLineChart;
// drawLineChart = function (data) {
//   originalDrawLineChart(data);
//   addZoomControls();
// };

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
  console.log("drawOccupationStackedBarChart called");
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
