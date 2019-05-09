(function() {

  let data = "no data"
  let svgContainer = "";
  let bars = "";

  window.onload = function() {
    svgContainer = d3.select("body")
      .append('svg')
      .attr('width', 1000)
      .attr('height', 500)
      .style('display', "block")
      .style('margin', "auto");
    
    d3.csv("data/Seasons (SimpsonsData).csv")
      .then((data) => {
        makeBarChart(data);
      });
  }


  function makeBarChart(csvData) {
    data = csvData;
    let avg_viewers = data.map((row) => parseInt(row["Avg. Viewers (mil)"]));
    let season_year = data.map((row) => parseInt(row.Year));

    let minMaxData = findMinMax(season_year, avg_viewers);

    let scaleAndMapFuncs = drawAxes(minMaxData, "Year", "Avg. Viewers (mil)");

    plotData(scaleAndMapFuncs);

    makeLabels();
  }

  function findMinMax(x, y) {

    // get min/max x values
    let xMin = d3.min(x);
    let xMax = d3.max(x);

    // get min/max y values
    let yMin = d3.min(y);
    let yMax = d3.max(y);

    let ave = d3.mean(y);

    // return formatted min/max data as an object
    return {
      xMin : xMin,
      xMax : xMax,
      yMin : yMin,
      yMax : yMax,
      yAvg : ave
    }
  }

  // draw the axes and ticks
  function drawAxes(limits, x, y) {
    // return x value from a row of data
    let xValue = function(d) { return +d[x]; }

    // function to scale x value
    let xScale = d3.scaleLinear()
      .domain([limits.xMin, limits.xMax]) // give domain buffer room
      .range([50, 1000]);

    // xMap returns a scaled x value from a row of data
    let xMap = function(d) { return xScale(xValue(d)); };

    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(xScale);
    svgContainer.append("g")
      .attr('transform', 'translate(0, 450)')
      .call(xAxis);

    // return y value from a row of data
    let yValue = function(d) { return +d[y]}

    // function to scale y
    let yScale = d3.scaleLinear()
      .domain([limits.yMax + 5, limits.yMin - 5]) // give domain buffer
      .range([50, 450]);

    // yMap returns a scaled y value from a row of data
    let yMap = function (d) { return yScale(yValue(d)); };

    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(yScale);
    svgContainer.append('g')
      .attr('transform', 'translate(50, 0)')
      .call(yAxis);
    // return mapping and scaling functions
    return {
      x: xMap,
      y: yMap,
      xScale: xScale,
      yScale: yScale,
      yAvg : yScale(limits.yAvg),
      yAvgVal : limits.yAvg
    };
  }

  function plotData(mapFunctions) {

    let xMap = mapFunctions.x;
    let yMap = mapFunctions.y;

    let div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);


    bars = svgContainer.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
        .attr("class", "databars")
        .attr("x", (d) => {return xMap(d) + 5})
        .attr("y", yMap)
        .attr("width", 30)
        .attr("height", (d) => {return 450 - yMap(d)})
        .attr("fill", (d) => {
          if(d.Data == "Estimated") {
            return "grey";
          } else {
            return "steelblue";
          }
        })
        //adding tooltip
       .on("mouseover", (d) => {
          div.transition()
            .duration(200)
            .style("opacity", .9);
          div.html("<p>Season #" + d.Year + "</p>" +
                  "Year: " + d.Year + "<br/>" +
                  "Episodes: " + d.Episodes + "<br/>" +
                  "Avg Viewers (mil): " + d["Avg. Viewers (mil)"] + "<br/>" + "<br/>" +
                  "Most Watched Episode: " + d["Most watched episode"] + "<br/>" +
                  "Viewers (mil): " + d["Viewers (mil)"])
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", (d) => {
          div.transition()
            .duration(500)
            .style("opacity", 0);
        });

        let labels = svgContainer.selectAll('.barlabels')
          .data(data)
          .enter()
          .append('text')
            .attr("x", (d) => {return xMap(d) + 8})
            .attr("y", (d) => {return yMap(d) - 3})
            .text((d) => {return d["Avg. Viewers (mil)"]});


        let line = svgContainer
            .append("line")
              .attr("x1", 50)
              .attr("y1", mapFunctions.yAvg)
              .attr("x2", 1000)
              .attr("y2", mapFunctions.yAvg)
              .style('stroke', 'black')
              .style('stroke-dasharray', (3,3))
              .attr('stroke-width', 2);
        svgContainer
          .append("text")
            .attr("x", 900)
            .attr("y", mapFunctions.yAvg - 5)
            .text("Average: " + mapFunctions.yAvgVal);

  }

  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function makeLabels() {
    svgContainer.append('text')
      .attr('x', 400)
      .attr('y', 40)
      .style('font-size', '14pt')
      .text("Avg. Viewership by Season");

    svgContainer.append('text')
      .attr('x', 450)
      .attr('y', 490)
      .style('font-size', '10pt')
      .text('Seasons (by year)');

    svgContainer.append('text')
      .attr('transform', 'translate(15, 340)rotate(-90)')
      .style('font-size', '10pt')
      .text('Avg. Viewership (millions)');
  }

})();
