# proxybot

HTTP Proxy for developers. Powered by [http-proxy](https://github.com/nodejitsu/node-http-proxy).
The server could be configured to proxy certain urls or return custom responses.


## Installation

```sh
# Local install
$ npm install proxybot

# Global install
$ sudo npm install -g proxybot
```

## Initialization

Create new proxybot server instance.

```sh
# Local install
$ node_modules/.bin/proxybot new .

# Global install
$ proxybot new <project_dir>
```

The following files will be created under the project directory provided:

```
app.js
config/
  http.js
  routes.js
responses/
  404.js
  500.js
  index.js
```
