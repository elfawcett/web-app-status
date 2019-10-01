const express = require('express')()
const axios = require('axios')

const apps = require('./_config.js').apps
const options = require('./_config.js').options
const { interceptorSuccess, interceptorError } = require('./axiosConfig.js')

/**
 * Axios response interceptor to keep unreachable URLs from throwing errors.
 */
axios.interceptors.response.use(interceptorSuccess, interceptorError)

function styledList(array) {
  let elements = array.map(el => {
    return `<li style="
      margin-bottom: 0.5em;
      font-size: 1.5em;
      text-align: center;
    ">
      ${el.name}
      <br>
      <span style="
        font-size: 0.9em;
        display: block;
        color: ${el.status < 500 ? 'dodgerblue' : 'tomato'};
      ">
        ${el.status < 500 ? 'Probably OK' : 'Not OK'} (${el.status})
      </span>
    </li>`.replace(/^(\s{2})+|\n+/gm, '')
  })

  return `<ul style="list-style: none; padding: 0;">
    ${elements.join('')}
  </ul>`.replace(/^(\s{2})+|\n+/gm, '')
}

function Body(content) {
  return `<h1>${options.title}</h1>
    <h3>Generated at ${new Date().toLocaleString()}</h3>

    ${content}

    <script type="text/javascript">(window.onload = function() {
      setTimeout(function() { document.location.reload(true) }, 30000)
    })()</script>
  `.replace(/^(\s{2})+|\n+/gm, '')
}

express.get('/', (req, res) => {
  axios
    /* axios validateStatus: Return true always so promises won't ever reject. */
    .all(apps.map(app => axios.get(app.url, { validateStatus: status => true })))
    .then(
      axios.spread((...appRequests) => {
        /* Create a <ul> for each app group in apps */
        const lists = appRequests.reduce((accumulator, request) => {
          /* Check accumulator for group name as a prop, create if absent */
          let group = request.group
          if (group in accumulator === false) accumulator[group] = []

          /* Filter items by group */
          accumulator[group].push(request)

          return accumulator
        }, {})

        /* Form body template string */
        let body = `<div style="display: flex; flex-wrap: wrap;">`

        for (let group in lists) {
          body += `<div style="
            flex-grow: 1;
            border: solid 1px black;
            padding: 0.5em;
            margin: 0.25em;
          ">
            <h3 style="margin-top: 0;">${group}</h3>
            ${styledList(lists[group])}
          </div>
            `
        }

        body += `</div>`
        body = body.replace(/^(\s{2})+|\n+/gm, '')

        /* Send styled Body */
        res.send(Body(body))
      }),
    )
    .catch(err => {
      console.log(err)
      res.send(err.message)
    })
})

express.listen(4000, () => console.log(`listening on 4000`))
