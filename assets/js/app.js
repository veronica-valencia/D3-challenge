// @TODO: YOUR CODE HERE!
var width = parseInt(d3.select('#scatter')
    .style("width"));

var height = width * 2/3;
var margin = 10;
var labelArea = 110;
var padding = 45;

// svg 
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "chart");
svg.append("g").attr("class", "xText");
var xText = d3.select(".xText");

// x axis text
var bottomTextX =  (width - labelArea)/2 + labelArea;
var bottomTextY = height - margin - padding;
xText.attr("transform",`translate(
    ${bottomTextX}, 
    ${bottomTextY})`
    );
xText.append("text")
    .attr("y", -19)
    .attr("data-name", "poverty")
    .attr("data-axis", "x")
    .attr("class","aText active x")
    .text("In Poverty (%)");

// y axis text
svg.append("g").attr("class", "yText");
var yText = d3.select(".yText");
var leftTextX =  margin + padding;
var leftTextY = (height + labelArea) / 2 - labelArea;
yText.attr("transform",`translate(
    ${leftTextX}, 
     ${leftTextY}
    )rotate(-90)`
    );
yText .append("text")
    .attr("y", 22)
    .attr("data-name", "healthcare")
    .attr("data-axis", "y")
    .attr("class", "aText inactive y")
    .text("Lacks Healthcare (%)");
    
// data
var cRadius;
function adjustRadius() {
  if (width <= 530) {
    cRadius = 7;}
  else { 
    cRadius = 10;}
}
adjustRadius();
d3.csv("assets/data/data.csv").then(function(data) {
    visualize(data);
});

function visualize (csvData) {
   var xMin;
   var xMax;
   var yMin;
   var yMax;

   // x y data axis 
   var currentX = "poverty";
   var currentY = "healthcare";
   // state 
   var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([40, -60])
      .html(function(d) {
            //text state box
            var stateLine = `<div>${d.state}</div>`;
            var yLine = `<div>${currentY}: ${d[currentY]}%</div>`;
            if (currentX === "poverty") {
                xLine = `<div>${currentX}: ${d[currentX]}%</div>`}          
            else {
                xLine = `<div>${currentX}: ${parseFloat(d[currentX]).toLocaleString("en")}</div>`;}             
            return stateLine + xLine + yLine  
        });
    svg.call(toolTip);

    // mouse update
    function  labelUpdate(axis, clickText) {
        d3.selectAll(".aText")
            .filter("." + axis)
            .filter(".active")
            .classed("active", false)
            .classed("inactive", true);
        clickText.classed("inactive", false).classed("active", true);
        }

    // scale 
    function xMinMax() {
      xMin = d3.min(csvData, function(d) {
        return parseFloat(d[currentX]) * 0.85;
      });
      xMax = d3.max(csvData, function(d) {
        return parseFloat(d[currentX]) * 1.15;
      });     
    }

    function yMinMax() {
      yMin = d3.min(csvData, function(d) {
        return parseFloat(d[currentY]) * 0.85;
      });
      yMax = d3.max(csvData, function(d) {
        return parseFloat(d[currentY]) * 1.15;
      }); 
    }
    //x and y scales 
    xMinMax();
    yMinMax();

    var xScale = d3 
        .scaleLinear()
        .domain([xMin, xMax])
        .range([margin + labelArea, width - margin])

    var yScale = d3
        .scaleLinear()
        .domain([yMin, yMax])
        .range([height - margin - labelArea, margin])
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);
    function tickCount() {
      if (width <= 530) {
         xAxis.ticks(5);
         yAxis.ticks(5);
      }
      else {
          xAxis.ticks(10);
          yAxis.ticks(10);
      }        
    }
    tickCount();
    svg.append("g")
        .call(xAxis)
        .attr("class", "xAxis")
        .attr("transform", `translate(
            0, 
            ${height - margin - labelArea})`
        );

    svg.append("g")
        .call(yAxis)
        .attr("class", "yAxis")
        .attr("transform", `translate(
            ${margin + labelArea}, 
            0 )`
        );

    // circles
    var allCircles = svg.selectAll("g allCircles").data(csvData).enter();

    allCircles.append("circle")
        .attr("cx", function(d) {
            return xScale(d[currentX]);
        })
        .attr("cy", function(d) {
            return yScale(d[currentY]);
        })
        .attr("r", cRadius)
        .attr("class", function(d) {
            return "stateCircle " + d.abbr;
        })
        .on("mouseover", function(d) {
            toolTip.show(d, this);
            d3.select(this).style("stroke", "#323232");
        })
        .on("mouseout", function (d) {
            toolTip.hide(d);
            d3.select(this).style("stroke", "#e3e3e3")
        });

        // circle state text 
        allCircles
            .append("text")
            .attr("font-size", cRadius)
            .attr("class", "stateText")
            .attr("dx", function(d) {
               return xScale(d[currentX]);
            })
            .attr("dy", function(d) {
              return yScale(d[currentY]) + cRadius /3;
            })
            .text(function(d) {
                return d.abbr;
              })

            .on("mouseover", function(d) {
                toolTip.show(d);
                d3.select("." + d.abbr).style("stroke", "#323232");
            })

            .on("mouseout", function(d) {
                toolTip.hide(d);
                d3.select("." + d.abbr).style("stroke", "#e3e3e3");
            });
          d3.selectAll(".aText").on("click", function() {
              var self = d3.select(this)
              if (self.classed("inactive")) {
                var axis = self.attr("data-axis")
                var name = self.attr("data-name")

                if (axis === "x") {
                  currentX = name;
                  xMinMax();
                  xScale.domain([xMin, xMax]);

                  svg.select(".xAxis")
                        .transition().duration(800)
                        .call(xAxis);
                  d3.selectAll("circle").each(function() {
                    d3.select(this)
                        .transition().duration(800)
                        .attr("cx", function(d) {
                            return xScale(d[currentX])                
                        });
                  });   

                  d3.selectAll(".stateText").each(function() {
                    d3.select(this)
                        .transition().duration(800)
                        .attr("dx", function(d) {
                            return xScale(d[currentX])                          
                        });
                  });          
                  //change based on click
                  labelUpdate(axis, self);
                }
                else {
                  currentY = name;

                  yMinMax();
                  yScale.domain([yMin, yMax]);

                  svg.select(".yAxis")
                        .transition().duration(800)
                        .call(yAxis);
                  d3.selectAll("circle").each(function() {
                    d3.select(this)
                        .transition().duration(800)
                        .attr("cy", function(d) {
                            return yScale(d[currentY])                
                        });                       
                  });   

                  d3.selectAll(".stateText").each(function() {
                      d3.select(this)
                        .transition().duration(800)
                        .attr("dy", function(d) {
                            return yScale(d[currentY]) + cRadius/3;                          
                        });
                  });
                  labelUpdate(axis, self);
                }
              }
          });
}