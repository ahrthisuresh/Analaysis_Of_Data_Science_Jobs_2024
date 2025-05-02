(function () {
  const CARD_ID = "#skillsChart";
  const JSON_FILE = "data/skill_demand_data.json";
  const ASPECT = 0.6;
  const MARGIN = { top: 40, right: 20, bottom: 50, left: 160 };

  function draw() {
    const container = d3.select(CARD_ID);
    container.selectAll("svg").remove();

    const width = container.node().clientWidth;
    const height = width * ASPECT;

    const innerW = width - MARGIN.left - MARGIN.right;
    const innerH = height - MARGIN.top - MARGIN.bottom;

    const svg = container.append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    d3.json(JSON_FILE).then(raw => {
      if (!raw || !raw.length) return;

      const data = raw
        .map(d => ({ skill: d.skill, count: +d.count }))
        .sort((a, b) => d3.descending(a.count, b.count))
        .slice(0, 10);

      const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count)])
        .range([MARGIN.left, width - MARGIN.right]);

      const y = d3.scaleBand()
        .domain(data.map(d => d.skill))
        .range([MARGIN.top, height - MARGIN.bottom])
        .padding(0.1);

      svg.append("g")
        .selectAll("rect")
        .data(data)
        .join("rect")
        .attr("x", x(0))
        .attr("y", d => y(d.skill))
        .attr("width", d => x(d.count) - x(0))
        .attr("height", y.bandwidth())
        .attr("fill", "steelblue")
        .on("mouseover", (event, d) => {
          d3.select(event.currentTarget).attr("fill", "#1f77b4");
          if (window.dispatcher) {
            window.dispatcher.call("filter", null, { source: "skills", skill: d.skill });
          }
        })
        .on("mouseout", event => {
          d3.select(event.currentTarget).attr("fill", "steelblue");
        });

      svg.append("g")
        .attr("transform", `translate(0,${MARGIN.top})`)
        .call(d3.axisTop(x).ticks(5).tickSizeOuter(0))
        .selectAll("text").style("font-size", "12px");

      svg.append("g")
        .attr("transform", `translate(${MARGIN.left},0)`)
        .call(d3.axisLeft(y))
        .selectAll("text").style("font-size", "12px");

      svg.append("text")
        .attr("x", width / 2)
        .attr("y", MARGIN.top / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", "18px")
        .attr("font-weight", "600")
        .text("Top 10 Skills");
    });
  }

  draw();
  window.addEventListener("resize", draw);
})();
