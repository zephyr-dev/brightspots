$(document).ready(function() {
  d3.json("quotes.json", function(error, json){
    var json = json.quotes
    var container = d3.select("#quotesContainer")
    container.selectAll(".item").
      data(json).
      enter().
      append("div").
      attr('class', setItemClass).
      append("p").
      text(function(d) { return d.quote });
  });

  function setItemClass(node) {
    if (node.first) {
      return("item active");
    } else {
      return("item");
    }
  }

  window.document.location.assign("/#openModal");

  var margin = 10;
  var diameter= 700;
  var svgWidth = 700;

  var color = d3.scale.linear()
  .domain([-1,5])
  .range(["hsl(152,80%,80%)","hsl(228,30%,40%)"])
  .interpolate(d3.interpolateHcl);


  var svg= d3.select("body").append("svg")
  .attr("viewBox","75 130 1200 900")
  .attr("perserveAspectRatio","xMinYMid")
  .attr("width", svgWidth)
  .attr("height", diameter)
  .append("g")
  .attr("transform", "translate(" + diameter + ", " + diameter/2 + ")")


  var pack= d3.layout.pack()
  .size([diameter-margin,diameter - margin])
  .padding(2)
  .value(function(d){ return d.size;})


  d3.json("viz.json", function(error, tree){
    var focus = tree
    var nodes= pack.nodes(tree);
    var view;

    var circle= svg.selectAll("circle")
    .data(nodes)
    .enter()
    .append("circle")
    .attr("class", function(d){return setClass(d);})
    .style("fill",function(d){return d.children ? color(d.depth) : '#006880';})
    .style("fill", function(d) { return setColor(d)})
    .on("click", function(d){ if (focus !== d) zoom(d), d3.event.stopPropagation();})

    function setClass(d) {
      if (d.parent) {
        if (d.depth == 1) {
          return "node--top"
        } else if (d.depth == 2) {
          if (d.children) {
            return "node--middle"
          } else {
            return "node--leaf"
          }
        } else {
          return 'node--leaf'
        }
      } else {
        return "node node--root"
      }
    }

    function setColor(d) {
      if (d.parent) {
        if (d.depth == 1) {
          return "#b6dce5"
        } else if (d.depth == 2) {
          if (d.children) {
            return "#f3f9fb"
          } else {
            return "#f3f9fb"
          }
        } else {
          return "#f3f9fb"
        }
      } else {
        return "#0c8caa"
      }
    }

    function setTextColor(d) {
      if (d.parent) {
        if (d.depth == 1) {
          // return "#0c8caa"
          return "label label-top-level"
        } else if (d.depth == 2) {
          if (d.children) {
            return "label label-middle-level"
            // return "#e6f3f6"
          } else {
            return "label"
            // return "#f3f9fb"
          }
        } else {
          return "label"
          // return "#f3f9fb"
        }
      } else {
        return "label label-top-level"
      }
    }

    var text= svg.selectAll("foreignObject")
    .data(nodes)
    .enter().append("foreignObject")
    .html(function(d){return d.name})
    .attr("class", function(d) { return setTextColor(d)})
    .style("fill-opacity", function(d) {return d.parent === tree ? 1 :0; })
    .style("text-align", "center")
    .style("display",function(d){return d.parent === tree ? "inline" : "none";});

    var text_nodes= svg.selectAll(".label")
    var circle_nodes= svg.selectAll("circle")

    d3.select("body")
    .on("click",function(){backgroundZoom(tree);});

    zoomTo([tree.x,tree.y,tree.r*2  + margin])

    function backgroundZoom(d) {
      var focus0 = focus;
      var focus =d;

      var transition = d3.transition()
      .duration(700)
      .tween("zoom",function(d){
        var i= d3.interpolateZoom(view,[focus.x,focus.y,focus.r *2 + margin]);
        return function (t){zoomTo(i(t));};
      });

      console.log("background Zoom");
      transition.selectAll("circle")
      .filter(function(d){ return d.parent ===focus || this.style.display === "inline";})
      .style("fill-opacity", function(d) {return (d.parent === focus) ? 1:0})
      .each("end",function(d){if (d.parent !== focus ) this.style.display = "none";})

      transition.selectAll(".label")
      .filter(function(d){return d.parent ===focus || this.style.display === "inline";})
      .style("fill-opacity", function(d) {return d.parent === focus ? 1:0})
      .each("start",function(d){if (d.parent === focus) this.style.display = "inline"; if (d.parent !== focus) this.style.display = "none"})
        .each("end",function(d){if (d.parent !== focus) this.style.display = "none"; if (d.parent == focus) this.style.display = "inline"})
    }

function zoom(d){
  var focus0 = focus;
  var focus =d;

  var transition = d3.transition()
  .duration(700)
  .tween("zoom",function(d){
    var i= d3.interpolateZoom(view,[focus.x,focus.y,focus.r *2 + margin]);
    return function (t){zoomTo(i(t));};
  });

  console.log("Zoom");
  transition.selectAll("circle")
  .filter(function(d){ return d.parent ===focus || this.style.display === "inline";})
  .style("fill-opacity", function(d) {return (d.parent === focus) ? 1:0})
  .each("start",function(d){if (d.parent === focus) this.style.display = "inline";})
  .each("end",function(d){if (d.parent !== focus ) this.style.display = "none";})

  transition.selectAll(".label")
  .filter(function(d){return d.parent ===focus || this.style.display === "inline";})
  .each("start",function(d){if (d.parent === focus) this.style.display = "none"; if (d.parent !== focus) this.style.display = "none";})
  .each("end",function(d){if (d.parent === focus) this.style.display = "inline"; if (d.parent !== focus) this.style.display = "none";})
}

function zoomTo(v){

  var k = diameter /v[2]; view =v;
  circle_nodes.attr("transform", function (d){ return "translate(" + (d.x-v[0]) * k + "," + (d.y - v[1]) * k + ")" })
  circle.attr("r",function(d){return d.r *k});
  text_nodes.attr("width", function(d) {return d.r *k *2});
  text_nodes.attr("height", function(d) {return d.r *k *2});
  text_nodes.attr("x", function(d) { return ((d.x-v[0]) * k) - (d.r *k) });
  text_nodes.attr("y", function(d) { return ((d.y - v[1]) * k) -15});
}

//hides and shows about text
$("circle").on("click", function(){
  $(".about").hide();
})

$("svg").on("click", function(){
  $(".about").show();
})

//creates responsive size
var chart = $("svg"),
aspect = chart.width() / chart.height(),
container = chart.parent();

$(window).on("resize", function() {
  var targetWidth = container.width();
  chart.attr("width", targetWidth);
  chart.attr("height", Math.round(targetWidth / aspect));
}).trigger("resize");

  });
});
