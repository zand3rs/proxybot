/*
 * ProxyRules
 *
 */

module.exports = ProxyRules;


var _ = require("lodash");

//==============================================================================
//-- constructor

function ProxyRules(routes) {
  var self = this;

  var _routes = routes || {};
  var _rules = _.reduce(_routes, function(out, v, k) {
    var match = k.match(/(:[^:\/\?]+)/g);
    var route = _.reduce(match, function(out, item) {
      return _.replace(out, item, "([^\/\?]+)");
    }, "^" + k + "(\\?.*)?$");
    out[route] = [v, match];
    return out;
  }, {});

  Object.defineProperty(self, "rules", { value: _rules });
}

//------------------------------------------------------------------------------

ProxyRules.prototype.match = function(url) {
  var self = this;

  var _url = _.isString(url) ? url : "";
  var target = null;

  _.forEach(self.rules, function(v, k) {
    var match = _url.match(new RegExp(k));
    var _source = _.head(match);
    var _values = _.tail(match);
    var _target = _.get(v, 0);
    var _params = _.get(v, 1);

    if (_source && _target) {
      target = _target;
      _.forEach(_params, function(from, i) {
        var to = _.get(_values, i);
        if (to) {
          target = _.replace(target, from, to);
        }
      });
      return false;
    }
  });

  return target;
};

//==============================================================================
