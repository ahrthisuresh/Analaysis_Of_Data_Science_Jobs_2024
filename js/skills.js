(function () {
  const CARD_ID  = "#skillsChart";
  const CSV_FILE = "data/filtered_dashboard_data.csv";
  const ASPECT   = 0.6;
  const MARGIN   = { top: 40, right: 20, bottom: 50, left: 160 };

  let currentCountry = null;

  function draw(country = null) {
    currentCountry = country;
    const container = d3.select(CARD_ID);
    container.selectAll("*").remove();

    const width  = container.node().clientWidth;
    const height = width * ASPECT;
    const innerW = width  - MARGIN.left - MARGIN.right;
    const innerH = height - MARGIN.top  - MARGIN.bottom;

    d3.csv(CSV_FILE, d => ({ skill: d.skill, country: d.country }))
      .then(rows => {
        let data = rows;
        if (country) data = rows.filter(r => r.country === country);

        if (!data.length) {
          const svg = container.append("svg")
            .attr("width", width)
            .attr("height", height);
          svg.append("text")
            .attr("x", width/2)
            .attr("y", height/2)
            .attr("text-anchor", "middle")
            .attr("fill", "#888")
            .attr("font-size", "16px")
            .text("No data for this country");
          return;
        }

        // compute top-10 skills counts
        const counts = Array.from(
          d3.rollup(data, v => v.length, d => d.skill),
          ([skill, cnt]) => ({ skill, cnt })
        )
        .sort((a,b) => d3.descending(a.cnt, b.cnt))
        .slice(0, 10);

        // create SVG group
        const svg = container.append("svg")
          .attr("width", width)
          .attr("height", height)
          .append("g")
            .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

        // color scale for legend
        const color = d3.scaleOrdinal(d3.schemeCategory10)
          .domain(counts.map(d => d.skill));

        // scales
        const x = d3.scaleLinear()
          .domain([0, d3.max(counts, d => d.cnt)]).nice()
          .range([0, innerW]);
        const y = d3.scaleBand()
          .domain(counts.map(d => d.skill))
          .range([0, innerH])
          .padding(0.2);

        // axes
        svg.append("g")
          .call(d3.axisLeft(y).tickSize(0))
          .selectAll("text").style("font-size","12px");
        svg.append("g")
          .attr("transform", `translate(0,${innerH})`)
          .call(d3.axisBottom(x).ticks(5).tickSizeOuter(0))
          .selectAll("text").style("font-size","12px");

        // bars
        svg.selectAll(".bar")
          .data(counts, d => d.skill)
          .join(
            enter => enter.append("rect")
              .attr("class","bar")
              .attr("x", 0)
              .attr("y", d => y(d.skill))
              .attr("height", y.bandwidth())
              .attr("width", 0)
              .attr("fill", d => color(d.skill))
              .transition().duration(750)
                .attr("width", d => x(d.cnt)),
            update => update.transition().duration(750)
              .attr("y", d => y(d.skill))
              .attr("width", d => x(d.cnt)),
            exit => exit.remove()
          );

        // legend
        const legend = svg.append("g")
          .attr("transform", `translate(${innerW + 20}, 0)`);
        counts.forEach((d, i) => {
          const g = legend.append("g")
            .attr("transform", `translate(0, ${i * 20})`);
          g.append("rect")
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", color(d.skill));
          g.append("text")
            .attr("x", 18)
            .attr("y", 10)
            .text(d.skill)
            .style("font-size", "12px");
        });

        // title
        svg.append("text")
          .attr("x", width / 2)
          .attr("y", -MARGIN.top / 2)
          .attr("text-anchor","middle")
          .attr("font-size",  "18px")
          .attr("font-weight","600")
          .text(
            country 
              ? `Top 10 Skills in ${country}` 
              : "Top 10 Global Skills"
          );
      });
  }

  draw();
  window.addEventListener("resize", () => draw(currentCountry));

  if (window.dispatcher) {
    window.dispatcher.on("filter.skills", ({ source, country }) => {
      if (source === "skills") return;
      draw(country);
    });
  }
})();

