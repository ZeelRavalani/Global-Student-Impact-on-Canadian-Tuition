Running HTML File with d3v7.js using WAMP Server

This readme will explain you how to run the provided HTML file which utilizes d3v7.js library with a WAMP server. 
The HTML file contains multiple SVG visualizations, each powered by separate JavaScript files.

Prerequisites:

- WAMP server installed on your system.
- Basic understanding of WAMP server configuration.
- Basic knowledge of HTML, CSS, and JavaScript.

Instructions:

1. Download the Required Files:
    - Download the HTML file (index.html) and all associated JavaScript files (donutViz.js, imageLegendViz.js, percentageViz.js, horizontalBarViz.js, verticalBarViz.js, threeDonutViz.js, fourRingsViz.js).

2. Create a Virtual Host in WAMP Server:
    - Give the path of the directory in your system where all your code lies.
    - Give host name of your desire (I gave 'visualcode')

3. Start WAMP Server:
    - Start the WAMP server from its control panel or through the command line.

4. Access the HTML File:
    - Open a web browser and navigate to http://projectcode/index.html or projectcode/ (in Chrome browser).

5. View SVG Visualizations:
    - Once the HTML file loads, you should see the SVG visualizations rendered on the page.

6. Interact with SVG Visualizations:
    - Explore each visualization by interacting with them as desired.

Notes:

- Ensure that all file paths within the HTML file are correctly set based on their location in the WAMP server directory.
- Make sure that the WAMP server is properly configured and running to serve the HTML file and associated resources.



Additional Interactivity and Animations:

1. worldMap.js:
    - Interactivity
        - Mouseover: When hovering over a country on the map, a tooltip appears displaying the country name and student inflow for the selected year.
        - Year slider: A slider allows users to select a year, which updates the map to reflect student inflow for that year. The selected year is displayed in a label next to the slider.
    - Animation
        - Transitions are used to smoothly change the fill color of countries when the year is changed using the slider.

2. canadaMap.js:
    - Interactivity 
        - Mouseover: When hovering over a province on the map, a tooltip appears displaying the province name and student intake for the selected year.
        - Year slider: A slider allows users to select a year, which updates the map to reflect student intake for that year. The selected year is displayed in a label next to the slider.
    - Animation
        - Transitions are used to smoothly change the fill color of provinces when the year is changed using the slider.

3. timeSeries.js:
    - Interactivity
        - Mouseover: When hovering over a line on the chart, a tooltip appears displaying the province name.
        - Mouseover/out: Highlighting behavior is implemented where hovering over a line increases its opacity while reducing the opacity of other lines. This helps users focus on the selected province's time series data.
        - Legend: Hovering on a legend item highlights the corresponding line on the chart.
    - Animation
        - None.

