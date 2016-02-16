/* First of all - create a d3 chart */

const w = 600,
      h = 600

const svg = d3.select('body')
  .append('svg')
    .attr('width', w)
    .attr('height', h)

let circle = svg.selectAll('circle')

const force = d3.layout.force()
  .size([w,h])
  .on('tick', () =>
    circle
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
  )


const render = (members) => {
  circle = circle.data(members, d => d.id)

  circle
    .enter()
      .append('circle')
      .attr('fill', d => d.color)
      .attr('r', 12)
      .call(force.drag)

  circle
    .exit()
      .transition()
      .attr('r', 0)
      .remove()

  force
    .nodes(members)
    .start()
}


/*
  render([
    {id:1, color: 'red'},
    {id:2, color: 'green'},
    {id:3, color: 'blue'}
  ])
*/


/*
  Next of all - store the data
*/

let members = []

// helpers for adding and removing members
function add (member) {
  members.push({
    id: member.id,
    color: member.info.color
  })

  render(members)
}

function remove (member) {
  members = members.filter(m => m.id != member.id)

  render(members)
}

// hook up to our channel presence events
const KEY = document.body.getAttribute('data-key')
const CHANNEL = document.body.getAttribute('data-channel')


const pusher = new Pusher(KEY, {encrypted: true})
const channel = pusher.subscribe(CHANNEL)

channel
  .bind('pusher:member_added', add)
  .bind('pusher:member_removed', remove)
  .bind('pusher:subscription_succeeded', members => members.each(add))
