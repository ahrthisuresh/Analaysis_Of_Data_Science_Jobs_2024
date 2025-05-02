(function () {
  const CARD_ID = "#industryChart";
  const CSV_FILE = "data/industry_trends_data.csv";
  const ASPECT = 0.6;
  const COLOR = d3.scaleOrdinal()
    .range(["#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f",
            "#edc948", "#b07aa1", "#ff9da7", "#9c755f", "#bab0ab"]);

  function draw() {
    const container = d3.select(CARD_ID);
    container.selectAll("svg").remove();

    const width = container.node().clientWidth;
    const height = width * ASPECT;

    const svg = container.append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    d3.csv(CSV_FILE, d => ({ industry: d.industry, count: +d.counts })).then(data => {
      const total = d3.sum(data, d => d.count);
      const legendW = 180;
      const radius = Math.min(width - legendW, height) / 2.5;

      const gCenter = svg.append("g")
        .attr("transform", `translate(${radius + 20}, ${(height / 2) + 20})`);

      const pie = d3.pie()
        .sort(null)
        .value(d => d.count);

      const arc = d3.arc()
        .innerRadius(radius * 0.55)
        .outerRadius(radius);

      gCenter.selectAll("path")
        .data(pie(data))
        .join("path")
        .attr("d", arc)
        .attr("fill", d => COLOR(d.data.industry))
        .on("mouseover", (event, d) => {
          d3.select(event.currentTarget).attr("stroke", "#fff").attr("stroke-width", 2);
          if (window.dispatcher) {
            window.dispatcher.call("filter", null, { source: "industry", industry: d.data.industry });
          }
        })
        .on("mouseout", event => {
          d3.select(event.currentTarget).attr("stroke", null);
        });

      gCenter.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("font-size", "16px")
        .attr("font-weight", "600")
        .text(total.toLocaleString());

      const legend = svg.append("g")
        .attr("transform", `translate(${radius * 2 + 40}, ${(height - data.length * 20) / 2})`);

      legend.selectAll("g")
        .data(data)
        .join("g")
        .attr("transform", (d, i) => `translate(0, ${i * 20})`)
        .call(g => {
          g.append("rect")
            .attr("width", 14)
            .attr("height", 14)
            .attr("fill", d => COLOR(d.industry));

          g.append("text")
            .attr("x", 20)
            .attr("y", 11)
            .attr("font-size", "12px")
            .text(d => {
              const pct = ((d.count / total) * 100).toFixed(1);
              return `${d.industry} (${pct} %)`;
            });
        });

      svg.append("text")
        .attr("x", (radius * 2 + legendW) / 2)
        .attr("y", 24)
        .attr("text-anchor", "middle")
        .attr("font-size", "18px")
        .attr("font-weight", "600")
        .text("Industry-wise Job Distribution");
    });
  }

  draw();
  window.addEventListener("resize", draw);
})();
