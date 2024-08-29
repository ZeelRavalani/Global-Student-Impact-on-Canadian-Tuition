// Define global variables
let selectedYear = "2015";
window.tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Append title above the SVG
const title = d3.select("body")
    .append("h1")
    .text("Mapping Global Education: International Student Flows into Canada")
    .style("text-align", "center")
    .style("position", "absolute")
    .style("top", "10px") // Adjust the top position as needed
    .style("left", "50%")
    .style("transform", "translateX(-50%)");

// Load CSV data
console.log("Loading CSV data...");
d3.csv("./DataSet/international_students_inflow.csv").then(function(csvData) {
    console.log("CSV data loaded:", csvData);

    // Load GeoJSON data
    console.log("Loading GeoJSON data...");
    d3.json("./JsonFiles/countries.geojson").then(function(geoData) {
        console.log("GeoJSON data loaded:", geoData);

        // Exclude Antarctica from GeoJSON data
        geoData.features = geoData.features.filter(function(feature) {
            return feature.properties.ADMIN !== "Antarctica"; 
        });

        // Data normalization
        const years = ["2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023"];
        

        // Create map projection
        const projection = d3.geoMercator()
            .fitSize([window.innerWidth, window.innerHeight - 100], geoData);

        // Append SVG element to hold the map
        const svg = d3.select("#map")
            .attr("width", window.innerWidth)
            .attr("height", window.innerHeight - 100) // Reduce the height by 100 pixels (adjust as needed)
            .style("position", "absolute")
            .style("top", "110px") // Adjust top positioning to leave space for the title
            .style("left", "0")
            .style("width", "100%")
            .style("height", "calc(100% - 110px)"); // Adjust height to fit the remaining space after leaving space for the title


        // Create group element to contain map elements
        const mapGroup = svg.append("g");

        // Create path generator
        const path = d3.geoPath()
            .projection(projection);

        // Append paths for each country
        const countries = mapGroup.selectAll("path")
            .data(geoData.features)
            .enter().append("path")
            .attr("d", path)
            .attr("stroke", "#999") // Set stroke color
            .attr("class", "country")
            .attr("fill", "#CCC") // Set fill color to grey
            .on("mouseover", handleMouseOver) // Attach mouseover event
            .on("mouseout", handleMouseOut); // Attach mouseout event

        // Function to preprocess the country name
        function preprocessCountryName(countryName) {
            // console.log("countryName: ", countryName);
                return countryName.split(',')[0].trim();
        }


        // Define the handleMouseOver function
        function handleMouseOver(event, d) {
            const countryName = d.properties.ADMIN;
            const preprocessedCountryName = preprocessCountryName(countryName);
            // console.log("preprocessedCountryName: ", preprocessedCountryName);
            const countryData = csvData.find(country => preprocessCountryName(country["Country of Citizenship"]) === preprocessedCountryName);
            // console.log("countryData: " + JSON.stringify(countryData));
            if (countryData) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);

                tooltip.html(`
                    <strong>${countryName}</strong><br>
                    Students inflow: ${countryData[selectedYear]}<br>
                `)
                // Position the tooltip relative to the mouse cursor
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

        // Progress bar
        const progressBar = document.getElementById("progressBar");
        const yearSlider = document.getElementById("yearSlider");
        const yearLabel = document.getElementById("yearLabel");
        yearSlider.addEventListener("input", function() {
            selectedYear = parseInt(this.value);
            yearLabel.innerText = `Year: ${selectedYear}`;
            updateMap(selectedYear);
        });

        // Function to update map based on selected year
        function updateMap(selectedYear) {
            countries.transition() // Apply transition to all countries
                .duration(50) // Set the duration of the transition
                .delay((d, i) => i * 50) // Add delay based on index to transition countries sequentially
                .attr("fill", "#CCC") // Set initial fill color to default color
                .attr("stroke", "#999") // Set stroke color for all countries
                .transition() // Apply a second transition for changing the fill color
                .duration(50) // Set the duration of the transition
                .attr("fill", function(d) {
                const countryName = d.properties.ADMIN;
                const preprocessedCountryName = preprocessCountryName(countryName);
                // console.log("preprocessedCountryName: ", preprocessedCountryName);
                const countryData = csvData.find(country => preprocessCountryName(country["Country of Citizenship"]) === preprocessedCountryName);
                // console.log(`countryData for ${selectedYear} in ${countryName}: `, countryData);
                if (countryData && selectedYear in countryData) { // Check if selected year exists in country data
                    const count = +countryData[selectedYear];
                    // console.log("Count: ", count);
                    // Find the maximum count for the selected year
                    const maxCount = d3.max(csvData, d => +d[selectedYear] || 0);
                    const color = count ? getColor(count, maxCount) : "#ccc"; // Default color for countries with no data
                    // console.log("Color: ", color);
                    return color;
                } else {
                    return "#ccc"; // Default color for countries with no data for the selected year
                }
            })
            .attr("stroke", "#999"); // Set stroke color for all countries
        }

        // Call updateMap with default year (2015) upon first load
        updateMap(selectedYear);

        // Function to calculate color based on student count
        function getColor(count, maxCount) {
            const scale = d3.scaleLinear()
                .domain([0, maxCount / 4, maxCount / 2, (3 * maxCount) / 4, maxCount])
                .range(["#FFBB46", "#FF5733", "#C70039", "#900C3F", "#581845"]); // Change the range to your desired color scale

            return scale(count);
        }
    });
    
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

    
}).catch(function(error) {
    console.log("Error loading data: ", error);
});

// Function to reset slider and update map to initial state
function resetMap() {
    const progressBar = document.getElementById("yearSlider");
    progressBar.value = selectedYear;
    const yearLabel = document.getElementById("yearLabel");
    yearLabel.innerText = `Year: ${selectedYear}`;
    updateMap(selectedYear);
}

// Call resetMap function on page load
window.onload = resetMap;