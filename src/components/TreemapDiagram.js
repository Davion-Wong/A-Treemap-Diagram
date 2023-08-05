import React, {useState, useEffect} from 'react';
import * as d3 from 'd3';

const Treemap = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Fetch the data
    fetch('https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json')
      .then(response => response.json())
      .then(data => setData(data));
  }, []);

  useEffect(() => {
    if (data) {
      const hierarchy = d3.hierarchy(data).sum(d => d.value);
      const treemapRoot = d3.treemap().size([1200, 600])(hierarchy);

      const svg = d3.select('#treemap-svg')
        .attr('width', 1200)
        .attr('height', 800);
        
      const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

      const tooltip = d3.select('body')
                        .append('div')
                        .attr('id', 'tooltip')
                        .style('visibility', 'hidden');

      const cell = svg.selectAll('g')
                      .data(treemapRoot.leaves())
                      .enter()
                      .append('g')
                      .attr('transform', d => `translate(${d.x0},${40 + d.y0})`);

      cell.append('rect')
          .attr('class', 'tile')
          .attr('x', d => 0)
          .attr('y', d => 0)
          .attr('width', d => d.x1 - d.x0)
          .attr('height', d => 60 +  d.y1 - d.y0)
          .attr('fill', d => colorScale(d.data.category))
          .attr('stroke', 'white')
          .attr('stroke-width', '1')
          .attr('data-name', d => d.data.name)
          .attr('data-category', d => d.data.category)
          .attr('data-value', d => d.data.value)
          .on('mouseover', function (e, d) {
            const [x, y] = d3.pointer(e, window);
            tooltip.style('visibility', 'visible')
              .style('left', `${x + 20}px`)
              .style('top', `${y - 80}px`)
              .html(`
                <div>Name: ${d.data.name}</div>
                <div>Genre: ${d.data.category}</div>
                <div>Value: ${d.data.value}</div>
              `);
          })
          .on('mouseout', function () {
            tooltip.style('visibility', 'hidden');
          });
        
        // append the text to the cell
        cell.append('text')
          .attr('class', 'tile-text')
          .selectAll('tspan')
          .data(d => {
            const rectWidth = d.x1 - d.x0;
            const pixelsPerChar = rectWidth > 150 ? 5 : 7; // Change these numbers based on your requirement
            const words = d.data.name.split(' ');
            let lines = [];
            let line = [];
            
            words.forEach(word => {
              line.push(word);
              if (line.join(' ').length * pixelsPerChar > rectWidth) {
                line.pop();
                lines.push(line.join(' '));
                line = [word];
              }
            });
            
            if (line.length > 0) lines.push(line.join(' '));
            
            // Ensure the text fits vertically in the rectangle as well
            const rectHeight = d.y1 - d.y0;
            const maxLines = Math.floor(rectHeight / 12); // 12 is the line height
            if (lines.length > maxLines) {
              lines = lines.slice(0, maxLines);
            }
          
            return lines;
          })          
          .join('tspan')
          .attr('x', 4)
          .attr('y', (d, i, nodes) => {
            const parentNode = nodes[i].parentNode.__data__;
            const rectHeight = parentNode.y1 - parentNode.y0;
            const lineHeight = 12; // adjust line height accordingly
            const totalLines = nodes.length;
            const totalTextHeight = totalLines * lineHeight;
            const startY = 8 + (rectHeight - totalTextHeight) / 2; // start drawing text in the middle of the rectangle
            return startY + i * lineHeight; // each subsequent line is offset by the lineHeight
          })
          .text(d => d)
          .style('font-size', '8px') // or whatever font size you prefer
          .style('fill', 'white') // or any other color you prefer
          .on('mouseover', function (e, d) {
            const [x, y] = d3.pointer(e, window);
            const data = this.parentNode.__data__.data; // Use the data from the parent 'g' element
            tooltip.style('visibility', 'visible')
              .style('left', `${x + 20}px`)
              .style('top', `${y - 80}px`)
              .html(`
                <div>Name: ${data.name}</div>
                <div>Genre: ${data.category}</div>
                <div>Value: ${data.value}</div>
              `);
          })
          .on('mouseout', function () {
            tooltip.style('visibility', 'hidden');
          });

          // Get all unique categories
          const categories = Array.from(new Set(data.children.map(child => child.name)));

          const legend = svg.append('g')
            .attr('id', 'legend')
            .attr('transform', `translate(60, ${10 + treemapRoot.height})`);

          categories.forEach((category, i) => {
            const legendItem = legend.append('g')
              .attr('transform', `translate(${i * 150}, 0)`);

            legendItem.append('rect')
              .attr('class', 'legend-item')
              .attr('width', 15)
              .attr('height', 15)
              .attr('fill', colorScale(category));

            legendItem.append('text')
              .attr('x', 20)
              .attr('y', 12)
              .text(category);
          });

      
    }
  }, [data]);

  return (
    <div id="treemap">
      <h1 id="title">Movie Sales</h1>
      <p id="description">Top 100 Highest Grossing Movies Grouped By Genre</p>
      <svg id="treemap-svg"></svg>
    </div>
  );
}

export default Treemap;