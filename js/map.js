Promise.all([
  d3.json("data/world.geojson"),
  d3.csv("data/location_data.csv")
]).then(([worldData, jobData]) => {
  const width = 960;
  const height = 600;

  console.log("Loaded job data:", jobData.slice(0, 5));

  const countryAliases = {
    "USA": "United States",
    "US": "United States",
    "U.S.": "United States",
    "United States of America": "United States",
    "UK": "United Kingdom",
    "England": "United Kingdom",
    "Scotland": "United Kingdom",
    "Wales": "United Kingdom",
    "UAE": "United Arab Emirates",
    "South Korea": "Korea, Republic of",
    "Russia": "Russian Federation",
    "Vietnam": "Viet Nam"
  };

  function extractCountry(location) {
    const parts = location.split(",").map(p => p.trim());
    return parts.length >= 3 ? parts[2] : "United States";
  }

  // Count job postings per country
  const countryJobCounts = {};
  jobData.forEach(d => {
    const raw = extractCountry(d.location);
    const country = countryAliases[raw] || raw;
    countryJobCounts[country] = (countryJobCounts[country] || 0) + 1;
  });

  console.log("Job counts by country:", countryJobCounts);
  console.log("Countries represented:", Object.keys(countryJobCounts).length);

  const projection = d3.geoNaturalEarth1()
    .scale(160)
    .translate([width / 2, height / 2]);

  const path = d3.geoPath().projection(projection);

  const color = d3.scaleOrdinal()
    .domain(Object.keys(countryJobCounts))
    .range(d3.schemeCategory10.concat(d3.schemeCategory20));

  const svg = d3.select("#mapChart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background", "rgba(0,0,0,0.7)")
    .style("color", "white")
    .style("padding", "5px 10px")
    .style("border-radius", "5px")
    .style("font-size", "13px");

  // Draw countries and color based on job count
  svg.append("g")
    .selectAll("path")
    .data(worldData.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", d => {
      let name = d.properties.name;
      if (["United States of America", "USA"].includes(name)) name = "United States";
      if (["UK", "Great Britain", "England"].includes(name)) name = "United Kingdom";
      if (name === "Russian Federation") name = "Russia";
      if (name === "Korea, Republic of") name = "South Korea";
      if (name === "Viet Nam") name = "Vietnam";

      return countryJobCounts[name] ? color(name) : "#ccc";
    })
    .on("mouseover", function (event, d) {
      let name = d.properties.name;
      if (["United States of America", "USA"].includes(name)) name = "United States";
      if (["UK", "Great Britain", "England"].includes(name)) name = "United Kingdom";
      if (name === "Russian Federation") name = "Russia";
      if (name === "Korea, Republic of") name = "South Korea";
      if (name === "Viet Nam") name = "Vietnam";

      const count = countryJobCounts[name] || 0;
      tooltip.text(`${name}: ${count} job${count !== 1 ? "s" : ""}`);
      tooltip.style("visibility", "visible");
      d3.select(this).attr("stroke", "#222").attr("stroke-width", 1.5);
    })
    .on("mousemove", function (event) {
      tooltip.style("top", event.pageY + 10 + "px")
             .style("left", event.pageX + 10 + "px");
    })
    .on("mouseout", function () {
      tooltip.style("visibility", "hidden");
      d3.select(this).attr("stroke", null);
    });
});
