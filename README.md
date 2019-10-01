# Web App Status Report

Very basic app to periodically make HTTP requests to web apps to check if the app appears to be up and running. Tries to send email alerts if something appears to be down.

## Configuration

Create a `_config.js` file:

```
/* Array of web apps/pages to check.  group visually groups apps together. */
exports.apps = [
  {
    url: string,
    name: string,
    group: number | string
  },
]

/* Experimental ping feature.  Not yet implemented */
exports.pings = [
  {
    host: string,
    name: string,
    group: number | string
  }
]

/* App options for rendering or additional configuration */
exports.options = {
  title: string,      // Title of the app to use on status page
  mailerHost: string, // Ex: 'smtp-relay.gmail.com'
  mailerTo: string,
  mailerFrom: string,
  mailerSubject: string,
  mailerReplyTo: string,
}
```

## Auto Script

Use CRON or other scheduler to execute `auto.js`.

# Sample \_config.js

```
exports.apps = [
  { url: 'http://www.google.com', name: 'Google', group: 'Search Engines' },
  { url: 'https://duckduckgo.com/', name: 'DuckDuckGo', group: 'Search Engines' },

  { url: 'http://notarealwebsite-atall.net', name: 'MySpace', group: 'Social' },

  { url: 'http://definitelyalso-afakewebsite-aswell.net', name: 'Main Building Security Cameras', group: 'Work' },
]

exports.options = {
  title: 'Personal and Work Sites',
  mailerHost: 'smtp-relay.gmail.com',
  mailerFrom: 'mymonitor@mydomain.com',
  mailerTo: 'ITsupport@mydomain.com',
  mailerSubject: '[Status Alert] Personal and Work Sites',
  mailerReplyTo: 'ITsupport@mydomain.com',
}

```
