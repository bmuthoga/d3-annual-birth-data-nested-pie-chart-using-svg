window.addEventListener('DOMContentLoaded', () => {
  let width = 600
  let height = 600
  let minYear = d3.min(birthData, d => d.year)
  let maxYear = d3.max(birthData, d => d.year)
  
  let months = birthData.reduce((acc, nextVal) => {
    if (!acc.includes(nextVal.month)) {
      acc.push(nextVal.month)
    }
    return acc
  }, [])
  
  let colorScale = d3.scaleOrdinal()
                      .domain(months)
                      .range(d3.schemeCategory20c)
  
  let innerColorScale = d3.scaleOrdinal()
                          .domain([1, 2, 3, 4])
                          .range(d3.schemeCategory10)
  
  d3.select('svg')
      .attr('width', width)
      .attr('height', height)
    .append('g')
      .classed('chart', true)
      .attr('transform', `translate(${width / 2}, ${height / 2})`)
  
  d3.select('input')
    .property('min', minYear)
    .property('max', maxYear)
    .property('value', minYear)
    .on('input', () => generateOuterChart(+d3.event.target.value))
  
  generateOuterChart(minYear)
  
  function generateOuterChart(year) {
    let yearData = birthData.filter(d => d.year === year)
  
    let arcs = d3.pie()
                  .value(d => d.births)
                  .sort((a, b) => {
                    if (months.indexOf(a.month) < months.indexOf(b.month)) return -1
                    else return 1
                  })
                  (yearData)
                      
  
    let pathGenerator = d3.arc()
                          .outerRadius(width / 2 - 10)
                          .innerRadius(width / 4)
  
    let outerUpdate = d3.select('.chart')
                        .selectAll('.outer-arc')
                        .data(arcs)
  
    d3.select('#title')
      .text(`Births by months and quarter for ${year}`)
  
    outerUpdate
      .enter()
      .append('path')
        .classed('arc', true)
        .classed('outer-arc', true)
      .merge(outerUpdate)
        .attr('fill', d => colorScale(d.data.month))
        .attr('d', pathGenerator)
  
    generateInnerChart(yearData)
  }
  
  function generateInnerChart(yearData) {
    let quarterData = getQuarterData(yearData)
  
    let innerArcs = d3.pie()
                      .sort((a, b) => {
                        if (a.qtr < b.qtr) return -1
                        else return 1
                      })
                      .value(d => d.births)
                      (quarterData)
  
    let innerPathGenerator = d3.arc()
                                .outerRadius(width / 4)
                                .innerRadius(0)
  
    let innerUpdate = d3.select('.chart')
                        .selectAll('.inner-arc')
                        .data(innerArcs)
  
    innerUpdate
      .enter()
      .append('path')
        .classed('arc', true)
        .classed('inner-arc', true)
      .merge(innerUpdate)
        .attr('fill', d => innerColorScale(d.data.qtr))
        .attr('d', innerPathGenerator)
  }
  
  function getQuarterData(yearData) {
    let result = [1, 2, 3, 4].map(num => { 
      return { qtr: num, births: 0 }
    })
  
    return yearData.reduce((acc, nextVal) => {
      acc[Math.floor(months.indexOf(nextVal.month) / 3)]['births'] += nextVal.births
      return acc
    }, result)
  }
})
