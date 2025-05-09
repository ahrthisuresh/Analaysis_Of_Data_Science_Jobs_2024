(function () {
  const CARD_ID  = "#timelineChart";
  const CSV_FILE = "data/job_trend_by_country.csv";
  const ASPECT   = 0.625;
  const MARGIN   = { top: 30, right: 30, bottom: 50, left: 60 };
  let seriesByCountry, allDates, tooltip,x,y;
  let currentCountry = "Global";

  d3.csv(CSV_FILE, row => ({
    date: d3.timeParse("%Y-%m-%d")(row.date),
    country: row.country,
    count: +row.count
  })).then(rows => {
    seriesByCountry = d3.group(rows, d => d.country);
    allDates = d3.extent(rows, d => d.date);

    // Create tooltip once
    tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "fixed")
      .style("background-color", "white")
      .style("border", "solid 1px")
      .style("border-radius", "5px")
      .style("padding", "8px")
      .style("pointer-events", "none")
      .style("font-family", "Roboto, sans-serif");

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

    x = d3.scaleTime()
      .domain(allDates)
      .range([MARGIN.left, width - MARGIN.right]);

    y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count)]).nice()
      .range([height - MARGIN.bottom, MARGIN.top]);

    const line = d3.line()
      .x(d => x(d.date))
      .y(d => y(d.count));

    const formatDate = d3.timeFormat("%b %d, %Y");

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#4682B4")
      .attr("stroke-width", 2)
      .attr("d", line);

    svg.append("g")
      .attr("transform", `translate(0,${height - MARGIN.bottom})`)
      .call(d3.axisBottom(x).ticks(6));

    svg.append("g")
      .attr("transform", `translate(${MARGIN.left},0)`)
      .call(d3.axisLeft(y).ticks(5));

    const overlay = svg.append("rect")
      .attr("class", "overlay")
      .attr("width", width - MARGIN.left - MARGIN.right)
      .attr("height", height - MARGIN.top - MARGIN.bottom)
      .attr("x", MARGIN.left)
      .attr("y", MARGIN.top)
      .style("opacity", 0)
      .style("pointer-events", "all")
      .on("mousemove", mousemove)
      .on("mouseout", mouseout);


    function mousemove(event) {
      const [xm] = d3.pointer(event);
      const date = x.invert(xm);
      const bisect = d3.bisector(d => d.date).left;
      const index = bisect(data, date, 1);
      const a = data[index - 1];
      const b = data[index] || a;
      const d = date - a.date > b.date - date ? b : a;
  
      // Get tooltip dimensions
      tooltip.html(`${d3.timeFormat("%b %d, %Y")(d.date)}<br><strong>${d.count}</strong> jobs`);
      const bbox = tooltip.node().getBoundingClientRect();
  
      // Calculate position with boundary checks
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
        .style("left", `${left}px`)
        .style("top", `${top}px`)
        .style("opacity", 1);
    }
  
    function mouseout() {
      tooltip.style("opacity", 0);
    }
  
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
