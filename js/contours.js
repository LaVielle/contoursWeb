
function drawContours(){
  console.log("contours.js -running...")

  var data = blobMap;

  // Add a "cliff edge" to force contour lines to close along the border.
  var cliff = -1000;
  data.push(d3.range(data[0].length).map(function() { return cliff; }));
  data.unshift(d3.range(data[0].length).map(function() { return cliff; }));
  data.forEach(function(d) {
    d.push(cliff);
    d.unshift(cliff);
  });

  var c = new Conrec,
      xs = d3.range(0, data.length),
      ys = d3.range(0, data[0].length),
      zs = d3.range(0, 1, 1),
      width = canvas.width,
      height = canvas.height,
      x = d3.scaleLinear().range([width, 0]).domain([data.length, 0]),
      y = d3.scaleLinear().range([height, 0]).domain([data[0].length, 0]),
      colours = d3.scaleLinear().domain([-5, 3]).range(["#fff", "red"]);

  c.contour(data, 0, xs.length - 1, 0, ys.length - 1, xs, ys, zs.length, zs);

  d3.select("#main").append("svg")
      .attr("width", width)
      .attr("height", height)
    .selectAll("path")
      .data(c.contourList())
    .enter().append("path")
      //.style("fill",function(d) { return colours(d.level);})
      //.style("fill", "white")
      .style("stroke","red")

      .style("stroke-width", 2)
      .style("fill", "none")

      .attr("d", d3.line()
        .x(function(d) { return x(d.x); })
        .y(function(d) { return y(d.y); }));

  console.log("contours.js -done")
}