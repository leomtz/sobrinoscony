import * as d3 from 'd3';
// d3.select('body');
var width = 960;
var height = 480;
var svg = d3.select('body')
    .append("svg")
    .attr("width", width)
    .attr("height", height);
var plotMargins = {
    top: 30,
    bottom: 30,
    left: 150,
    right: 30
};
var plotGroup = svg.append("g")
    .classed("plot", true)
    .attr("transform", "translate(" + plotMargins.left + ", " + plotMargins.top + ")");
var plotWidth = width - plotMargins.left - plotMargins.right;
var plotHeight = height - plotMargins.top - plotMargins.bottom;
var xScale = d3.scaleTime()
    .range([0, plotWidth]);
var xAxis = d3.axisBottom(xScale);
var xAxisGroup = plotGroup.append('g')
    .classed('x', true)
    .classed('axis', true)
    .attr('transform', "translate(" + 0 + "," + plotHeight + ")")
    .call(xAxis);
var yScale = d3.scaleLinear()
    .range([plotHeight, 0]);
var yAxis = d3.axisLeft(yScale);
var yAxisGroup = plotGroup.append('g')
    .classed('y', true)
    .classed('axis', true)
    .call(yAxis);
var pointsGroup = plotGroup.append('g')
    .classed('points', true);
d3.json('https://api.reddit.com')
    .then(function (data) {
    // console.log(response);
    var prepared = data.data.children.map(function (d) {
        return {
            date: new Date(d.data.created * 1000),
            score: d.data.score,
            link: d.data.permalink
        };
    });
    console.log(prepared);
    xScale.domain(d3.extent(prepared, function (d) { return d.date; }))
        .nice();
    xAxisGroup.call(xAxis);
    yScale.domain(d3.extent(prepared, function (d) { return d.score; }))
        .nice();
    yAxisGroup.call(yAxis);
    var dataBound = pointsGroup.selectAll('.post')
        .data(prepared);
    // delete extra points
    dataBound
        .exit()
        .remove();
    // add new points
    var enterSelection = dataBound
        .enter()
        .append('g')
        .classed('post', true);
    // update all existing points
    enterSelection.merge(dataBound)
        .attr('transform', function (d, i) { return "translate(" + xScale(d.date) + "," + yScale(d.score) + ")"; });
    enterSelection.append('a')
        .attr("xlink:href", function (d, i) { return "https://www.reddit.com" + d.link; })
        .attr("cursor", "pointer")
        .append('circle')
        .attr('r', 5)
        .style('fill', 'red');
});
//     (error,data) =>{
//     if (error) {
//         console.error(error);
//     } else {
//         
//     }
// })
//# sourceMappingURL=app.js.map