// Load data from the dataset
async function loadData() {
    // Load and format gender pay gap dataset
    await d3.csv("gender-pay-gap-dataset-final.csv").then((data) => {
      // Format the data
      genderPayGapData = data.map((d) => ({
        year: +d.year,
        age: +d.age,
        sex: d.sex,
        race: d.race,
        incwage: +d.incwage,
        annhrs: +d.annhrs,
        Occupation: d.Occupation,
        Education: d.Education,
        ft: d.ft_status,
      }));
  
      // === Compute Average Wage by Year ===
      const groupedData = d3.group(
        genderPayGapData,
        (d) => d.year,
        (d) => d.sex
      );
      const avgIncwageByYear = [];
  
      groupedData.forEach((sexGroups, year) => {
        const menEntries = sexGroups.get("Male") || [];
        const womenEntries = sexGroups.get("Female") || [];
  
        const avgMenWage = d3.mean(menEntries, (d) => d.incwage) || 0;
        const avgWomenWage = d3.mean(womenEntries, (d) => d.incwage) || 0;
        const gapPercentage = avgMenWage
          ? Math.round(((avgMenWage - avgWomenWage) / avgMenWage) * 100 * 10) / 10
          : 0;
  
        avgIncwageByYear.push({
          year: +year,
          menWage: Math.round(avgMenWage),
          womenWage: Math.round(avgWomenWage),
          gapPercentage: gapPercentage,
        });
      });
  
      yearlyData = avgIncwageByYear.sort((a, b) => a.year - b.year);
  
      // === Compute User-Specified Equal-Width Age Bins ===
      const ageExtent = d3.extent(genderPayGapData, (d) => d.age);
      const binWidth = Math.ceil((ageExtent[1] - ageExtent[0]) / numBins);
  
      const binGenerator = d3
        .bin()
        .domain(ageExtent)
        .thresholds(d3.range(ageExtent[0], ageExtent[1] + binWidth, binWidth))
        .value((d) => d.age);
  
      const bins = binGenerator(genderPayGapData);
      ageData.length = 0;
  
      bins.forEach((bin) => {
        const menEntries = bin.filter((d) => d.sex === "Male");
        const womenEntries = bin.filter((d) => d.sex === "Female");
  
        const avgMenWage = d3.mean(menEntries, (d) => d.incwage) || 0;
        const avgWomenWage = d3.mean(womenEntries, (d) => d.incwage) || 0;
        const gap = avgMenWage
          ? Math.round(((avgMenWage - avgWomenWage) / avgMenWage) * 100 * 10) / 10
          : 0;
  
        ageData.push({
          ageGroup: `${Math.round(bin.x0)}-${Math.round(bin.x1)}`,
          menWage: Math.round(avgMenWage),
          womenWage: Math.round(avgWomenWage),
          gap: gap,
        });
      });
  
      // === Compute Occupation Data ===
      const occupationGroups = d3.group(genderPayGapData, (d) => d.Occupation);
  
      occupationData.length = 0;
      occupationProportionData.length = 0; // Clear existing data
  
      occupationGroups.forEach((entries, occupation) => {
        const menEntries = entries.filter((d) => d.sex === "Male");
        const womenEntries = entries.filter((d) => d.sex === "Female");
  
        const totalMen = menEntries.length;
        const totalWomen = womenEntries.length;
        const totalWorkers = totalMen + totalWomen;
  
        const menPercentage = totalWorkers
          ? Math.round((totalMen / totalWorkers) * 100)
          : 0;
        const womenPercentage = totalWorkers
          ? Math.round((totalWomen / totalWorkers) * 100)
          : 0;
  
        occupationData.push({
          occupation: occupation,
          menDominated: menPercentage > womenPercentage,
          menWage: Math.round(d3.mean(menEntries, (d) => d.incwage) || 0),
          womenWage: Math.round(d3.mean(womenEntries, (d) => d.incwage) || 0),
        });
  
        occupationProportionData.push({
          occupation: occupation,
          menPercentage: menPercentage,
          womenPercentage: womenPercentage,
        });
      });
  
      const groupedByGenderAndTime = d3.group(
        genderPayGapData,
        (d) => d.sex,
        (d) => d.ft
      );
  
      // Initialize an empty array to hold the formatted hours data for the box plot
      hoursData.length = 0;
  
      // Function to compute the box plot data (min, Q1, median, Q3, max)
      function computeBoxPlotStats(hours) {
        const sortedHours = hours.slice().sort(d3.ascending); // Sort the hours
        const min = d3.min(sortedHours);
        const max = d3.max(sortedHours);
        const q1 = d3.quantile(sortedHours, 0.25); // 25th percentile
        const median = d3.quantile(sortedHours, 0.5); // 50th percentile (median)
        const q3 = d3.quantile(sortedHours, 0.75); // 75th percentile
  
        return { min, q1, median, q3, max };
      }
  
      // Iterate over the grouped data to calculate the box plot stats for each category
      groupedByGenderAndTime.forEach((sexGroups, gender) => {
        sexGroups.forEach((entries, timeStatus) => {
          const hours = entries.map((d) => d.annhrs); // Extract the hours worked data
  
          // Compute the box plot statistics for hours worked
          const stats = computeBoxPlotStats(hours);
  
          // Calculate the median wage for the current group
          const medianWage = d3.median(entries, (d) => d.incwage);
  
          // Determine the category label based on gender and time status
          const category = `${timeStatus} ${gender}`;
  
          // Add the data to the hoursData array in the desired format, including quantiles for the box plot
          hoursData.push({
            category: category,
            min: stats.min,
            q1: stats.q1,
            median: stats.median,
            q3: stats.q3,
            max: stats.max,
            medianWage: Math.round(medianWage), // Median wage for the group
          });
        });
      });
  
      // === Compute Education Data ===
      educationData.length = 0; // Clear existing data
      const educationGroups = d3.group(
        genderPayGapData,
        (d) => d.Education,
        (d) => d.sex
      );
  
      educationGroups.forEach((sexGroups, educationLevel) => {
        const menEntries = sexGroups.get("Male") || [];
        const womenEntries = sexGroups.get("Female") || [];
  
        const avgMenWage = d3.mean(menEntries, (d) => d.incwage) || 0;
        const avgWomenWage = d3.mean(womenEntries, (d) => d.incwage) || 0;
        const gapPercentage = avgMenWage
          ? Math.round(((avgMenWage - avgWomenWage) / avgMenWage) * 100 * 10) / 10
          : 0;
  
        educationData.push({
          education: educationLevel,
          menWage: Math.round(avgMenWage),
          womenWage: Math.round(avgWomenWage),
          gapPercentage: gapPercentage,
        });
      });
  
      // === Compute Race and Gender Wage Data ===
      raceData.length = 0; // Clear existing data
      const raceGroups = d3.group(genderPayGapData, (d) => d.race);
  
      raceGroups.forEach((entries, race) => {
        // Filter data by gender
        const menEntries = entries.filter((d) => d.sex === "Male");
        const womenEntries = entries.filter((d) => d.sex === "Female");
  
        // Calculate average wage for men and women
        const avgMenWage = d3.mean(menEntries, (d) => d.incwage) || 0;
        const avgWomenWage = d3.mean(womenEntries, (d) => d.incwage) || 0;
  
        // Add to the raceGenderData array in the desired format
        raceData.push({
          race: race,
          menWage: Math.round(avgMenWage),
          womenWage: Math.round(avgWomenWage),
        });
      });
    });
  
    // Log the final data after all computations
    console.log("Loaded data:", genderPayGapData);
    console.log("Yearly Data:", yearlyData);
    console.log("Age Data:", ageData);
    console.log("Occupation Data:", occupationData);
    console.log("Occupation Proportion Data:", occupationProportionData);
    console.log("Hours Data:", hoursData);
    console.log("Education Data:", educationData);
    console.log("Race Data:", raceData);
  
    return {
      yearlyData,
      ageData,
      occupationData,
      occupationProportionData,
      hoursData,
      educationData,
      raceData,
    };
  }
  