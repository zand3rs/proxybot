/*
 * Proxybot
 *
 */

module.exports = Proxybot;


var _ = require("lodash");
var http = require("http");
var httpProxy = require("http-proxy");
var ProxyRules = require("./lib/proxy-rules");
var settings = require("./lib/settings");


//==============================================================================
//-- constructor

function Proxybot(options) {
  var self = this;
  var _options = options || {};

  //-- try to load config and responses
  var cwd = process.cwd();
  var configPath = _options.configPath || (cwd + "/config");
  var responsesPath = _options.responsesPath || (cwd + "/responses");

  var config = _.merge(settings.loadConfig(__dirname + "/config"),
                       settings.loadConfig(configPath));
  var responses = _.merge(settings.loadResponses(__dirname + "/responses"),
                          settings.loadResponses(responsesPath));

  var host = _options.host || config.http.host;
  var port = _options.port || config.http.port;
  var baseUrl = "http://" + host + ":" + port;
  var localPattern = new RegExp("^(" + baseUrl + ")?/(.+)");

  var proxy = httpProxy.createProxy();
  var proxyRules = new ProxyRules(config.routes);

  //-- properties
  Object.defineProperty(self, "config",     { value: config });
  Object.defineProperty(self, "responses",  { value: responses });
  Object.defineProperty(self, "host",       { value: host });
  Object.defineProperty(self, "port",       { value: port });
  Object.defineProperty(self, "baseUrl",    { value: baseUrl });
  Object.defineProperty(self, "proxy",      { value: proxy });
  Object.defineProperty(self, "proxyRules", { value: proxyRules });
  Object.defineProperty(self, "localRoute", { value: {
    match: function(target) {
      return _.get(localPattern.exec(target), 2);
    }
  }});

}

//------------------------------------------------------------------------------

Proxybot.prototype.start = function() {
  var self = this;

  function requestListener(req, res) {
    self._responseHandler(req, res);
    self._requestHandler(req, res);
  }

  http.createServer(requestListener).listen(self.port, self.host);
  console.log("Listening on:", self.baseUrl);
};

//------------------------------------------------------------------------------

Proxybot.prototype._responseHandler = function(req, res) {
  var self = this;

  var method = _.lowerCase(req.method);
  var serverError = _.get(self.responses, "500");

  res.send = function(path) {
    var response = _.get(self.responses, (path || "").replace(/\//g, "."));
    var payload = _.get(response, method) || response || serverError;

    var statusCode = _.get(payload, "statusCode", 200);
    var headers = _.get(payload, "headers", {});
    var body = _.get(payload, "body", "");

    if (!_.isString(body)) {
      body = JSON.stringify(body);
    }

    res.setHeader("Content-Length", Buffer.byteLength(body));
    res.writeHead(statusCode, headers);
    res.end(body);
  };
};

//------------------------------------------------------------------------------

Proxybot.prototype._requestHandler = function(req, res) {
  var self = this;

  console.log("Request: %s %s", req.method, req.url);

  var target = self.proxyRules.match(req.url);
  if (!_.isString(target) || _.isEmpty(target)) {
    return res.send("404");
  }

  console.log("Target:", target);

  //-- check if target is local
  var path = self.localRoute.match(target);

  if (path) {
    //-- local request
    res.send(path);
  } else {
    //-- proxy request
    //-- proxy.web expects that the url be modified :(
    req.url = _.replace(req.url, /^[^?]+/, "");
    console.log("Query:", req.url);

    self.proxy.web(req, res, { target: target }, function(e) {
      console.log("Error:", e);
      res.send("500");
    });
  }
};

//==============================================================================
