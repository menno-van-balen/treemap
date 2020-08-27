// data
const kickStarterUrl =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json";

// set dimensions and margins of the graph and treemap padding
let margin = { top: 10, right: 10, bottom: 10, left: 10 };
let width = 1000 - margin.left - margin.right;
let height = 800 - margin.top - margin.bottom;
let treemapPadding = 2;

// define color scale
const color = d3.scaleOrdinal(d3.schemeCategory10);

console.log(color);

// append svg object to the body of the page
const svgTreemap = d3
  .select(".map-container")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// fetch json data
d3.json(kickStarterUrl).then(createMap);

function createMap(data, error) {
  if (error) console.error();

  // give data to this cluster layout:
  const root = d3.hierarchy(data).sum(function (d) {
    return d.value;
  }); // size of each leave is given in the 'value' field in input data

  console.log(root);

  // d3.treemap computes the position of each element of the hierarchy and calls it
  d3.treemap().size([width, height]).padding(treemapPadding)(root);

  // define the leaves
  const leaf = svgTreemap.selectAll("rect").data(root.leaves()).enter();
  console.log(leaf);
  // create the leaves
  leaf
    .append("rect")
    .attr("x", function (d) {
      return d.x0;
    })
    .attr("y", function (d) {
      return d.y0;
    })
    .attr("width", function (d) {
      return d.x1 - d.x0;
    })
    .attr("height", function (d) {
      return d.y1 - d.y0;
    })
    .style("stroke", "black")
    .attr("fill", (d) => {
      while (d.depth > 1) d = d.parent;
      return color(d.data.name);
    })
    .attr("class", "tile")
    .attr("data-category", (d) => d.data.category)
    .attr("data-name", (d) => d.data.name)
    .attr("data-value", (d) => d.data.value);
  // .style("fill", "slateblue");
}
