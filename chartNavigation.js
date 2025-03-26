// Clear SVG for new chart
function clearChartArea() {
    svg.selectAll("*").remove();
    g = null;
  }
  
  // Forward button click handler
  function forwardClicked() {
    if (keyframeIndex < keyframes.length - 1) {
      keyframeIndex++;
      drawKeyframe(keyframeIndex);
    }
  }
  
  // Backward button click handler
  function backwardClicked() {
    if (keyframeIndex > 0) {
      keyframeIndex--;
      drawKeyframe(keyframeIndex);
    }
  }
  
  // Draw keyframe at given index
  function drawKeyframe(kfi) {
    const keyframe = keyframes[kfi];
  
    // Reset any active lines
    resetActiveLines();
  
    // Update active verse
    updateActiveVerse(keyframe.activeVerse);
  
    // Update active lines
    keyframe.activeLines.forEach((lid) => {
      updateActiveLine(keyframe.activeVerse, lid);
    });
  
    // Update the svg
    if (keyframe.svgUpdate) {
      keyframe.svgUpdate();
    }
  
    // Scroll to appropriate verse
    scrollToVerse(keyframe.activeVerse);
  }
  
  // Reset active lines
  function resetActiveLines() {
    d3.selectAll(".line").classed("active-line", false);
    d3.selectAll(".verse").classed("active-verse", false);
  }
  
  // Update active verse
  function updateActiveVerse(id) {
    d3.select(`#verse${id}`).classed("active-verse", true);
  }
  
  // Update active line
  function updateActiveLine(vid, lid) {
    d3.select(`#verse${vid} #line${lid}`).classed("active-line", true);
  }
  
  // Scroll to verse
  function scrollToVerse(id) {
    const leftColumn = document.querySelector(".left-column-content");
    const verse = document.querySelector(`#verse${id}`);
  
    if (!leftColumn || !verse) return;
  
    const leftRect = leftColumn.getBoundingClientRect();
    const verseRect = verse.getBoundingClientRect();
    const scrollTop =
      verseRect.top -
      leftRect.top -
      leftRect.height / 2 +
      verseRect.height / 2 +
      leftColumn.scrollTop;
  
    leftColumn.scrollTo({
      top: scrollTop,
      behavior: "smooth",
    });
  }
  
  // Add scroll wheel navigation
  function addScrollWheelNavigation() {
    // Track last scroll time to prevent too many events firing at once
    let lastScrollTime = 0;
    const scrollCooldown = 300;
  
    window.addEventListener(
      "wheel",
      function (event) {
        // Get current time
        const now = new Date().getTime();
  
        // Check if enough time has passed since the last scroll event
        if (now - lastScrollTime < scrollCooldown) {
          return;
        }
  
        // Update the last scroll time
        lastScrollTime = now;
  
        // Determine scroll direction
        if (event.deltaY > 0) {
          // Scrolling down - move forward
          forwardClicked();
        } else {
          // Scrolling up - move backward
          backwardClicked();
        }
      },
      { passive: true }
    );
  }

  