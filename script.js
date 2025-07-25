d3.csv("data/data.csv").then(data => {
    data.forEach(d => {
      d.Percent = +d.Percent;
    });
  
    const width = 800;
    const height = 500;
    const margin = { top: 40, right: 20, bottom: 100, left: 60 };
  
    const svg = d3.select("#chart")
      .append("svg")
      .attr("width", width)
      .attr("height", height);
  
    const x = d3.scaleBand()
      .domain(data.map(d => d.Group))
      .range([margin.left, width - margin.right])
      .padding(0.1);
  
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.Percent)]).nice()
      .range([height - margin.bottom, margin.top]);
  
    svg.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-40)")
      .style("text-anchor", "end");
  
    svg.append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(y));
  
    svg.selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", d => x(d.Group))
      .attr("y", d => y(d.Percent))
      .attr("height", d => y(0) - y(d.Percent))
      .attr("width", x.bandwidth())
      .attr("fill", "#69b3a2");
  });
  