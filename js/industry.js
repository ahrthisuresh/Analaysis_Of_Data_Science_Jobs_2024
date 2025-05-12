// js/industry.js
(function () {
  const CARD_ID  = "#industryChart";
  const CSV_FILE = "data/filtered_dashboard_data.csv";
  const ASPECT   = 0.4;
  const LEGEND_BOX = 12;
  let currentCountry = null;
  let tooltip;
  
    // Create tooltip once
    tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "fixed")
      .style("background", "white")
      .style("border", "1px solid #ddd")
      .style("border-radius", "4px")
      .style("padding", "8px")
      .style("pointer-events", "none")
      .style("font-family", "Roboto, sans-serif")
      .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)");
  

  function draw(country = null) {
    currentCountry = country;
    const container = d3.select(CARD_ID);
    container.selectAll("*").remove();

    const width  = container.node().clientWidth;
    const height = width * ASPECT;
    const radius = Math.min(width, height) / 2 - 10;

    d3.csv(CSV_FILE, d => ({ industry: d.industry, country: d.country }))
      .then(rows => {
        container.selectAll("*").remove();
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

        const counts = Array.from(
          d3.rollup(data, v => v.length, d => d.industry),
          ([industry, cnt]) => ({ industry, cnt })
        );

        // color scale
        const color = d3.scaleOrdinal(d3.schemeCategory10)
          .domain(counts.map(d => d.industry));

        const pie = d3.pie().value(d => d.cnt);
        const arcs = pie(counts);
        const arcGen = d3.arc()
          .innerRadius(radius * 0.5)
          .outerRadius(radius);

        const svg = container.append("svg")
          .attr("width",  width)
          .attr("height", height)
          .append("g")
            .attr("transform", `translate(${width/2},${height/2 + 10})`);

        svg.selectAll("path.slice")
          .data(arcs, d => d.data.industry)
          .join(
            enter => enter.append("path")
              .attr("class", "slice")
              .attr("d", arcGen)
              .attr("fill", d => color(d.data.industry))
              .on("mouseover", function(event, d) {
                tooltip.transition().duration(200).style("opacity", 0.9);
              })
              .on("mousemove", function(event, d) {
                const bbox = tooltip.node().getBoundingClientRect();
                let left = event.clientX + 15;
                let top = event.clientY + 15;

                // Right edge check
                if (left + bbox.width > window.innerWidth) {
                  left = event.clientX - bbox.width - 15;
                }

                // Bottom edge check
                if (top + bbox.height > window.innerHeight) {
                  top = event.clientY - bbox.height - 15;
                }

                tooltip
                  .html(`${d.data.industry}<br><strong>${d.data.cnt}</strong> postings`)
                  .style("left", `${left}px`)
                  .style("top", `${top}px`);
              })
              .on("mouseout", function(d) {
                tooltip.transition().duration(500).style("opacity", 0);
              })
              .transition().duration(500)
                .attrTween("d", function(d) {
                  const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
                  return t => arcGen(i(t));
                }),
            update => update.attr("d", arcGen),
            exit   => exit.remove()
          );

        // legend
        const legend = svg.append("g")
          .attr("transform", `translate(${-width/2 + 20}, ${-height/2 + 20})`);
        counts.forEach((d, i) => {
          const g = legend.append("g")
            .attr("transform", `translate(0, ${i * (LEGEND_BOX + 4)})`);
          g.append("rect")
            .attr("width", LEGEND_BOX)
            .attr("height", LEGEND_BOX)
            .attr("fill", color(d.industry));
          g.append("text")
            .attr("x", LEGEND_BOX + 4)
            .attr("y", LEGEND_BOX - 2)
            .text(d.industry)
            .style("font-size", "10px");
        });

        // title
        svg.append("text")
          .attr("x",            0)
          .attr("y",           -radius - 5)
          .attr("text-anchor", "middle")
          .attr("font-size",    "18px")
          .attr("font-weight",  "600")
          // .text(
          //   country
          //     ? `Industry Distribution in ${country}`
          //     : "Global Industry Distribution"
          // );
      });
  }

  draw();
  window.addEventListener("resize", () => draw(currentCountry));

  if (window.dispatcher) {
    window.dispatcher.on("filter.industry", ({ source, country }) => {
      if (source === "industry") return;
      draw(country);
    });
  }
})();
