// set dimensions and margins of the graph and treemap padding
// let margin = { top: 10, right: 10, bottom: 10, left: 10 };
let treemapWidth = 1000;
let TreemapHeight = 800;
let treemapPadding = 2;

// set dimensions and margins of legend
let legendRows = 7;
let legendRectSize = 20;

// data
const kickStarterUrl =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json";

const moviesUrl =
  "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json";

const videogameUrl =
  "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json";

// define colorscale
const color = d3
  .scaleOrdinal()
  .range([
    "#ffb41a",
    "#5f3de8",
    "#73de48",
    "#6a00c0",
    "#b1c700",
    "#aa00b7",
    "#00b960",
    "#d900bd",
    "#008f67",
    "#ff54c9",
    "#009dad",
    "#e25c00",
    "#017ff2",
    "#840e00",
    "#a378ff",
    "#7b4500",
    "#003d8e",
    "#f6b99b",
    "#800086",
    "#332123",
    "#ffa7fe",
    "#003e65",
    "#ff7cad",
    "#5d0031",
  ]);

// define div for tooltip
const tooltip = d3
  .select("body")
  .append("div")
  .attr("id", "tooltip")
  .style("opacity", 0);

// fetch json data and load content
function getData(url = kickStarterUrl) {
  d3.json(url).then(createMap);
  if (url == kickStarterUrl) {
    console.log("kick");
    document.getElementById("title").textContent = "Kickstarter Pledges";
    document.getElementById("discription").textContent =
      "Top 100 Most Pledged Kickstarter Campaigns Grouped By Category";
  }
  if (url == moviesUrl) {
    console.log("movie");
    document.getElementById("title").textContent = "Movies Sales";
    document.getElementById("discription").textContent =
      "Top 100 Highest Grossing Movies Grouped By Genre";
  }
  if (url == videogameUrl) {
    console.log("videogame");
    document.getElementById("title").textContent = "Videogame Sales";
    document.getElementById("discription").textContent =
      "Top 100 Most Sold Video Games Grouped by Platform";
  }
}

function createMap(data, error) {
  if (error) console.error();

  d3.selectAll("svg").remove();

  // legend
  const leggendPadding = legendRectSize / 4;
  const itemsPerRow = Math.ceil(data.children.length / legendRows);
  const legendHeight = itemsPerRow * (legendRectSize + leggendPadding);

  // append svg for legend to body of page
  const svgLegend = d3
    .select(".legend-container")
    .append("svg")
    .attr("id", "legend")
    .attr("width", treemapWidth)
    .attr("height", legendHeight);

  // append legend items
  const legend = svgLegend
    .selectAll("g")
    .data(data.children)
    .enter()
    .append("g")
    .attr("class", "legend-item")
    .attr("transform", function (d, i) {
      const y = (i % itemsPerRow) * (legendRectSize + leggendPadding);
      const x =
        Math.floor(i / itemsPerRow) * (treemapWidth / legendRows) +
        leggendPadding;
      return `translate(${x}, ${y})`;
    });

  legend
    .append("rect")
    .attr("width", legendRectSize)
    .attr("height", legendRectSize)
    .attr("fill", function (d, i) {
      return color(d.name);
    });

  legend
    .append("text")
    .text(function (d) {
      return d.name;
    })
    .attr("x", leggendPadding + legendRectSize)
    .attr("y", 0.8 * legendRectSize)
    .call(wrapLegendText);

  function wrapLegendText(text) {
    text.each(function () {
      const text = d3.select(this);
      const nodeWidth =
        treemapWidth / legendRows - legendRectSize - 2 * leggendPadding;
      const realWidth = text.node().getComputedTextLength();

      if (realWidth > nodeWidth) {
        text.style("font-size", (nodeWidth / realWidth) * 16);
      }
    });
  }

  // append svg for treemap
  const svgTreemap = d3
    .select(".map-container")
    .append("svg")
    .attr("width", treemapWidth)
    .attr("height", TreemapHeight);

  // give data to this cluster layout:
  const root = d3.hierarchy(data).sum(function (d) {
    return d.value;
  }); // size of each leave is given in the 'value' field in input data

  // d3.treemap computes the position of each element of the hierarchy and calls it
  d3.treemap().size([treemapWidth, TreemapHeight]).padding(treemapPadding)(
    root
  );

  // define the leaves
  const leave = svgTreemap
    .selectAll("g")
    .data(root.leaves())
    .enter()
    .append("g")
    .attr("class", "leave")
    .attr("transform", function (d) {
      return "translate(" + d.x0 + "," + d.y0 + ")";
    })
    .on("mouseover", updateTooltip)
    .on("mousemove", updateTooltip)
    .on("mouseout", function () {
      tooltip.transition().duration(200).style("opacity", 0);
    });

  function updateTooltip(d, i) {
    const mouseX = event.pageX;
    const mouseY = event.pageY;
    tooltip.transition().duration(300).style("opacity", 0.9);
    tooltip.attr("data-value", i.data.value);
    tooltip
      .html(
        "Category: " +
          i.data.category +
          "<br>" +
          "Name: " +
          i.data.name +
          "<br>" +
          "Value: " +
          i.data.value
      )
      .style("top", mouseY - 60 + "px")
      .style("left", mouseX + 10 + "px");
  }

  // create the leaves
  leave
    .append("rect")
    .attr("width", function (d) {
      return d.x1 - d.x0;
    })
    .attr("height", function (d) {
      return d.y1 - d.y0;
    })
    .style("stroke", "black")
    .attr("fill", (d) => {
      return color(d.data.category);
    })
    .attr("class", "tile")
    .attr("data-category", (d) => d.data.category)
    .attr("data-name", (d) => d.data.name)
    .attr("data-value", (d) => d.data.value);

  // append text with callback function
  leave
    .append("text")
    .attr("x", 5)
    .attr("y", 13)
    .text((d) => {
      return d.data.name;
    })
    .attr("width", function (d) {
      return parseInt(d.x1 - d.x0);
    })
    .attr("hight", function (d) {
      return parseInt(d.y1 - d.y0);
    })
    .call(wrapText);

  // function to wrap text horizontal and veritcal within the leaves
  // works best when font-size is set in css!
  function wrapText(text) {
    text.each(function () {
      const text = d3.select(this);
      const width = text.attr("width") - 7; // a bit extra padding
      const hight = text.attr("hight") - 2;
      let words = text.text().split(/\s+/).reverse();
      let word = null;
      let line = [];
      const x = text.attr("x");
      const dy = text.attr("y");
      let tHight = +dy;
      let tspan = text.text(null).append("tspan");

      while ((word = words.pop())) {
        line.push(word);
        tspan.text(line.join(" "));

        const realTspanWidth = tspan.node().getComputedTextLength();
        if (realTspanWidth > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan").attr("x", x).attr("dy", dy).text(word);
          tHight = tHight + +dy;
          if (realTspanWidth > width) {
            tspan.style("font-size", (width / realTspanWidth) * 12);
          }
          if (tHight > hight - dy) return;
        }
      }
    });
  }
}

getData();
