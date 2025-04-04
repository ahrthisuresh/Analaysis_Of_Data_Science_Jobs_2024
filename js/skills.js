// js/skills.js
d3.csv("data/dashboard_cleaned_data.csv").then(data => {
    const width = 700;
    const height = 500;
    const margin = { top: 20, right: 20, bottom: 60, left: 150 };
  
    const svg = d3.select("#skillsChart")
      .append("svg")
      .attr("width", width)
      .attr("height", height);
  
    const skillCounts = d3.rollup(data, v => v.length, d => d.skill);
    const topSkills = Array.from(skillCounts, ([skill, count]) => ({ skill, count }))
      .sort((a, b) => d3.descending(a.count, b.count))
      .slice(0, 10);
  
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
  