const _ = require("underscore");
const ParserExpression = require("./smt-wrapper/parser-expression");
const SMTSolver = require("./smt-wrapper/smt-solver");
const sUtils = require("./symbolic-execution-utils");

const SymbolicExecution = (function() {
  function SE(uParameters, solver) {
    this.response = {};
    this.response.errors = [];
    this.response.testCases = [];
    this.response.results = [];
    this.uParameters = uParameters;
    this.smtSolver = new SMTSolver(solver.name, solver.path, solver.tmpPath);
  }
  SE.prototype.solvePathConstraint = function(pathConstraint) {
    let params = [];
    for (let pName in this.uParameters) {
      if (this.uParameters.hasOwnProperty(pName)) {
        params.push({
          id: pName,
          type: this.uParameters[pName].type,
          value: this.uParameters[pName].value,
          symbolicallyExecute: true
        });
      }
    }
    let parserExpression = new ParserExpression(
      pathConstraint,
      params,
      this.smtSolver.getName()
    );
    try {
      let callbackParse = parserExpression.parse();
      if (callbackParse.err) {
        let errorMessage;
        if (callbackParse.err instanceof Error) {
          errorMessage = callbackParse.err.message;
        } else {
          errorMessage = "Error while parsing expression";
        }
        this.response.errors.push(errorMessage);
        return { err: errorMessage, res: null };
      } else {
        let smtResponse = callbackParse.res;
        console.log(smtResponse);
        let cbSmtSolverRun = this.smtSolver.run(smtResponse);
        if (cbSmtSolverRun.err) {
          this.response.errors.push("Unable to run SMT expression");
          return { err: true, res: null };
        } else {
          let smtResponse = this.smtSolver.parseResponse(cbSmtSolverRun.res);
          this.response.results.push(smtResponse);
          return { err: false, res: smtResponse };
        }
      }
    } catch (e) {
      this.response.errors.push(e.message);
      return { err: true, res: null };
    }
  };
  return SE;
})();
module.exports = SymbolicExecution;
