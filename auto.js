/**
 * Get the HTTP status of every app in config then
 * email a report to somebody if an app appears to be down.
 */
const axios = require('axios')
const nodemailer = require('nodemailer')
const apps = require('./_config.js').apps
const options = require('./_config.js').options
const { interceptorSuccess, interceptorError } = require('./axiosConfig.js')

/**
 * Axios response interceptor to keep unreachable URLs from throwing errors.
 */
axios.interceptors.response.use(interceptorSuccess, interceptorError)

/**
 * Base options for each Axios.get promise
 */
const axiosBaseOptions = {
  /* Keeps any axios request promise from rejecting.  We don't want it
  rejecting on HTTP status 4xx/5xx because we want to display that information. */
  validateStatus: status => true,
}

/**
 * Axios.get promises for each app's test url
 */
const axiosRequests = apps.map(app => axios.get(app.url, axiosBaseOptions))

/**
 * Nodemailer setup
 */
const mailer = nodemailer.createTransport(
  {
    host: options.mailerHost,
    secure: true,
  },
  {
    from: options.mailerFrom,
    subject: options.mailerSubject,
    replyTo: options.mailerReplyTo,
  },
)

/**
 * Handle all Axios.get promises then use Axios.spread helper to handle
 * all promise resolutions.  Since we don't know how many promises we're dealing
 * with, use the spread operator to create an array of all responses.
 */
axios
  .all(axiosRequests)
  .then(
    axios.spread((...axiosResponses) => {
      /* Promises are done, create an array of "Not OK" statuses. */
      let statuses = axiosResponses.filter(app => app.status >= 500)

      if (statuses.length > 0) {
        /* Output the failed statuses to STDOUT which can be piped to slackr */
        console.log('**** APP STATUS ALERT ****')
        console.log(statuses)

        /* Mail these statuses somewhere, return a promise from mailer */
        return mailer.sendMail(
          {
            to: options.mailerTo,
            text: statuses.map(status => JSON.stringify(status)).join('\n'),
          },
          (err, success) => {
            if (err) {
              console.log('Mailer errored: ')
              console.log(err)
            }
            // console.log('Mailer finished.')
            // console.log(success)
          },
        )
      }

      // console.log('Nothing to do.')
    }),
  )
  .catch(err => {
    console.log('There was an error while running the auto script.')
    console.log(err)
  })
