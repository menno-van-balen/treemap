// data
const kickStarterUrl =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json";

// set dimensions and margins of the graph and treemap padding
let margin = { top: 10, right: 10, bottom: 10, left: 10 };
let width = 1000 - margin.left - margin.right;
let height = 800 - margin.top - margin.bottom;
let treemapPadding = 2;

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

// append svg object to the body of the page
const svgTreemap = d3
  .select(".map-container")
  .append("svg")
  .attr("width", width)
  .attr("height", height);
// .append("g")
// .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// fetch json data
d3.json(kickStarterUrl).then(createMap);

function createMap(data, error) {
  if (error) console.error();

  // give data to this cluster layout:
  const root = d3.hierarchy(data).sum(function (d) {
    return d.value;
  }); // size of each leave is given in the 'value' field in input data

  // d3.treemap computes the position of each element of the hierarchy and calls it
  d3.treemap().size([width, height]).padding(treemapPadding)(root);

  // define the leaves
  const leaf = svgTreemap
    .selectAll("g")
    .data(root.leaves())
    .enter()
    .append("g")
    .attr("transform", function (d) {
      return "translate(" + d.x0 + "," + d.y0 + ")";
    });

  // create the leaves
  leaf
    .append("rect")
    .attr("width", function (d) {
      return d.x1 - d.x0;
    })
    .attr("height", function (d) {
      return d.y1 - d.y0;
    })
    // .style("stroke", "black")
    .attr("fill", (d) => {
      return color(d.data.category);
    })
    .attr("class", "tile")
    .attr("data-category", (d) => d.data.category)
    .attr("data-name", (d) => d.data.name)
    .attr("data-value", (d) => d.data.value);

  leaf
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
    .call(wrap);

  function wrap(text) {
    text.each(function () {
      let text = d3.select(this),
        width = text.attr("width") - 5,
        hight = text.attr("hight"),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        x = text.attr("x"),
        dy = text.attr("y"),
        tHight = dy,
        tspan = text.text(null).append("tspan");
      // tspan.style("font-size", 12);

      // console.log(width);

      while ((word = words.pop())) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          // if (tHight < hight - dy) break;
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan").attr("x", x).attr("dy", dy).text(word);
          tHight = tHight + dy;
          if (tspan.node().getComputedTextLength() > width) {
            tspan.style(
              "font-size",
              (width / tspan.node().getComputedTextLength()) * 10
            );
          }
        }
        // console.log(this.getComputedTextLength());
      }
      // tspan.each(function () {
      //   console.log(width);
      //   tspan.style("font-size", (width / this.getComputedTextLength()) * 5);
      // });
    });
  }
}
