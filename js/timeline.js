(function () {
  const CARD_ID  = "#timelineChart";
  const CSV_FILE = "data/job_trend_by_country.csv";
  const ASPECT   = 0.625;
  const MARGIN   = { top: 30, right: 30, bottom: 50, left: 60 };

  let seriesByCountry, allDates;
  let currentCountry = "Global";

  d3.csv(CSV_FILE, row => ({
    date: d3.timeParse("%Y-%m-%d")(row.date),
    country: row.country,
    count: +row.count
  })).then(rows => {
    seriesByCountry = d3.group(rows, d => d.country);
    allDates = d3.extent(rows, d => d.date);
    draw("Global");
    hookBus();
    window.addEventListener("resize", () => draw(currentCountry));
  });

  function draw(country) {
    currentCountry = country || "Global";

    const container = d3.select(CARD_ID);
    container.selectAll("svg").remove();

    const width = container.node().clientWidth;
    const height = width * ASPECT;

    const svg = container.append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const data = currentCountry === "Global"
      ? rollupGlobal()
      : (seriesByCountry.get(currentCountry) || []);

    if (!data.length) {
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("fill", "#888")
        .text("No data for this country");
      addTitle(svg, width, `No data – ${currentCountry}`);
      return;
    }

    const x = d3.scaleTime()
      .domain(allDates)
      .range([MARGIN.left, width - MARGIN.right]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count)]).nice()
      .range([height - MARGIN.bottom, MARGIN.top]);

    const line = d3.line()
      .x(d => x(d.date))
      .y(d => y(d.count));

    // addTitle(svg, width, `${currentCountry} Job Postings Over Time`);

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#4682B4")
      .attr("stroke-width", 2)
      .attr("d", line);

    svg.append("g")
      .attr("transform", `translate(0,${height - MARGIN.bottom})`)
      .call(d3.axisBottom(x).ticks(6).tickSizeOuter(0));

    svg.append("g")
      .attr("transform", `translate(${MARGIN.left},0)`)
      .call(d3.axisLeft(y).ticks(5));
  }

  function addTitle(svg, width, text) {
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", MARGIN.top / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", "18px")
      .attr("font-weight", 600)
      .text(text);
  }

  function rollupGlobal() {
    const allRows = Array.from(seriesByCountry.values()).flat();
    return Array.from(
      d3.rollup(
        allRows,
        v => d3.sum(v, d => d.count),
        d => d.date
      ),
      ([date, count]) => ({ date, count })
    ).sort((a, b) => d3.ascending(a.date, b.date));
  }

  function hookBus() {
    if (!window.dispatcher) return;
    window.dispatcher.on("filter.timeline", ({ source, country }) => {
      if (source === "timeline") return;
      draw(country || "Global");
    });
  }
})();
