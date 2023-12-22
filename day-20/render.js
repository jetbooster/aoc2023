const cy = cytoscape({
  container: document.getElementById('cy'),
  style: [
    {
      selector: 'node',
      style: {
        label: 'data(id)'
      }
    },
    {
      selector: 'edge',
      style: {
        width: 1,
        'target-arrow-shape': 'triangle',

        'curve-style': 'bezier'
      }
    }
  ]
})
cy.add({
  group: 'nodes',
  data: { id: 'rx' }
})
Object.entries(jsonOutput).forEach(([key, val]) => {
  cy.add({
    group: 'nodes',
    data: { id: val.name, ...val }
  })
})
Object.entries(jsonOutput).forEach(([key, val]) => {
  val.outputs.forEach((output) => {
    cy.add({
      group: 'edges',
      data: {
        source: val.name,
        target: output
      }

    })
  })
})

cy.layout({ name: 'cose' }).run()
