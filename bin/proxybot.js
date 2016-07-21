#!/usr/bin/env node

var fs = require("fs-extra");
var nodepath = require("path");
var package = require(nodepath.join("..", "package.json"));

var program = require("commander");
var prompt = require("prompt");
var args = process.argv.slice(2);

program
  .version(package.version, "-v, --version")
  .usage("[options] [command]");

program
  .command("new [app]")
  .description("Create new proxybot app.")
  .action(function(app, options) {
    console.log("app:", app);
    create(app);
  });

program.parse(process.argv);
!args.length && program.help();

//==============================================================================

function getFiles(root) {
  var files = [];
  var _root = new RegExp("^" + root + "[\/\\\\]*");

  function readdir(path) {
    fs.readdirSync(path).forEach(function(file) {
      var subpath = nodepath.join(path, file);
      if (fs.lstatSync(subpath).isDirectory()) {
        readdir(subpath);
      } else {
        files.push(subpath.replace(_root, ""));
      }
    });
  }

  readdir(root);
  return files;
}

//------------------------------------------------------------------------------

function create(folder) {
  var _folder = nodepath.normalize(folder || ".");

  prompt.colors = false;
  prompt.message = "";
  prompt.delimiter = "";
  prompt.start();

  var templatePath = nodepath.join(__dirname, "..", "template");
  var files = getFiles(templatePath);
  console.log("The ff. files will be created in '%s' directory:", _folder);
  console.log("  %s", files.join("\n  "));
  prompt.confirm("Do you want to continue?", function(err, ans) {
    if (ans) {
      if (! /^[.][.]?[\/\\]*$/.test(_folder)) {
        fs.mkdirsSync(_folder);
      }
      fs.copySync(templatePath, _folder);
      console.log("Done.");
    } else {
      console.log("Cancelled.");
    }
  });
}

//==============================================================================
