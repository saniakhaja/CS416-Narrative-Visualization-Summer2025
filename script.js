const annotations = {
    Overall: "The national obesity rate in 2023 was 32.8%.",
    Sex: "Obesity rates are slightly higher among women (33.5%) compared to men (32.1%).",
    Age: "Obesity increases with age, peaking in the 45-54 range (39.2%).",
    "Race/Ethnicity": "Highest obesity rates occur among Black and AI/AN populations, with Asians having the lowest.",
    Education: "Obesity is inversely related to education level, with college grads having the lowest rate (27.1%).",
    Region: "Midwest and South show higher obesity rates than Northeast and West.",
    Summary: "Comparing across all demographics shows patterns of inequality in obesity prevalence.",
  };
  
  const width = 1000;
  const height = 500;
  const margin = { top: 40, right: 30, bottom: 50, left: 50 };
  
  let groupedData = {};
  
  d3.csv("data/data.csv").then((rawData) => {
    // Group data by category
    groupedData = d3.group(rawData, d => d.Category);
  
    // Convert percentages to numbers
    for (let [key, items] of groupedData) {
      groupedData.set(key, items.map(d => ({
        group: d.Group,
        value: +d.Percent,
        ci: d.ConfidenceInterval
      })));
    }
  
    // Show initial scene
    showScene("Overall");
  });
  

function showScene(sceneName) {
    const container = d3.select("#chart");
    container.selectAll("*").remove();
    d3.selectAll(".tooltip").remove();
  
    const annotation = annotations[sceneName];
    d3.select("#annotation").text(annotation);
  
    const svg = container
      .append("svg")
      .attr("width", width)
      .attr("height", height);
  
    let sceneData;
  
    if (sceneName === "Summary") {
      // Combine all categories into one flat array with Category info
      sceneData = Array.from(groupedData.entries()).flatMap(([category, items]) =>
        items.map(d => ({
          category,
          group: d.group,
          value: d.value,
          ci: d.ci
        }))
      );
  
      // Create nested data by category
      const categories = [...new Set(sceneData.map(d => d.category))];
      const x0 = d3
        .scaleBand()
        .domain(categories)
        .range([margin.left, width - margin.right])
        .paddingInner(0.5);
  
      const x1 = d3
        .scaleBand()
        .domain(sceneData.map(d => d.group))
        .range([0, x0.bandwidth()])
        .padding(0.5);

      const y = d3
        .scaleLinear()
        .domain([0, d3.max(sceneData, d => d.value)])
        .nice()
        .range([height - margin.bottom, margin.top]);
  
      svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x0))
        .selectAll("text")
        .attr("transform", "rotate(0)")
        .style("text-anchor", "middle");
  
      svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).tickFormat(d => d + "%"));
  
      const color = d3.scaleOrdinal(d3.schemeTableau10);
  
      const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("padding", "8px")
        .style("background", "rgba(0,0,0,0.7)")
        .style("color", "#fff")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("opacity", 0);
  
      const grouped = d3.group(sceneData, d => d.category);

      const barWidth = 20; // Set a fixed width for all bars

      svg.selectAll(".category")
        .data(categories)
        .enter()
        .append("g")
        .attr("transform", d => `translate(${x0(d)},0)`)
        .each(function (category) {
          const groupData = grouped.get(category);
          const groupCount = groupData.length;
          const groupG = d3.select(this);
      
          // Calculate starting offset to center the group
          const groupWidth = groupCount * barWidth;
          const offset = (x0.bandwidth() - groupWidth) / 2;
      
          groupG.selectAll("rect")
            .data(groupData)
            .enter()
            .append("rect")
            .attr("x", (_, i) => offset + i * barWidth)
            .attr("y", d => y(d.value))
            .attr("height", d => y(0) - y(d.value))
            .attr("width", barWidth)
            .attr("fill", d => color(d.group))
            .on("mouseover", (event, d) => {
              tooltip.transition().duration(200).style("opacity", 1);
              tooltip.html(`<strong>${d.category} - ${d.group}</strong><br/>${d.value}%<br/>95% CI: ${d.ci}`);
            })
            .on("mousemove", event => {
              tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => {
              tooltip.transition().duration(200).style("opacity", 0);
            });
        });
  
      // Chart title
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", "18px")
        .attr("font-weight", "bold")
        .text("Summary: Obesity Rates by Demographic Group");
  
      // Y-axis label
      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", 15)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .text("Percent");
  
    } else {
      // Existing scene logic (e.g., for "Age", "Sex", etc.)
      const sceneData = groupedData.get(sceneName);
  
      const x = d3
        .scaleBand()
        .domain(sceneData.map(d => d.group))
        .range([margin.left, width - margin.right])
        .padding(0.1);
  
      const y = d3
        .scaleLinear()
        .domain([0, d3.max(sceneData, d => d.value)])
        .nice()
        .range([height - margin.bottom, margin.top]);
  
      svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(0)")
        .style("text-anchor", "middle");
  
      svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).tickFormat(d => d + "%"));
  
      const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("padding", "8px")
        .style("background", "rgba(0,0,0,0.7)")
        .style("color", "#fff")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("opacity", 0);
  
      svg.selectAll("rect")
        .data(sceneData)
        .enter()
        .append("rect")
        .attr("x", d => x(d.group))
        .attr("y", d => y(d.value))
        .attr("height", d => y(0) - y(d.value))
        .attr("width", x.bandwidth())
        .attr("fill", "steelblue")
        .on("mouseover", (event, d) => {
          tooltip.transition().duration(200).style("opacity", 1);
          tooltip.html(`<strong>${d.group}</strong><br/>${d.value}%<br/>95% CI: ${d.ci}`);
        })
        .on("mousemove", (event) => {
          tooltip
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => {
          tooltip.transition().duration(200).style("opacity", 0);
        });
  
      // Chart title
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", "18px")
        .attr("font-weight", "bold")
        .text(`${sceneName} Obesity Rates`);
  
      // Y-axis label
      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", 15)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .text("Percent");
    }
  }
  
  