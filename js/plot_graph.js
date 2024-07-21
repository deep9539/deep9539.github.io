function updateUnemploymentGraph(filterDate) {
    // Load the CSV data
    d3.csv("unemployment_rate_us_and_california.csv").then(function(data) {
        // Parse the date
        data.forEach(d => {
            d.Date = d3.timeParse("%Y/%m")(d.Date);
            d.UnemploymentRate = +d.UnemploymentRate; // Ensure rate is a number
        });

        // Get the full time range for the x-axis and the full range for the y-axis
        const fullDateRange = d3.extent(data, d => d.Date);
        const fullYRange = [0, d3.max(data, d => d.UnemploymentRate)];

        // Filter the data for the line
        const filteredData = data.filter(d => d.Date <= d3.timeParse("%Y/%m")(filterDate));

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

        // Add the line
        svg.append("path")
            .datum(filteredData)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(d => x(d.Date))
                .y(d => y(d.UnemploymentRate))
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
                const focusY = y(d.UnemploymentRate);

                focus.attr("transform", `translate(${focusX},${focusY})`);
                focus.select(".tooltip-bg")
                    .attr("x", 10)
                    .attr("y", -25);

                focus.select(".tooltip-date")
                    .text(`Date: ${d3.timeFormat("%Y/%m")(d.Date)}`);

                focus.select(".tooltip-rate")
                    .text(`Seasonally Adjusted Rate: ${d.UnemploymentRate}`);

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
    });
}
