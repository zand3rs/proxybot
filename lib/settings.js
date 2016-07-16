/*
 * Settings
 *
 */

var _ = require("lodash");
var include = require("include-all");


//==============================================================================

module.exports = {

  loadConfig: function(path) {
    return _.merge(include({
      dirname     : path,
      filter      : /^(?!local)(.+)\.js$/,
      excludeDirs : /^\.git$/,
      optional    : true
    }), loadLocalConfig(path));
  },

  //----------------------------------------------------------------------------

  loadResponses: function(path) {
    return include({
      dirname     : path,
      filter      : /^(.+)\.js$/,
      excludeDirs : /^\.git$/,
      optional    : true
    });
  },

};

//==============================================================================

function loadLocalConfig(path) {
  var configPath = path + "/local";
  var localConfig = {};

  try {
    localConfig = require(configPath);
  } catch (e) {
  }

  return localConfig;
}

//==============================================================================
