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

function generatePackage(folder) {
  var packagePath = nodepath.join(folder, "package.json");
  var packageName = nodepath.basename(fs.realpathSync(folder));
  var packageVersion = package.version;
  var packageJson = {
    "name": packageName,
    "private": true,
    "version": "0.0.0",
    "description": "Proxybot app.",
    "main": "app.js",
    "dependencies": {
      "proxybot": packageVersion
    },
    "scripts": {
      "start": "node app.js"
    },
    "author": "",
    "license": ""
  };

  fs.writeJsonSync(packagePath, packageJson);
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
  console.log("  package.json\n  %s", files.join("\n  "));
  prompt.confirm("Do you want to continue?", function(err, ans) {
    if (ans) {
      fs.ensureDirSync(_folder);
      fs.copySync(templatePath, _folder);
      generatePackage(_folder);
      console.log("Done.");
    } else {
      console.log("Cancelled.");
    }
  });
}

//==============================================================================
