// Define global variables
let selectedYear = "2015";
const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// Function to create and update a choropleth map
function createMap(mapId, dataPath, dataType, title) {
    console.log("Loading data for", dataType);
   
    // Load data
    d3.csv("./DataSet/Internation_students_Province_Canada.csv").then(function(csvData) {
    console.log("CSV data loaded:", csvData);

        d3.json(dataPath).then(function(geoData) {
            console.log("GeoJSON data loaded:", geoData);

            // Data normalization
            const years = ["2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023"];

            // Create map projection
            const projection = d3.geoMercator()
                .fitSize([window.innerWidth / 2, window.innerHeight - 100], geoData);

            // Append SVG element to hold the map
            const svg = d3.select("#" + mapId)
                .attr("width", (window.innerWidth - 300) / 2) // Adjust width for each map
                .attr("height", window.innerHeight - 100)
                .style("position", "absolute")
                .style("top", "95px") // Adjust top positioning to leave space for the title (optional)
                .style("left", mapId === "maleMap" ? "11%" : "50%") // Position maps side-by-side
                // .style("width", "100%")
                // .style("height", "calc(100% - 110px)");

            // Append SVG element for the title
            const titleSvg = d3.select("#" + mapId + "-title")
                .attr("width", (window.innerWidth - 300) / 2) // Adjust width for each  map
                .attr("height", 50) // Adjust height for the title SVG
                .style("position", "absolute")
                .style("top", "50px") // Adjust top position relative to mapSvg
                .style("left", mapId === "maleMap" ? "11%" : "50%"); // Position title SVG relative to mapSvg

            // Append title text for each map within the title SVG
            titleSvg.append("text")
                .attr("x", "65%") // Center the title horizontally
                .attr("y", "50%") // Center the title vertically
                .attr("text-anchor", "middle")
                .attr("fill", "black") // Adjust font color
                .style("font-size", "30px")
                .style("font-weight", "bold")
                .text(title);

            // Create group element to contain map elements
            const mapGroup = svg.append("g");

            // Create path generator
            const path = d3.geoPath().projection(projection);

            // Append paths for each province
            const provinces = mapGroup.selectAll("path")
                .data(geoData.features)
                .enter().append("path")
                .attr("d", path)
                .attr("stroke", "#fff") // Set stroke color
                .attr("class", "province")
                .attr("fill", "#CCC") // Set fill color to grey
                .on("mouseover", handleMouseOver)
                .on("mouseout", handleMouseOut);

            // Function to preprocess the province name
            function preprocessProvinceName(provinceName) {
                return provinceName.trim();
            }

            // Define the handleMouseOver function
            function handleMouseOver(event, d) {
            const provinceName = d.properties.name;
            const provinceData = csvData.find(row => row["Province/territory"] === provinceName && row["Sex"] === dataType);
            if (provinceData) {
                tooltip.transition()
                .duration(200)
                .style("opacity", .9);

                tooltip.html(`
                <strong>${provinceName}</strong><br>
                Students intake : ${provinceData[selectedYear]}<br>
                `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px")
                .style("font-size", "15px");
            }
            }

            // Define the handleMouseOut function
            function handleMouseOut() {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
            }

            // Progress bar (shared)
            const progressBar = document.getElementById("yearSlider");
            const yearLabel = document.getElementById("yearLabel");
            progressBar.addEventListener("input", function() {
                selectedYear = parseInt(this.value);
                yearLabel.innerText = `Year: ${selectedYear}`;
                updateMap(selectedYear, dataType); // Call updateMap function with data type
            });

            // Function to update map based on selected year
            function updateMap(selectedYear, dataType) {
                provinces.transition() // Apply transition to all provinces
                    .duration(750) // Set the duration of the transition
                    .delay((d, i) => i * 50) // Add delay based on index to transition provinces sequentially
                    .attr("fill", "#CCC") // Set initial fill color to default color
                    .transition() // Apply a second transition for changing the fill color
                    .duration(750) // Set the duration of the transition
                    .attr("fill", function(d) {
                    const provinceName = d.properties.name;
                    const preprocessedProvinceName = preprocessProvinceName(provinceName);
                    // Filter the CSV data based on province name and selected gender
                    const provinceData = csvData.find(province => {
                        return (
                            preprocessProvinceName(province["Province/territory"]) === preprocessedProvinceName &&
                            province["Sex"] === dataType
                        );
                    });
                    // const provinceData = csvData.find(province => preprocessProvinceName(province["Province/territory"]) === preprocessedProvinceName);
                    if (provinceData && provinceData[selectedYear] !== "0") {
                        console.log(selectedYear + "-" + dataType +" provinceData: " + provinceData[selectedYear])
                        // Remove commas from the data and parse it as integer
                        const studentCount = parseInt(provinceData[selectedYear].replace(/,/g, ""));
                
                        // Implement color logic based on student count and data type (consider dynamic thresholds or predefined colors)
                        return getColor(studentCount, selectedYear, dataType);  // Call getColor function with student count and data type
                    } else {
                        return "#ccc"; // Default color for provinces with no data
                    }
                });
            }

            // Function to calculate color based on student count
            function getColor(count, year, dataType) {
                // Calculate dynamic thresholds for the selected year
                const thresholds = calculateDynamicThresholds(year, dataType);
                console.log(dataType + "-" + year + ":" + thresholds)
                console.log(dataType + "-" + year + " count:" + count)

                 // Check if count is 0, return "No Inflow" color
                if (count === 0) {
                    return legendData[0].color;
                }

                // Iterate through thresholds to find the appropriate color based on the count
                for (let i = 0; i < thresholds.length; i++) {
                    if (count > thresholds[i] && (i === thresholds.length - 1 || count <= thresholds[i + 1])) {
                        if (i < legendData.length - 1) {
                            return legendData[i + 1].color;
                        } else {
                            return legendData[legendData.length - 1].color;
                        }
                    }
                }

                // If count exceeds the last threshold, return the color for "Exceptional Inflow"
                return legendData[thresholds.length - 1].color;
            }

            function calculateDynamicThresholds(year, dataType) {
                const data = csvData.filter(row => row.Sex === dataType);
                const values = data.map(row => parseInt(row[year].replace(/,/g, ""))).filter(value => !isNaN(value)); // Filter out NaN values
                const highest = Math.max(...values);
                const range = highest; // Extend the range to include the highest value
                const interval = range / 6; // Adjust the number of thresholds as needed
                const thresholds = [];
                for (let i = 0; i <= 5; i++) {
                    thresholds.push(interval * i);
                }
                thresholds.push(range); // Add the highest value as the last threshold
                return thresholds;
            }

            // Update the map initially for the selected year
            updateMap(selectedYear, dataType);

        }).catch(function(error) {
            console.log("Error loading GeoJSON data:", error);
        });
    }).catch(function(error) {
        console.log("Error loading CSV data:", error);
    });
}

// Call the createMap function for both male and female maps
createMap("maleMap", "./JsonFiles/canada.geojson", "Male", "Male Student Intake in Canada");
createMap("femaleMap", "./JsonFiles/canada.geojson", "Female", "Female Student Intake in Canada");

// Define legend colors and corresponding labels
const legendData = [
    { color: "#CCC", label: "No Inflow" },
    { color: "#FFBB46", label: "Minimal Inflow" },
    { color: "#FF5733", label: "Moderate Inflow" },
    { color: "#C70039", label: "Significant Inflow" },
    { color: "#900C3F", label: "Substantial Inflow" },
    { color: "#581845", label: "Exceptional Inflow" }
]; // Adjust colors and labels as needed

// Append SVG element for legend inside legendContainer
const legend = d3.select("#legendContainer")
    .append("svg")
    .attr("class", "legend")
    .attr("width", 200)
    .attr("height", 200);

// Append legend items
const legendItems = legend.selectAll(".legend-item")
    .data(legendData)
    .enter().append("g")
    .attr("class", "legend-item")
    .attr("transform", (d, i) => `translate(0, ${i * 30})`); // Adjust spacing between legend items

// Append color indicators
legendItems.append("rect")
    .attr("width", 20) // Increase width for better visibility
    .attr("height", 20) // Increase height for better visibility
    .attr("fill", d => d.color);

// Append legend labels
legendItems.append("text")
    .attr("x", 30) // Adjust x position for better alignment
    .attr("y", 12) // Adjust y position for better alignment
    .attr("dy", "0.35em") // Adjust vertical alignment
    .style("font-size", "14px") // Adjust font size
    .text(d => d.label); // Use custom labels

// Function to reset slider and update map to initial state
function resetMap() {
    const progressBar = document.getElementById("yearSlider");
    progressBar.value = selectedYear;
    const yearLabel = document.getElementById("yearLabel");
    yearLabel.innerText = `Year: ${selectedYear}`;
    updateMap(selectedYear, dataType);
}

// Call resetMap function on page load
window.onload = resetMap;
    