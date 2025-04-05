// js/industry.js
d3.csv("data/industry_trends_data.csv").then(data => {
    console.log("Industry data loaded:", data);
  
    data.forEach(d => {
      d.counts = +d.counts;
    });
  
    const width = 900;
    const height = 500;
    const radius = Math.min(width, height) / 2.5;
    const innerRadius = radius * 0.5; // 👈 Donut shape
  
    // Better color palette using Tableau10
    const color = d3.scaleOrdinal()
      .range(["#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f"]);
  
    const svg = d3.select("#industryChart")
      .append("svg")
      .attr("width", width)
      .attr("height", height);
  
    // Center group
    const chartGroup = svg.append("g")
      .attr("transform", `translate(${width / 2.5}, ${height / 2})`);
  
    const pie = d3.pie()
      .sort(null)
      .value(d => d.counts);
  
    const arc = d3.arc()
      .innerRadius(innerRadius) // Donut!
      .outerRadius(radius);
  
    const arcs = chartGroup.selectAll("arc")
      .data(pie(data))
      .enter()
      .append("g")
      .attr("class", "arc");
  
    arcs.append("path")
      .attr("d", arc)
      .attr("fill", d => color(d.data.industry));
  
    // Add labels inside the chart for large slices if needed (optional)
    const total = d3.sum(data, d => d.counts);
  
    // Side Legend with percentages
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 250}, ${height / 2 - 100})`);
  
    const legendItemHeight = 20;
  
    legend.selectAll("legend-item")
      .data(data)
      .enter()
      .append("g")
      .attr("transform", (d, i) => `translate(0, ${i * legendItemHeight})`)
      .call(g => {
        g.append("rect")
          .attr("width", 14)
          .attr("height", 14)
          .attr("fill", d => color(d.industry));
  
        g.append("text")
          .attr("x", 20)
          .attr("y", 11)
          .text(d => {
            const pct = ((d.counts / total) * 100).toFixed(1);
            return `${d.industry} (${pct}%)`;
          })
          .style("font-size", "13px");
      });
  
    // Title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("font-weight", "bold")
      .text("Industry-wise Job Distribution");
  });
  