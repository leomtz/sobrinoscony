import * as d3 from 'd3';
// Initial canvas and plot configuration
var width = 1000;
var height = 465;
var svg = d3.select('#data')
    .append("svg")
    .attr("width", width)
    .attr("height", height);
var plotMargins = {
    top: 50,
    bottom: 15,
    left: 300,
    right: 300
};
var colors = ["hsl(0,100%,60%)", "hsl(52,100%,60%)", "hsl(104,100%,60%)", "hsl(156,100%,60%)", "hsl(208,100%,60%)", "hsl(260,100%,60%)", "hsl(312,100%,60%)"];
var plotGroup = svg.append("g")
    .classed("plot", true)
    .attr("transform", "translate(" + plotMargins.left + ", " + plotMargins.top + ")");
var plotWidth = width - plotMargins.right - plotMargins.right;
var plotHeight = height - plotMargins.top - plotMargins.bottom;
var xScale = d3.scaleLinear()
    .range([0, plotWidth])
    .domain([0, 27]);
var yScale = d3.scaleLinear()
    .range([plotHeight, 0])
    .domain([0, 28]);
var pointsGroup = plotGroup.append('g')
    .classed('points', true);
var legendsGroup = svg.append('g')
    .classed('legends', true)
    .attr('transform', "translate(" + plotMargins.left + ",10)");
var legends = [{ x: 0, leg: "= 100 becarios" }];
//Initial fetch
d3.json("/pairs.json").then(function (data) {
    var prepared = data.map(function (d) {
        return {
            x: d.x,
            y: d.y,
            estado: d.estado,
            estado_id: d.estado_id,
            area: d.area,
            area_id: d.area_id,
            grado: d.grado,
            grado_id: d.grado_id,
            s_year: d.s_year,
            e_year: d.e_year,
            s_year_id: d.s_year_id,
            e_year_id: d.e_year_id
        };
    });
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
    enterSelection.merge(dataBound)
        .attr('transform', function (d, i) { return "translate(0, " + yScale(d.y) + ")"; });
    var rects = enterSelection.append('rect')
        .attr('height', 12)
        .attr('width', 12)
        .classed('becario', true)
        .style('fill', "rgb(60,60,60)")
        .style('stroke-width', '0');
    enterSelection.merge(dataBound)
        .transition()
        .delay(500)
        .duration(1000)
        .attr('transform', function (d, i) { return "translate(" + xScale(d.x) + ", " + yScale(d.y) + ")"; });
    function index() {
        legends = [{ x: 0, leg: "~ 100 becarios" }];
        legendsGroup.selectAll(".leg").remove();
        var legendsBound = legendsGroup.selectAll(".leg")
            .data(legends);
        legendsBound
            .exit()
            .remove();
        var enterLegends = legendsBound
            .enter()
            .append('g')
            .classed('leg', true);
        enterLegends.append("rect")
            .attr('x', function (d) { return d.x; })
            .attr('y', 20)
            .attr('height', 12)
            .attr('width', 12)
            .classed('becario', true)
            .style('fill', "rgb(60,60,60)")
            .style('stroke-width', '0');
        enterLegends.append("text")
            .text(function (d) { return d.leg; })
            .attr("x", function (d) { return d.x + 20; })
            .attr("y", 32)
            .classed('label', true);
        rects.transition()
            .duration(1000)
            .attr('transform', function (d) { return "translate(0, 0)"; })
            .style('fill', "rgb(60,60,60)");
    }
    index();
    d3.select('#porGrado').on("click", function () {
        var offSetX = d3.scaleLinear()
            .range([-180, 180])
            .domain([0, 3]);
        legends = [{ x: -140, leg: "Maestría" }, { x: 150, leg: "Doctorado" }, { x: 330, leg: "Especialización" }, { x: 480, leg: "Estancia" }];
        legendsGroup.selectAll(".leg").remove();
        var legendsBound = legendsGroup.selectAll(".leg")
            .data(legends);
        legendsBound
            .exit()
            .remove();
        var enterLegends = legendsBound
            .enter()
            .append('g')
            .classed('leg', true);
        enterLegends.append("rect")
            .attr('x', function (d) { return d.x; })
            .attr('y', 20)
            .attr('height', 12)
            .attr('width', 12)
            .classed('becario', true)
            .style('fill', function (d, i) { return colors[i]; })
            .style('stroke-width', '0');
        enterLegends.append("text")
            .text(function (d) { return d.leg; })
            .attr("x", function (d) { return d.x + 20; })
            .attr("y", 32)
            .classed('label', true);
        rects.transition()
            .duration(1000)
            .attr('transform', function (d) { return "translate(" + (offSetX(d.grado_id) - 50) + ", 0)"; })
            .style('fill', function (d) { return colors[d.grado_id]; });
    });
    d3.select('#porArea').on("click", function () {
        var offSetX = d3.scaleLinear()
            .range([-180, 180])
            .domain([0, 6]);
        legends = [
            { x: -240, leg: "Físico-Matemática" },
            { x: -160, leg: "Biología y Química" },
            { x: -60, leg: "Medicina y C. Salud" },
            { x: 30, leg: "Humanidades y C. Conducta" },
            { x: 200, leg: "Ciencias Sociales" },
            { x: 280, leg: "Biotecnología y C. Agropecuarias" },
            { x: 480, leg: "Ingenierías" }
        ];
        legendsGroup.selectAll(".leg").remove();
        var legendsBound = legendsGroup.selectAll(".leg")
            .data(legends);
        legendsBound
            .exit()
            .remove();
        var enterLegends = legendsBound
            .enter()
            .append('g')
            .classed('leg', true);
        enterLegends.append("rect")
            .attr('x', function (d) { return d.x; })
            .attr('y', function (d, i) { return 30 * (i % 2); })
            .attr('height', 12)
            .attr('width', 12)
            .classed('becario', true)
            .style('fill', function (d, i) { return colors[i]; })
            .style('stroke-width', '0');
        enterLegends.append("text")
            .text(function (d) { return d.leg; })
            .attr("x", function (d) { return d.x + 20; })
            .attr("y", function (d, i) { return 30 * (i % 2) + 12; })
            .classed('label', true);
        rects.transition()
            .duration(2500)
            .ease(d3.easeElastic)
            .attr('transform', function (d) { return "translate(" + offSetX(d.area_id) + ", 0)"; })
            .style('fill', function (d) { return colors[d.area_id]; });
    });
    d3.select('#porInicio').on("click", function () {
        var offSetX = d3.scaleLinear()
            .domain([0, 6])
            .range([-240, 240]);
        // var colorScale=d3.scaleLinear()
        //     .domain([0,6])
        //     .range([0,360])
        legends = [
            { x: -240, leg: "2012 -" },
            { x: -160, leg: "2013" },
            { x: -64, leg: "2014" },
            { x: 40, leg: "2015" },
            { x: 214, leg: "2016" },
            { x: 426, leg: "2017 +" }
        ];
        legendsGroup.selectAll(".leg").remove();
        var legendsBound = legendsGroup.selectAll(".leg")
            .data(legends);
        legendsBound
            .exit()
            .remove();
        var enterLegends = legendsBound
            .enter()
            .append('g')
            .classed('leg', true);
        enterLegends.append("rect")
            .attr('x', function (d) { return d.x; })
            .attr('y', 20)
            .attr('height', 12)
            .attr('width', 12)
            .classed('becario', true)
            .style('fill', function (d, i) { return colors[i]; })
            .style('stroke-width', '0');
        enterLegends.append("text")
            .text(function (d) { return d.leg; })
            .attr("x", function (d) { return d.x + 20; })
            .attr("y", function (d, i) { return 32; })
            .classed('label', true);
        rects.transition()
            .duration(1000)
            .attr('transform', function (d) { return "translate(" + offSetX(d.s_year_id) + ", 0)"; })
            .style('fill', function (d) { return colors[d.s_year_id]; });
    });
    d3.select('#porFin').on("click", function () {
        var offSetX = d3.scaleLinear()
            .domain([0, 6])
            .range([-240, 240]);
        // var colorScale=d3.scaleLinear()
        //     .domain([0,6])
        //     .range([0,360])
        legends = [
            { x: -240, leg: "2016 -" },
            { x: -160, leg: "2017" },
            { x: 40, leg: "2018" },
            { x: 240, leg: "2019" },
            { x: 420, leg: "2020" },
            { x: 530, leg: "2021 +" }
        ];
        legendsGroup.selectAll(".leg").remove();
        var legendsBound = legendsGroup.selectAll(".leg")
            .data(legends);
        legendsBound
            .exit()
            .remove();
        var enterLegends = legendsBound
            .enter()
            .append('g')
            .classed('leg', true);
        enterLegends.append("rect")
            .attr('x', function (d) { return d.x; })
            .attr('y', 20)
            .attr('height', 12)
            .attr('width', 12)
            .classed('becario', true)
            .style('fill', function (d, i) { return colors[i]; })
            .style('stroke-width', '0');
        enterLegends.append("text")
            .text(function (d) { return d.leg; })
            .attr("x", function (d) { return d.x + 20; })
            .attr("y", function (d, i) { return 32; })
            .classed('label', true);
        rects.transition()
            .duration(1000)
            .attr('transform', function (d) { return "translate(" + offSetX(d.e_year_id) + ", 0)"; })
            .style('fill', function (d) { return colors[d.e_year_id]; });
    });
    d3.select('#todos').on("click", index);
});
//# sourceMappingURL=app.js.map