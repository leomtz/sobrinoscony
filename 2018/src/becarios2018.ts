import * as d3 from 'd3';
import { pPoints } from './pairpoints';
import { pCaptions } from './pairpoints';
import { Country } from './pairpoints';

// We begin by fetching the data
var promisePoints = d3.json<Array<pPoints>>("/pairs2018.json");
var promiseStateInfo = d3.json<JSON>("/estados2018.json");
var promiseMap = d3.xml("mxalph.svg");
var promiseAll = Promise.all([promisePoints,promiseStateInfo,promiseMap]);

// Initial canvas and plot configuration
// This is _the_ canvas that we will use all along
// We can set this while the promises are resolved
var width = 1000;
var height = 480;
var svg = d3.select('#data')
    .append("svg")
    .attr("id","canvas")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "grey")

var colors=["hsl(0,100%,60%)", "hsl(52,100%,60%)", "hsl(104,100%,60%)","hsl(156,100%,60%)","hsl(208,100%,60%)","hsl(260,100%,60%)","hsl(312,100%,60%)"]
// var color_scale=d3.scaleLinear()
//     .domain([0,7])
//     .range([d3.hsl(0,1,0.6),d3.hsl(312,1,0.6)])

var xScale = d3.scaleLinear()
    .domain([0,27])
    .range([0,400]);

var yScale = d3.scaleLinear()
    .domain([0,27])
    .range([400,0]);

// Helpful line grids

// We manage views thorugh states. We start with a "squares state"
// Different states mean different widgets. In this context we will
// require that we have received all the data.

promiseAll.then((values:any[]) => {

    let JSONdata = values[0];
    let JSONstates = values[1];
    console.log(JSONdata)
    let XMLmap = values[2];
    var prepared : Array<pPoints> = JSONdata.map(function (d:pPoints) {
        return {
            x: d.x,
            y: d.y,
            estado: d.estado,
            estado_id: d.estado_id,
            area: d.area,
            area_id:d.area_id,
            grado: d.grado,
            grado_id:d.grado_id,
            s_year: d.s_year,
            e_year: d.e_year,
            s_year_id: d.s_year_id,
            e_year_id: d.e_year_id
        };
    });

    var preparedStates : Array<Country>= JSONstates.map(function (d:any) {
        return {
            name: d["name"],
            becarios: d["total"],
            grados: [d["2. MAE"], d["1. DOC"],d["3. ESP"],d["4. EST TEC"]],
            areas: [d['I. FISICO MATEMATICAS Y CS. DE LA TIERRA'],
                    d['II. BIOLOGIA Y QUIMICA'],
                    d['III. MEDICINA Y CS. DE LA SALUD'],
                    d['IV. HUMANIDADES Y CS. DE LA CONDUCTA'],
                    d['V. CIENCIAS SOCIALES'],
                    d['VI. BIOTECNOLOGIA Y CS. AGROPECUARIAS'],
                    d['VII. INGENIERIAS'],
                    ]
        };
    });

    var x;
    for (x=0;x<33;x++){
        var y=preparedStates[x]
        var x_grado = [[0,0],[0,0],[0,0],[0,0]]
        var x_area = [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]];
        var j
        for (j=0;j<4;j++){
                x_grado[j]=[d3.sum(y.grados.slice(0,j)),y.grados[j]]
            }
        var j
        for (j=0;j<7;j++){
                x_area[j]=[d3.sum(y.areas.slice(0,j)),y.areas[j]]
            }
        preparedStates[x].xGrados=x_grado;
        preparedStates[x].xAreas=x_area;
        console.log(x_area);
        console.log(x_grado);
        }

    console.log(preparedStates);
    
    var state = "none";
    // In the "squares state" we view data with squares and switch friendly
    // between states.

    function updateSquare(kind: string, legends : Array<pCaptions>){

        if (state!="squares"){
            console.log("State Squares")
            state="squares";
            d3.select("#canvas")
                .selectAll(".minicanvas")
                .remove();

            var miniCanvas=d3.select("#canvas")
                .append("g")    
                .attr("width", width)
                .attr("height", height)
                .classed("minicanvas",true);
        
            var squaresGroup = miniCanvas.append('g')
                .classed('sqGroup', true)    
                .attr("width", 400)
                .attr("height", 400)
                .attr("transform","translate(300,40)");

            var legendsGroup = miniCanvas.append('g')
                .classed("lgGroup", true)
                .attr("transform","translate(400,10)");

            var dataBound = squaresGroup.selectAll<SVGRectElement,{}>('rect')
                .data(prepared);

            var squares = dataBound
                .enter()
                .append('rect')
                    .attr('height', 12)
                    .attr('width', 12)
                    .classed('square',true)
                    .style('fill', "rgb(60,60,60)")
                    .style('stroke-width','0');
            
            squares.merge(dataBound)
                .attr('transform', d => `translate(0, ${yScale(d.y)})`);

            squares.transition()
                .transition()
                .delay(500)
                .duration(1000)
                .attr('transform', function (d,i) { return `translate(${xScale(d.x)}, ${yScale(d.y)})`; });
        }
        //Clear old legends

        //Get refs again
        var miniCanvas = d3.select<SVGGElement,{}>(".minicanvas")
        var squares = miniCanvas.select<SVGGElement>('.sqGroup').selectAll<SVGRectElement,{}>('rect').data(prepared);
        var legendsGroup = miniCanvas.select<SVGGElement>('.lgGroup');

        legendsGroup.selectAll('.leg').remove();

        var legendsBound=legendsGroup.selectAll(".leg")
            .data(legends);

        var enterLegends = legendsBound
            .enter()
                .append('g')
                .classed('leg', true);

        var minis = enterLegends.append("rect")
            .attr('x',d=>d.x)
            .attr('y',12)
            .attr('height', 12)
            .attr('width', 12)
            .style('stroke-width','0')
            .style('fill', (d,i)=>colors[(2*i+5)%7]);

        var captions = enterLegends.append("text")
            .attr("x", d=>d.x+20)
            .attr("y", 24)
            .classed('label',true);

        if (kind==="x"){
            var offSetX=d3.scaleLinear()
                .range([-240,240])
                .domain([0,legends.length]);
            
            squares.transition()
                .delay(500)
                .duration(1000)
                .style('fill', "rgb(60,60,60)")
                .attr('transform', function (d,i) { return `translate(${xScale(d.x)}, ${yScale(d.y)})`; });

            captions
                .text(d=>d.leg);

            minis.style("fill", "rgb(60,60,60)");
        }

        if (kind==="grado_id" || kind==="s_year_id" || kind==="e_year_id" ||kind==="area_id"){
            var offSetX=d3.scaleLinear()
                .range([-240,240])
                .domain([0,legends.length]);
            
            squares.transition()
                .duration(1000)
                .style('fill', d=>colors[(2*d[(kind)]+5)%7])
                .attr('transform', function (d,i) { return `translate(${xScale(d.x)+offSetX(d[kind])}, ${yScale(d.y)})`; });

            captions
                .text(d=>d.leg);
        }

        if (kind==="area_id"){
            minis
            .attr('x',d=>d.x)
            .attr('y',function(i,j){ return 24*(j%2)});

            captions
            .attr("y", function(i,j){ return 12+24*(j%2)});
        }
    }

    function updateMap(){
        if (state!="map"){
            console.log("State Map");
            // Set state as Map
            state="map";
            d3.select("#canvas")
                .selectAll(".minicanvas")
                .remove();

            // Basic canvas config. There will be a left hand side
            // and a right hand side

            var miniCanvasL=d3.select("#canvas")
                .append("g")
                .attr("id", "MCL")
                .classed("minicanvas",true);
            
            var miniCanvasR=d3.select("#canvas")
                .append("g")
                .attr("id","MCR")
                .classed("minicanvas",true);

            // Instructions go on LHS, but appear on top

            d3.select("#MCR")
                .append("text")
                .attr("x", "300")
                .attr("y", "20")
                .classed("instruccion",true)
                .text("Posa el mouse sobre un estado para ver su informacion");
            
            d3.select("#MCR")                
                .append("text")
                .attr("x", "380")
                .attr("y", "35")
                .classed("instruccion",true)
                .text("Da click para fijarlo y comparar");

            // Labels for the right hand side

            var state_labels = ["Becarios ",
                        "Grado (% en el estado)",
                        "Área (% en el estado)"];

            d3.select("#MCR")
                .selectAll("rect.stateLabel")
                    .data(state_labels)
                    .enter()
                        .append("text")
                            .text(d=>d)
                            .attr("x","700")
                            .attr("y",(d,i)=>`${20+120*i}`)
                            .attr("height", d=>d)
                            .classed("label",true);

            // Mock values of LHS
            var base_values={name: "",
                            becarios: 0, 
                            xGrados: [[0,0.25],[0.25,0.25],[0.5,0.25],[0.75,0.25]], 
                            xAreas: [[0, 0.14],[0.14, 0.14],[0.28, 0.14],[0.42, 0.14],[0.56, 0.14],[0.7, 0.14],[0.84, 0.16]]};
            // Scale for bars

            var xScale= d3.scaleLinear()
                .range([0,300])
                .domain([0,1]);

            // Set the mock number of becarios

            d3.select("#MCL")
                .selectAll(".numBec")           
                    .data(["Total: " + String(base_values.becarios)])
                    .enter()
                        .append("text")
                            .text(d=>d)
                            .attr("x","700")
                            .attr("y","70")
                            .classed("numBec",true);

            // Create labels, minis and mock bars for the degree

            d3.select("#MCR")
                .selectAll(".degLabel")
                    .data(["Mae.", "Doc.", "Esp.", "E.T."])
                    .enter()
                        .append("text")
                            .text(d=>d)
                            .attr("x",(d,i)=>`${720+70*i}`)
                            .attr("y","180");

            d3.select("#MCR")
                .selectAll(".degMini")
                    .data([0,1,2,3])
                    .enter()
                        .append("rect")
                            .attr("y", `166`)
                            .attr("x",(d,i)=>`${700+70*i}`)
                            .attr("width", "14")
                            .attr("height", "14")
                            .style("fill", (d,i)=>colors[(2*i+5)%7])
                            .attr("class","RHR");

            d3.select("#MCR")
                .selectAll("rect.degBar")
                    .data(base_values.xGrados)
                    .enter()
                        .append("rect")
                            .attr("y", `200`)
                            .attr("width", d=>xScale(d[1]))
                            .attr("x",d=>700+xScale(d[0]))
                            .attr("height", "20")
                            .style("fill", (d,i)=> colors[(2*i+5)%7])
                            .attr("class","degBar");

            // Create labels, minis and mock bars for the area             
                            
            d3.select("#MCR")
            .selectAll(".areaLabel")
                .data(["FM", "BQ", "MS", "HC", "CS", "BA", "IN"])
                .enter()
                    .append("text")
                        .text(d=>d)
                        .attr("x",(d,i)=>`${720+42*i}`)
                        .attr("y","300");

            d3.select("#MCR")
            .selectAll(".areaMini")
                .data([0,1,2,3,4,5,6])
                .enter()
                    .append("rect")
                        .attr("y", `290`)
                        .attr("x",(d,i)=>`${705+42*i}`)
                        .attr("width", "10")
                        .attr("height", "10")
                        .style("fill", (d,i)=>colors[(2*i+5)%7]);

            d3.select("#MCR")
                .selectAll("rect.areasBar")
                    .data(base_values.xAreas)
                    .enter()
                        .append("rect")
                            .attr("y", `320`)
                            .attr("width", d=>xScale(d[1]))
                            .attr("x",d=>700+xScale(d[0]))
                            .attr("height", "20")
                            .style("fill", (d,i)=>colors[(2*i+5)%7])
                            .attr("class","areasBar");

            // Labels for states

            d3.select("#MCL")                
                .append("text")
                .attr("x", "20")
                .attr("y", "420")
                .classed("stateName",true)
                .text("");
            
            //Insert the map and deal with the listening of mouse events  

            var importedNode = document.importNode(XMLmap.documentElement, true);
            document.getElementById("MCL").appendChild(importedNode)

            var selected = "none";

            d3.select("#MCL")
                .select("g")
                    .attr("transform",`translate(0,0) scale(0.1,0.1)`)
                    .transition()
                    .duration(500)
                    .attr("transform",`translate(0,20) scale(0.65,0.65)`)
                    .selection()
                    .selectAll("path")
                        .data(preparedStates)
                        .style("fill","rgb(60,60,60)")
                        .on("mouseover", function(d:Country,i){
                            var grados=d.grados
                            var areas=d.areas;
                            var becarios=d.becarios;
                            var estado=d.name;
                            d3.select(this)
                                .transition()
                                .style("fill","rgb(120,120,120)");
                            d3.selectAll(".degBar")
                                .data(d.xGrados)
                                .transition()
                                .attr("width", d=>xScale(d[1]))
                                .attr("x",d=>700+xScale(d[0]));
                            d3.selectAll(".areasBar")
                                .data(d.xAreas)
                                .transition()
                                .attr("width", d=>xScale(d[1]))
                                .attr("x",d=>700+xScale(d[0]));;
                            d3.select(".stateName")
                                .text(estado);
                            d3.select("#MCL")
                                .selectAll(".numBec")           
                                    .data([becarios])
                                    .text(d=>"Total: "+d.toString());
                        })
                        .on("mouseout", function(d:Country,i){
                            if (selected!=d.name){
                                d3.select(this)
                                    .transition()
                                    .style("fill","rgb(60,60,60)");
                                };
                            d3.selectAll(".degBar")
                                .data(base_values.xGrados)
                                .transition() 
                                .attr("width", d=>xScale(d[1]))
                                .attr("x",d=>700+xScale(d[0]));
                            d3.selectAll(".areasBar")
                                .data(base_values.xAreas)
                                .transition()
                                .attr("width", d=>xScale(d[1]))
                                .attr("x",d=>700+xScale(d[0]));
                            d3.select("#MCL")
                                .selectAll(".numBec")           
                                    .data(["Total: "+String(base_values.becarios)])
                                    .text(d=>d);
                            d3.select(".stateName")
                                .text(base_values.name);
                    })
                    .on("click", function(d : any){
                            if (selected!="none"){
                                var sel_state:SVGPathElement = document.querySelector(`[name="${selected}"]`);
                                sel_state.style.fill="rgb(60,60,60)";   
                            }                 
                            base_values=d;
                            selected=d.name;
                    })
        }
    }



    // function updateBec(){

    // }
    
    var legendsIndex=[{x:20,leg:"~ 80 becarios"}];

    var legendsGrado=[
        {x:-250,leg:"Maestría"}, 
        {x:40,leg:"Doctorado"}, 
        {x:210,leg:"Especialización"}, 
        {x:370,leg:"Estancia"}];

    var legendsInicio=[
        {x:-350,leg:"2013 -"}, 
        {x:-260,leg:"2014"}, 
        {x:-165,leg:"2015"}, 
        {x:-55,leg:"2016"}, 
        {x:160,leg:"2017"}, 
        {x:385,leg:"2018 +"}
    ];

    var legendsFin=[
        {x:-350,leg:"2017 -"}, 
        {x:-260,leg:"2018"}, 
        {x:-45,leg:"2019"}, 
        {x:180,leg:"2020"}, 
        {x:335,leg:"2021"}, 
        {x:445,leg:"2022 +"}
    ];

    var legendsArea=[
        {x:-340,leg:"Físico-Matemática"}, 
        {x:-240,leg:"Biología y Química"}, 
        {x:-125,leg:"Medicina y C. Salud"}, 
        {x: -15,leg:"Humanidades y C. Conducta"}, 
        {x:115,leg:"Ciencias Sociales"}, 
        {x:255,leg:"Biotecnología y C. Agropecuarias"}, 
        {x:380,leg:"Ingenierías"}
    ];

    //Button listening
    d3.select('#todos').on("click", r => updateSquare("x", legendsIndex));
    d3.select('#porArea').on("click", r =>updateSquare("area_id", legendsArea));
    d3.select('#porGrado').on("click", r => updateSquare("grado_id", legendsGrado));
    d3.select('#porInicio').on("click", r => updateSquare("s_year_id", legendsInicio));
    d3.select('#porFin').on("click",r => updateSquare("e_year_id", legendsFin));
    d3.select('#porEstado').on("click", r => updateMap());

    updateSquare("x",legendsIndex)

})

// //Listening functions hover: Mapa

    // d3.select('#porEstado').on("click",  function () {
    //     d3.xml<XMLDocument>("mx.svg").then(function(xml) {
        
    //     var k=d3.select("#viz").select("svg")
    //         .attr("width", 500)
    //         .attr("height", 315)
    //             .select("g")
    //             .attr("transform","scale(0.5,0.5)")
    //             .attr("fill","rgb(0,0,43)")
    //                 .selectAll("path")
    //                 .on("mouseover", handleMouseOver)
    //                 .on("mouseout", handleMouseOut);
    //     }
    //     )
    // })

// // Handling Mouseover
// // function handleMouseOver(){
// //     d3.select(this).attr("fill","rgb(200,55,113)");
// // }

// // function handleMouseOut(){
// //     d3.select(this).attr("fill","rgb(0,0,43)");
// // }
