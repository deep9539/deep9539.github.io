function giveHighlightCount(filterDate) {
  if (yearAndMonth == '1984/12') {
    return 40
  }
  if (yearAndMonth == '1994/12') {
    return 60
  }
  else if (yearAndMonth == '2012/12') {
    return 70
  }
  else if (yearAndMonth == '2023/12') {
    return 50
  }
  return 100;
}

function updateUnemploymentGraph(filterDate, plotType = 'SeasonallyAdjusted') {
    highlightCount = giveHighlightCount(filterDate)
    // Load the CSV data
    d3.csv("unemployment_rate_us_and_california.csv").then(function(data) {
        // Parse the date
        data.forEach(d => {
            d.Date = d3.timeParse("%Y/%m")(d.Date);
            d.SeasonallyAdjusted = +d.SeasonallyAdjusted; // Ensure rate is a number
            d.NotSeasonallyAdjusted = +d.NotSeasonallyAdjusted; // Ensure rate is a number
        });

        // Get the full time range for the x-axis
        const fullDateRange = d3.extent(data, d => d.Date);

        // Determine the full range for the y-axis based on plotType
        const fullYRange = plotType === 'SeasonallyAdjusted' 
            ? [0, d3.max(data, d => d.SeasonallyAdjusted)]
            : [0, d3.max(data, d => d.NotSeasonallyAdjusted)];

        // Filter the data for the line
        const filteredData = data.filter(d => d.Date <= d3.timeParse("%Y/%m")(filterDate));

        // Split the data for highlighting the last `highlightCount` points
        const highlightData = filteredData.slice(-highlightCount);

        // Set up dimensions and margins
        const margin = {top: 20, right: 200, bottom: 100, left: 50},
            width = 1200 - margin.left - margin.right,
            height = 700 - margin.top - margin.bottom;

        // Clear the existing SVG content before appending new elements
        d3.select("#unemployment_graph").selectAll("*").remove();

        // Select the SVG element
        const svg = d3.select("#unemployment_graph")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Set up scales
        const x = d3.scaleTime()
            .domain(fullDateRange)  // Use the full date range for the X axis
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain(fullYRange)  // Use the full range for the Y axis
            .range([height, 0]);

        // Add axes
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));

        svg.append("g")
            .call(d3.axisLeft(y));

        // Add the blue line for the entire dataset
        svg.append("path")
            .datum(filteredData)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(d => x(d.Date))
                .y(d => y(d[plotType]))
                .defined((d, i) => i < filteredData.length - highlightCount || i === filteredData.length - highlightCount) // Draw blue line up to the last highlighted point
            );

        // Add the red line for the highlighted data
        svg.append("path")
            .datum(filteredData)
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(d => x(d.Date))
                .y(d => y(d[plotType]))
                .defined((d, i) => i >= filteredData.length - highlightCount - 1) // Draw red line starting from the last point of blue line
            );

        // Add a circle marker for the tooltip
        const focus = svg.append("g")
            .style("display", "none");

        focus.append("circle")
            .attr("r", 4.5)
            .attr("fill", "steelblue");

        // Add tooltip elements within the SVG
        focus.append("rect")
            .attr("class", "tooltip-bg")
            .attr("width", 200)
            .attr("height", 60)
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("rx", 5)
            .attr("ry", 5);

        focus.append("text")
            .attr("class", "tooltip-date")
            .attr("x", 15)
            .attr("y", 0);

        focus.append("text")
            .attr("class", "tooltip-rate")
            .attr("x", 15)
            .attr("y", 15);

        focus.append("text")
            .attr("class", "tooltip-non-adjust-rate")
            .attr("x", 15)
            .attr("y", 30);

        const bisectDate = d3.bisector(d => d.Date).left;

        svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .style("fill", "none")
            .style("pointer-events", "all")
            .on("mouseover", function() {
                focus.style("display", null);
            })
            .on("mousemove", function(event) {
                const x0 = x.invert(d3.pointer(event)[0]);
                const i = bisectDate(filteredData, x0, 1);
                const d0 = filteredData[i - 1];
                const d1 = filteredData[i];
                const d = x0 - d0.Date > d1.Date - x0 ? d1 : d0;

                const focusX = x(d.Date);
                const focusY = y(d[plotType]);

                // Check if the hovered point is in the highlighted data
                const isHighlighted = highlightData.includes(d);
                focus.select("circle").attr("fill", isHighlighted ? "red" : "steelblue");

                focus.attr("transform", `translate(${focusX},${focusY})`);
                focus.select(".tooltip-bg")
                    .attr("x", 10)
                    .attr("y", -25);

                focus.select(".tooltip-date")
                    .text(`Date: ${d3.timeFormat("%Y/%m")(d.Date)}`);

                focus.select(".tooltip-rate")
                    .text(`Seasonally Adjusted Rate: ${d.SeasonallyAdjusted}`);

                focus.select(".tooltip-non-adjust-rate")
                    .text(`Actual Rate: ${d.NotSeasonallyAdjusted}`);

            })
            .on("mouseout", function() {
                focus.style("display", "none");
            });

        // Add the semi-transparent message
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", 0)
            .attr("text-anchor", "middle")
            .attr("fill", "black")
            .attr("opacity", 0.5)
            .attr("font-size", "16px")
            .attr("font-family", "Arial")
            .text("Hover to get more information");

        svg.append("text")
          .attr("x", width - margin.right + 20) // Adjust position as needed
          .attr("y", margin.top + 20)           // Adjust position as needed
          .attr("text-anchor", "start")
          .text("Recession Period");

        const lastRedPoint = filteredData[filteredData.length - 1 - (highlightCount / 2)];

        svg.append("line")
          .attr("x1", x(lastRedPoint.Date))
          .attr("y1", y(lastRedPoint[plotType]))
          .attr("x2", width - margin.right + 10) // Adjust position to point to annotation
          .attr("y2", margin.top + 20)           // Adjust position to point to annotation
          .attr("stroke", "black")
          .attr("marker-end", "url(#arrow)"); // Assuming you have an arrow marker defined

        svg.append("defs").append("marker")
          .attr("id", "arrow")
          .attr("viewBox", "0 -5 10 10")
          .attr("refX", 5)
          .attr("refY", 0)
          .attr("markerWidth", 4)
          .attr("markerHeight", 4)
          .attr("orient", "auto")
          .append("path")
            .attr("d", "M0,-5L10,0L0,5")
            .attr("class","arrowHead");

    });
}
