// js/map.js
d3.csv("data/dashboard_cleaned_data.csv").then(data => {
    const countryCounts = d3.rollup(data, v => v.length, d => d.country);
    const topCountries = Array.from(countryCounts, ([country, count]) => ({ country, count }))
      .sort((a, b) => d3.descending(a.count, b.count))
      .slice(0, 10);
  
    const width = 700;
    const height = 500;
    const margin = { top: 20, right: 20, bottom: 60, left: 150 };
  
    const svg = d3.select("#mapChart")
      .append("svg")
      .attr("width", width)
      .attr("height", height);
  
    const x = d3.scaleLinear()
      .domain([0, d3.max(topCountries, d => d.count)])
      .range([margin.left, width - margin.right]);
  
    const y = d3.scaleBand()
      .domain(topCountries.map(d => d.country))
      .range([margin.top, height - margin.bottom])
      .padding(0.1);
  
    svg.append("g")
      .selectAll("rect")
      .data(topCountries)
      .join("rect")
      .attr("x", x(0))
      .attr("y", d => y(d.country))
      .attr("width", d => x(d.count) - x(0))
      .attr("height", y.bandwidth())
      .attr("fill", "#7B68EE");
  
    svg.append("g")
      .attr("transform", `translate(0,${margin.top})`)
      .call(d3.axisTop(x).ticks(5));
  
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));
  });
  