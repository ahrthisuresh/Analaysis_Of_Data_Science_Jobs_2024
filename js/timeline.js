// js/timeline.js
d3.csv("data/dashboard_cleaned_data.csv").then(data => {
    const parseDate = d3.timeParse("%Y-%m-%d");
    data.forEach(d => {
      d.date = parseDate(d.date.slice(0, 10)); // Handle timestamp format
    });
  
    const jobCounts = d3.rollups(data, v => v.length, d => d.date)
      .sort((a, b) => d3.ascending(a[0], b[0]))
      .map(([date, count]) => ({ date, count }));
  
    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
  
    const svg = d3.select("#timelineChart")
      .append("svg")
      .attr("width", width)
      .attr("height", height);
  
    const x = d3.scaleTime()
      .domain(d3.extent(jobCounts, d => d.date))
      .range([margin.left, width - margin.right]);
  
    const y = d3.scaleLinear()
      .domain([0, d3.max(jobCounts, d => d.count)])
      .nice()
      .range([height - margin.bottom, margin.top]);
  
    const line = d3.line()
      .x(d => x(d.date))
      .y(d => y(d.count));
  
    svg.append("path")
      .datum(jobCounts)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", line);
  
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(6))
      .selectAll("text")
      .style("font-size", "12px");
  
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .selectAll("text")
      .style("font-size", "12px");
  });
  