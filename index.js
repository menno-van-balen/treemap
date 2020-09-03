// data
const kickStarterUrl =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json";

// set dimensions and margins of the graph and treemap padding
let margin = { top: 10, right: 10, bottom: 10, left: 10 };
let width = 1000;
let height = 800;
let treemapPadding = 2;

// set dimensions and margins of legend
let leggendwidth = 1000;
// let leggendHeight = 500;
let size = 20;
let leggendPadding = size / 4;

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
    "#e3badd",
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

// append svg for treemap to body of page
const svgTreemap = d3
  .select(".map-container")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// fetch json data
d3.json(kickStarterUrl).then(createMap);

function createMap(data, error) {
  if (error) console.error();
  // console.log(data.children);

  // legend
  let rows = 5;

  const itemsPerRow = Math.ceil(data.children.length / rows);
  const legendHeight = itemsPerRow * (size + leggendPadding);

  // append svg for legend to body of page
  const svgLegend = d3
    .select(".legend-container")
    .append("svg")
    .attr("id", "legend")
    .attr("width", width)
    .attr("height", legendHeight);

  const legend = svgLegend
    .selectAll("g")
    .data(data.children)
    .enter()
    .append("g")
    .attr("class", "legend-item")
    .attr("transform", function (d, i) {
      const y = (i % itemsPerRow) * (size + leggendPadding);
      const x = Math.floor(i / itemsPerRow) * (width / rows) + leggendPadding;
      return `translate(${x}, ${y})`;
    });

  legend
    .append("rect")
    .attr("width", size)
    .attr("height", size)
    .attr("fill", function (d, i) {
      return color(d.name);
    });

  legend
    .append("text")
    .text(function (d) {
      return d.name;
    })
    .attr("x", leggendPadding + size)
    .attr("y", 0.8 * size);

  // give data to this cluster layout:
  const root = d3.hierarchy(data).sum(function (d) {
    return d.value;
  }); // size of each leave is given in the 'value' field in input data

  // d3.treemap computes the position of each element of the hierarchy and calls it
  d3.treemap().size([width, height]).padding(treemapPadding)(root);

  // define the leaves
  const leave = svgTreemap
    .selectAll("g")
    .data(root.leaves())
    .enter()
    .append("g")
    .attr("transform", function (d) {
      return "translate(" + d.x0 + "," + d.y0 + ")";
    })
    .on("mousemove", function (d, i) {
      let mouseX = event.clientX;
      let mouseY = event.clientY;
      tooltip.transition().duration(500).style("opacity", 0.9);
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
    })
    .on("mouseout", function (d) {
      tooltip.transition().duration(200).style("opacity", 0);
    });

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
    .attr("y", 12)
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
      let text = d3.select(this);
      let width = text.attr("width") - 7; // a bit extra padding
      let hight = text.attr("hight") - 2;
      let words = text.text().split(/\s+/).reverse();
      let word = null;
      let line = [];
      let x = text.attr("x");
      let dy = text.attr("y");
      let tHight = +dy;
      let tspan = text.text(null).append("tspan");

      while ((word = words.pop())) {
        line.push(word);
        tspan.text(line.join(" "));

        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan").attr("x", x).attr("dy", dy).text(word);
          tHight = tHight + +dy;
          if (tspan.node().getComputedTextLength() > width) {
            tspan.style(
              "font-size",
              (width / tspan.node().getComputedTextLength()) * 12
            );
          }
          if (tHight > hight - dy) return;
        }
      }
    });
  }
}
