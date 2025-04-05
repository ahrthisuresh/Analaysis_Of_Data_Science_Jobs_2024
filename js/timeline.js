// js/timeline.js
d3.csv("data/job_trend_over_time.csv").then(data => {
  console.log("Trends data loaded:", data);

  const parseDate = d3.timeParse("%Y-%m-%d");

  data.forEach(d => {
    d.date = parseDate(d.date);  // fix: no slicing needed
    d.count = +d.count;          // fix: correct field name
  });

  const width = 800;
  const height = 400;
  const margin = { top: 40, right: 30, bottom: 50, left: 60 };

  const svg = d3.select("#timelineChart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const x = d3.scaleTime()
    .domain(d3.extent(data, d => d.date))
    .range([margin.left, width - margin.right]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.count)]).nice()
    .range([height - margin.bottom, margin.top]);

  const line = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.count));

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .text("Job Postings Over Time");

  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "#4682B4")
    .attr("stroke-width", 2)
    .attr("d", line);

  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(6));

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));
});
