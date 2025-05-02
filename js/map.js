(function () {
  const CARD_ID = "#mapChart";
  const FILES = {
    world: "data/world.geojson",
    jobs: "data/location_data.csv",
  };
  const ASPECT = 0.6;
  const COLOR_SEQ = d3.interpolateBlues;
  const MARGIN   = { top: 30, right: 30, bottom: 50, left: 60 };
  function draw() {
    const container = d3.select(CARD_ID);
    container.selectAll("svg, .tooltip").remove();

    const width = container.node().clientWidth;
    const height = width * ASPECT;

    const svg = container.append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const tooltip = container.append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("background", "rgba(0,0,0,0.75)")
      .style("color", "#fff")
      .style("padding", "4px 8px")
      .style("border-radius", "4px")
      .style("font", "12px/1.3 sans-serif")
      .style("visibility", "hidden");

    Promise.all([
      d3.json(FILES.world),
      d3.csv(FILES.jobs)
    ]).then(([world, jobs]) => {
      const alias = new Map([
        ["USA", "United States"],
        ["US", "United States"],
        ["U.S.", "United States"],
        ["United States of America", "United States"],
        ["UK", "United Kingdom"],
        ["Great Britain", "United Kingdom"],
        ["England", "United Kingdom"],
        ["Scotland", "United Kingdom"],
        ["Wales", "United Kingdom"],
        ["Russian Federation", "Russia"],
        ["South Korea", "Korea, Republic of"],
        ["Republic of Korea", "Korea, Republic of"],
        ["Vietnam", "Viet Nam"],
        ["UAE", "United Arab Emirates"]
      ]);

      const canon = name => alias.get(name) || name.trim();
      const getCountry = loc => canon(loc.split(",").pop());

      const counts = d3.rollup(jobs, v => v.length, d => getCountry(d.location));
      const maxCnt = d3.max(counts.values());
      const color = d3.scaleSequential([1, maxCnt], COLOR_SEQ);

      const projection = d3.geoNaturalEarth1().fitSize([width, height], world);
      const path = d3.geoPath(projection);

      svg.append("text")
        .attr("x", width / 2)
        .attr("y", MARGIN.top / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", "18px")
        .attr("font-weight", "600")
        .text("Job Distribution by Country");

      svg.append("g")
        .selectAll("path")
        .data(world.features)
        .join("path")
        .attr("d", path)
        .attr("fill", d => {
          const n = counts.get(canon(d.properties.name));
          return n ? color(n) : "#ccc";
        })
        .attr("stroke", "#666")
        .attr("stroke-width", 0.3)
        .on("mouseover", (event, d) => {
          const name = canon(d.properties.name);
          const n = counts.get(name) || 0;
          tooltip
            .style("visibility", "visible")
            .text(`${name}: ${n ? n + " jobs" : "No jobs data"}`);
          d3.select(event.currentTarget)
            .attr("stroke-width", 1.2)
            .raise();
          if (window.dispatcher) {
            window.dispatcher.call("filter", null, { source: "map", country: name });
          }
        })
        .on("mousemove", event => {
          tooltip
            .style("top", (event.offsetY + 15) + "px")
            .style("left", (event.offsetX + 15) + "px");
        })
        .on("mouseout", event => {
          tooltip.style("visibility", "hidden");
          d3.select(event.currentTarget).attr("stroke-width", 0.3);
        });
    });
  }

  draw();
  window.addEventListener("resize", draw);

  if (window.dispatcher) {
    window.dispatcher.on("filter.mapSkill", ({ source, skill }) => {
      if (!skill || source === "map") return;
      const card = d3.select("#mapChart");
      card.style("box-shadow", "0 0 0 3px #ff9800 inset");
      setTimeout(() => card.style("box-shadow", null), 500);
    });
  }
})();
