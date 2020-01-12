// partial evaluation
const fs = require("fs");
const babel = require("babel-core");
const babelPlugin = require("./babel-plugin");

// read the filename from the command line arguments
let fileName = process.argv[2];

// read the code from this file
fs.readFile(fileName, function(err, data) {
  if (err) throw err;

  // convert from a buffer to a string
  let src = data.toString();

  // use our plugin to transform the source
  let out = babel.transform(src, {
    plugins: [babelPlugin]
  });

  console.log("Partially Evaluated code:");
  console.log(out.code);
  // print the generated code to a new file
  let outputPath = fileName.split(".", 1) + "_out.js";
  fs.writeFile(outputPath, out.code, function(err) {
    if (err) {
      return console.log(err);
    }
  });
});
