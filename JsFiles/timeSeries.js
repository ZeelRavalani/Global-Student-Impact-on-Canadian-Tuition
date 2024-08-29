function createTuitionTimeSeriesChart(elementId, studentType, csvFilePath) {
    // Read the CSV data
    d3.csv(csvFilePath).then(function(data) {
        // Filter the data based on student type and years
        const filteredData = data.filter(d => {
            if (studentType === 'graduate') {
                return d['Level of study'] === 'International graduate';
            } else if (studentType === 'undergraduate') {
                return d['Level of study'] === 'International undergraduate';
            }
        }).filter(d => d['REF_DATE'] >= '2015/2016' && d['REF_DATE'] <= '2023/2024');

        // Convert the filtered data into the format required for D3.js visualization
        const provinceData = {};
        const years = [];
        filteredData.forEach(d => {
            if (d['GEO'] !== 'Canada') {
                if (!provinceData[d['GEO']]) {
                    provinceData[d['GEO']] = [];
                }
                const year = d['REF_DATE'].split('/')[0];
                if (!years.includes(year)) {
                    years.push(year);
                }
                provinceData[d['GEO']].push({ year, value: +d['VALUE'] }); // Convert value to number
            }
        });

        const maxTuition2023 = d3.max(Object.values(provinceData).map(d => d[d.length - 1].value)); // Max tuition fee in 2023

        const colorScale = d3.scaleLinear()
                            .domain([0, maxTuition2023])
                            .range(["#FFBB46", "#581845"]); // Range from #FFBB46 to a darker shade

        const svg = d3.select(`#${elementId}`);
        const margin = {top: 80, right: 150, bottom: 50, left: 75}; // Increased top margin for legend
        const width = +svg.attr("width") - margin.left - margin.right;
        const height = +svg.attr("height") - margin.top - margin.bottom;
        const g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        const x = d3.scalePoint().domain(years).range([0, width]);
        const y = d3.scaleLinear().domain([0, d3.max(Object.values(provinceData).map(d => d3.max(d.map(entry => entry.value))))])
                    .range([height, 0]);

        const line = d3.line()
            .x((d, i) => x(d.year))
            .y(d => y(d.value));

        Object.keys(provinceData).forEach(province => {
            g.append("path")
                .datum(provinceData[province])
                .attr("class", "province-line") // Add class for selection
                .attr("data-province", province) // Add data attribute for identification
                .attr("fill", "none")
                .attr("stroke", getColor(provinceData[province][provinceData[province].length - 1].value))
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("stroke-width", 3.5)
                .attr("d", line)
                .on("mouseover", function(event, d) {
                    const provinceName = province;
                    const mouseX = event.pageX + 10;
                    const mouseY = event.pageY - 28;
                    d3.select(".tooltip")
                        .style("opacity", .9)
                        .style("left", mouseX + "px")
                        .style("top", mouseY + "px")
                        .html(`<strong>${provinceName}</strong>`);
                    // Highlight selected line
                    d3.selectAll('.province-line').attr('opacity', 0.1); // Reduce opacity of all lines
                    d3.select(this).attr('opacity', 1); // Highlight selected line
                })
                .on("mouseout", function() {
                    d3.select(".tooltip")
                        .style("opacity", 0);
                    // Restore opacity of all lines
                    d3.selectAll('.province-line').attr('opacity', 1);
                });
        });

        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .append("text")
            .attr("x", width / 2)
            .attr("y", 40)
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "middle")
            .text("Year");

        g.append("g")
            .call(d3.axisLeft(y))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 20)
            .attr("x", -height / 2)
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "middle")
            .text("Tuition Fee");

        const legendData = Object.keys(provinceData).map(province => ({
            province,
            tuition: provinceData[province][provinceData[province].length - 1].value
        }));
        legendData.sort((a, b) => b.tuition - a.tuition);

        const legend = g.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "start")
            .selectAll("g")
            .data(legendData)
            .join("g")
            .attr("class", "legend-item") // Add class for selection
            .attr("transform", (d, i) => "translate(" + (width + 20) + "," + (i * 20) + ")")
            .on("mouseover", function(event, d) {
                const selectedProvince = d.province;
                // Highlight selected line
                d3.selectAll('.province-line').attr('opacity', function() {
                    return d3.select(this).attr("data-province") === selectedProvince ? 1 : 0.1;
                });
            })
            .on("mouseout", function() {
                // Restore opacity of all lines
                d3.selectAll('.province-line').attr('opacity', 1);
            });

        legend.append("rect")
            .attr("x", 0)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", d => colorScale(d.tuition));

        legend.append("text")
            .attr("x", 24)
            .attr("y", 9.5)
            .attr("dy", "0.35em")
            .text(d => d.province);

        function getColor(tuition) {
            return colorScale(tuition) || 'grey';
        }
    });
}

// Usage example:
createTuitionTimeSeriesChart("IntGradTuitionChart", "graduate", "./DataSet/canadian_tution.csv");
createTuitionTimeSeriesChart("IntUndergradTuitionChart", "undergraduate", "./DataSet/canadian_tution.csv");
