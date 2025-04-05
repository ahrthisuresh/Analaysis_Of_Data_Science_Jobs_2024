// js/skills.js
d3.json("data/skill_demand_data.json").then(data => {
  const width = 700;
  const height = 500;
  const margin = { top: 20, right: 20, bottom: 60, left: 150 };
  console.log("Data loaded:", data);
  
  // Check if data is non-empty
  if (!data || data.length === 0) {
    console.error("No data found or file is empty.");
    return;
  }

  // If the data is already aggregated, convert count to a number and sort directly.
  const topSkills = data
    .map(d => ({ skill: d.skill, count: +d.count }))  // ensure count is numeric
    .sort((a, b) => d3.descending(a.count, b.count))
    .slice(0, 10);
  
  const svg = d3.select("#skillsChart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
  
  const x = d3.scaleLinear()
    .domain([0, d3.max(topSkills, d => d.count)])
    .range([margin.left, width - margin.right]);
  
  const y = d3.scaleBand()
    .domain(topSkills.map(d => d.skill))
    .range([margin.top, height - margin.bottom])
    .padding(0.1);
  
  svg.append("g")
    .selectAll("rect")
    .data(topSkills)
    .join("rect")
    .attr("x", x(0))
    .attr("y", d => y(d.skill))
    .attr("width", d => x(d.count) - x(0))
    .attr("height", y.bandwidth())
    .attr("fill", "steelblue");
  
  svg.append("g")
    .attr("transform", `translate(0,${margin.top})`)
    .call(d3.axisTop(x).ticks(5))
    .selectAll("text")
    .style("font-size", "12px");
  
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .selectAll("text")
    .style("font-size", "12px");
});
