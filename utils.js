const fs = require("fs");

function fileExists(file) {
  let statFile;
  let ret;
  try {
    statFile = fs.statSync(file);
    ret = statFile.isFile();
  } catch (e) {
    ret = false;
  }
  return ret;
}
exports.fileExists = fileExists;

function pathExists(path) {
  let statFile;
  let ret;
  try {
    statFile = fs.statSync(path);
    ret = statFile.isDirectory();
  } catch (e) {
    ret = false;
  }
  return ret;
}
exports.pathExists = pathExists;

function readFile(file, encoding) {
  if (!fileExists(file)) {
    return null;
  }
  encoding = encoding || "utf8";
  return fs.readFileSync(file, { encoding: encoding });
}
exports.readFile = readFile;

function writeOnFile(file, content, encoding) {
  encoding = encoding || "utf8";
  let writeSync = fs.writeFileSync(file, content, { encoding: encoding });
  return writeSync === undefined;
}
exports.writeOnFile = writeOnFile;

function removeFile(file) {
  if (!fileExists(file)) {
    return false;
  }
  let unlinkSync = fs.unlinkSync(file);
  return unlinkSync === undefined;
}
exports.removeFile = removeFile;

function isCorrectPort(port) {
  return port >= 0 && port <= 65535;
}
exports.isCorrectPort = isCorrectPort;
