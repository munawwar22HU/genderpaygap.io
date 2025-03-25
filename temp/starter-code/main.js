/* This code is my own work, it was written without consulting code written by other
students current or previous or using any AI tools. AI tools were only used for 
debugging (Muhammad Munawwar Anwar) */

// TODO add svgUpdate fields to keyframes (DONE)
let keyframes = [
    {
        activeVerse: 1,
        activeLines: [1, 2, 3, 4],
        svgUpdate: drawRoseColours,
    },
    {
        activeVerse: 2,
        activeLines: [1, 2, 3, 4],
        svgUpdate: drawVioletColours,
    },
    {
        activeVerse: 3,
        activeLines: [1],
        svgUpdate: drawRoseColours,
    },
    {
        activeVerse: 3,
        activeLines: [2],
        svgUpdate: () => highlightColour("Red", "red"),
    },
    {
        activeVerse: 3,
        activeLines: [3],
        svgUpdate: () => highlightColour("White", "white"),
    },
    {
        activeVerse: 3,
        activeLines: [4],
        // TODO update the keyframe displaying the 4th line of the 3rd verse so that every bar gets highlighted in its respective colour (DONE)
        svgUpdate: () => {
            svg
                .selectAll(".bar")
                .transition()
                .duration(500)
                .attr("fill", (d) => d.colour.toLowerCase());
        },
    },
    // TODO update keyframes for verse 4 to show each line one by one (DONE)
    {
        activeVerse: 4,
        activeLines: [1],
        svgUpdate: makeRedBarClickable,
    },
    {
        activeVerse: 4,
        activeLines: [2],
        svgUpdate: drawRoseColours,
    },
    {
        activeVerse: 4,
        activeLines: [3],
        svgUpdate: displaySortedRoseData,
    },
    {
        activeVerse: 4,
        activeLines: [4],
        svgUpdate: displaySortedRoseData,
    },
    {
        // TODO add keyframe(s) for your new fifth verse
        activeVerse: 5,
        activeLines: [1,2,3,4],
        // TODO the first keyframe should update the svg and display a pie chart of either the roses or violets dataset
        svgUpdate: createPieChart,
    },
    

];

// TODO write a function which will display the rose data sorted from highest to lowest (DONE)
// HINT Be careful when sorting the data that you don't change the rosechartData variable itself, otherwise when you a user clicks back to the start it will always be sorted
// HINT If you have correctly implemented your updateBarchart function then you won't need to do anything extra to make sure it animates smoothly (just pass a sorted version of the data to updateBarchart)

function displaySortedRoseData() {
    const sortedData = [...roseChartData].sort((a, b) => b.count - a.count);
    updateBarChart(sortedData, "Distribution of Rose Colours");
}
// TODO define global variables
let svg = d3.select("#svg");
let keyframeIndex = 0;

const width = 500;
const height = 400;

let chart;
let chartWidth;
let chartHeight;

let xScale;
let yScale;

// TODO add event listeners to the buttons
document
    .getElementById("forward-button")
    .addEventListener("click", forwardClicked);
document
    .getElementById("backward-button")
    .addEventListener("click", backwardClicked);

// TODO write an asynchronous loadData function (DONE)
// TODO call that in our initalise function (DONE)
async function loadData() {
    await d3.json("rose_colours.json").then((data) => {
        roseChartData = data;
    });
    console.log(roseChartData);

    await d3.json("violet_colours.json").then((data) => {
        violetChartData = data;
    });
}
// TODO draw a bar chart from the rose dataset
function drawRoseColours() {
    updateBarChart(roseChartData, "Distribution of Rose Colours");
}
// TODO draw a bar chart from the violet dataset
function drawVioletColours() {
    updateBarChart(violetChartData, "Distribution of Violet Colours");
}

function highlightColour(colourName, highlightColour) {
    // TODO: Select the bar that has the right value
    svg
        .selectAll(".bar")
        .filter((d) => d.colour === colourName) // Select the bar based on the colourName

        // TODO: Update its fill colour
        .attr("fill", highlightColour) // Change the fill to the highlightColour

        // TODO: Add a transition to make it smooth
        .transition()
        .duration(500)
        .attr("fill", highlightColour); // Apply the fill transition with smooth effect
}

function updateBarChart(data, title = "") {
    // TODO: Update the xScale domain to match new order
    xScale.domain(data.map((d) => d.colour));
    // TODO: Update the yScale domain for new values
    yScale.domain([0, d3.max(data, (d) => d.count)]).nice();

    // TODO: Select all the existing bars
    const bars = chart.selectAll(".bar").data(data, (d) => d.colour);

    // TODO: Remove any bars no longer in the dataset
    bars
        .exit()
        .transition()
        .duration(1000)
        .attr("height", 0)
        .attr("y", chartHeight)
        .remove();
    // TODO: Move any bars that already existed to their correct spot
    bars
        .transition()
        .duration(1000)
        .attr("x", (d) => xScale(d.colour))
        .attr("y", (d) => yScale(d.count))
        .attr("width", xScale.bandwidth())
        .attr("height", (d) => chartHeight - yScale(d.count))
        .attr("fill", (d) => d.color || "#999");
    // TODO: Add any new bars
    bars
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", (d) => xScale(d.colour))
        .attr("y", chartHeight)
        .attr("width", xScale.bandwidth())
        .attr("height", 0)
        .attr("fill", (d) => d.color || "#999")
        .transition()
        .duration(1000)
        .attr("y", (d) => yScale(d.count))
        .attr("height", (d) => chartHeight - yScale(d.count));
    // TODO: Update the x and y axis
    chart
        .select(".x-axis")
        .transition()
        .duration(1000)
        .call(d3.axisBottom(xScale));

    chart.select(".y-axis").transition().duration(1000).call(d3.axisLeft(yScale));
    // TODO: Update the title
    if (title.length > 0) {
        svg.select("#chart-title").transition().duration(1000).text(title);
    }
}

// TODO define behaviour when the forwards button is clicked
function forwardClicked() {
    if (chart) {
        chart.selectAll(".bar").attr("fill", "#999");
    }

    if (keyframeIndex < keyframes.length - 1) {
        keyframeIndex++;
        drawKeyframe(keyframeIndex);
    } else {
        svg.selectAll("*").remove();
        keyframeIndex = 0;
        initialiseSVG();
        drawKeyframe(keyframeIndex);
    }
}

// TODO define behaviour when the backwards button is clicked
function backwardClicked() {
    if (chart && keyframeIndex !== keyframes.length - 1) {
        chart.selectAll(".bar").attr("fill", "#999");
    }

    if (keyframeIndex > 0) {
        if (keyframeIndex === keyframes.length - 1) {
            svg.selectAll("*").remove();

            keyframeIndex--;

            initialiseSVG();

            displaySortedRoseData();

            updateActiveVerse(keyframes[keyframeIndex].activeVerse);
            for (let line of keyframes[keyframeIndex].activeLines) {
                updateActiveLine(keyframes[keyframeIndex].activeVerse, line);
            }

            makeRedBarClickable();
            makeWordsHoverable();
        } else {
            keyframeIndex--;
            drawKeyframe(keyframeIndex);
        }
    } else {
        keyframeIndex = keyframes.length - 1;
        drawKeyframe(keyframeIndex);
    }
}

function drawKeyframe(kfi) {
    // TODO: Get keyframe at index position
    let kf = keyframes[kfi];

    // TODO: Reset any active lines
    resetActiveLines();

    // TODO: Update the active verse
    updateActiveVerse(kf.activeVerse);

    // TODO: Update any active lines
    for (line of kf.activeLines) {
        updateActiveLine(kf.activeVerse, line);
    }
    // TODO: Update the svg
    if (kf.svgUpdate) {
        kf.svgUpdate();
    }
}

// TODO write a function to reset any active lines
function resetActiveLines() {
    d3.selectAll(".line").classed("active-line", false);
}

// TODO: Write a function to scroll the left column to the right place
function scrollLeftColumnToActiveVerse(id) {
    // TODO: Select the div displaying the left column content
    var leftColumn = document.querySelector(".left-column-content");

    // TODO: Select the verse we want to display
    var activeVerse = document.getElementById("verse" + id);

    // TODO: Calculate the bounding rectangles of both of these elements
    var verseRect = activeVerse.getBoundingClientRect();
    var leftColumnRect = leftColumn.getBoundingClientRect();

    // TODO: Calculate the desired scroll position
    var desiredScrollTop =
        verseRect.top +
        leftColumn.scrollTop -
        leftColumnRect.top -
        (leftColumnRect.height - verseRect.height) / 2;

    // TODO: Scroll to the desired position
    leftColumn.scrollTo({
        top: desiredScrollTop,
        behavior: "smooth",
    });
}

// TODO: Write a function to update the active verse
function updateActiveVerse(id) {
    d3.selectAll(".verse").classed("active-verse", false);
    d3.select("#verse" + id).classed("active-verse", true);
    scrollLeftColumnToActiveVerse(id);
}

// TODO write a function to update the active line
function updateActiveLine(vid, lid) {
    let thisVerse = d3.select("#verse" + vid);

    thisVerse.select("#line" + lid).classed("active-line", true);
}
// TODO write a function to initialise the svg properly
function initialiseSVG() {
    svg.attr("width", width);
    svg.attr("height", height);

    svg.selectAll("*").remove();

    const margin = { top: 30, right: 30, bottom: 50, left: 50 };
    chartWidth = width - margin.left - margin.right;
    chartHeight = height - margin.top - margin.bottom;

    chart = svg
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    xScale = d3.scaleBand().domain([]).range([0, chartWidth]).padding(0.1);

    yScale = d3.scaleLinear().domain([]).nice().range([chartHeight, 0]);

    chart
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text");

    chart
        .append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale))
        .selectAll("text");

    svg
        .append("text")
        .attr("id", "chart-title")
        .attr("x", width / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("fill", "white")
        .text("");
}

// TODO write a function to make every instance of "red" and "purple" in the poem hoverable. When you hover the corresponding bar in the chart (if it exists) should be highlighted in its colour
// HINT when you 'mouseout' of the word the bar should return to it's original colour
// HINT you will wamt to edit the html and css files to achieve this
// HINT this behaviour should be global at all times so make sure you call it when you intialise everything
function makeWordsHoverable() {
    d3.selectAll(".red-span")
        .on("mouseover", function () {
            chart
                .selectAll(".bar")
                .filter((d) => d.colour === "Red")
                .transition()
                .duration(300)
                .attr("fill", "red");
        })
        .on("mouseout", function () {
            chart
                .selectAll(".bar")
                .filter((d) => d.colour === "Red")
                .transition()
                .duration(300)
                .attr("fill", (d) => d.color || "#999");
        });

    d3.selectAll(".purple-span")
        .on("mouseover", function () {
            chart
                .selectAll(".bar")
                .filter((d) => d.colour === "Purple")
                .transition()
                .duration(300)
                .attr("fill", "purple");
        })
        .on("mouseout", function () {
            chart
                .selectAll(".bar")
                .filter((d) => d.colour === "Purple")
                .transition()
                .duration(300)
                .attr("fill", (d) => d.color || "#999");
        });
}

// TODO write a function so that when you click on the red bar when verse 4 is displayed (and only when verse 4 is displayed) every instance of the word red in the poem are highlighted in red
// HINT you will need to update the keyframes to do this and ensure it isn't global behaviour
// HINT you will again have to edit the html and css
function makeRedBarClickable() {
    const redBar = chart.selectAll(".bar").filter((d) => d.colour === "Red");

    let redHighlighted = false;

    redBar.on("click", function () {
        redHighlighted = !redHighlighted;

        d3.selectAll(".red-span").classed("red-text", redHighlighted);
    });
}

// Reference: https://medium.com/%40aleksej.gudkov/creating-a-pie-chart-with-d3-js-a-complete-guide-b69fd35268ea
// Styling: ChatGPT
function createPieChart() {
    chart.selectAll("*").remove();

    const radius = Math.min(chartWidth, chartHeight) / 2;

    const pieGroup = chart
        .append("g")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight / 2})`);

    const pie = d3.pie().value((d) => d.count);

    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    const pieData = pie(roseChartData);

    const slices = pieGroup
        .selectAll("path")
        .data(pieData)
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", (d) => d.data.colour) // Directly use the color from data
        .attr("stroke", "white")
        

    pieGroup
        .selectAll("text")
        .data(pieData)
        .enter()
        .append("text")
        .attr("transform", (d) => {
            let pos = arc.centroid(d); // Get slice centroid
            let scaleFactor = d.endAngle - d.startAngle < 0.3 ? 1.2 : 1.35; // Adjust based on slice size

            pos[0] *= scaleFactor; // Scale X position outward
            pos[1] *= scaleFactor; // Scale Y position outward

            return `translate(${pos[0]}, ${pos[1]})`;
        })
        .text((d) => `${d.data.colour} (${d.data.count})`)
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("fill", "black")
        .style("text-anchor", "middle")
        .style("alignment-baseline", "middle");

    pieGroup.select("#chart-title").text("Rose Colors Distribution (Pie Chart)");
}
async function initialise() {
    await loadData();
    initialiseSVG();
    drawKeyframe(keyframeIndex);
    makeWordsHoverable();
}

initialise();
