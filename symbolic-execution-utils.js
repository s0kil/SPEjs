const esprima = require("esprima");
const esTraverse = require("estraverse");

const supportedTypes = [
  {
    type: "Int",
    defaultValue: 0
  },
  {
    type: "Real",
    defaultValue: 0.0
  },
  {
    type: "Boolean",
    defaultValue: false
  },
  {
    type: "String",
    defaultValue: ""
  }
];

function parseFunctionSignature(fName, fParameters, uParameters) {
  let sizeF = fParameters.length;
  let sizeU = Object.keys(uParameters).length;
  let ret = {
    errors: [],
    parameters: {}
  };
  let errorPrefix =
    'Error while parsing signature of function "' + fName + '": ';
  if (sizeF !== sizeU) {
    ret.errors.push(errorPrefix + "different signatures of the function");
    return ret;
  }
  let paramName;
  let paramValue;
  for (let k = 0; k < sizeF; k++) {
    paramName =
      fParameters[k].name !== undefined ? fParameters[k].name : "unknown";
    if (fParameters[k].type !== "Identifier") {
      ret.errors.push(
        errorPrefix + 'parameter "' + paramName + '" must be an "Identifier"'
      );
      continue;
    }
    if (uParameters[paramName] === undefined) {
      ret.errors.push(
        errorPrefix + 'parameter "' + paramName + '" is not specified'
      );
      continue;
    }
    if (!uParameters[paramName].hasOwnProperty("type")) {
      ret.errors.push(
        errorPrefix + 'parameter "' + paramName + '" has no type property'
      );
      continue;
    } else if (!typeIsSupported(uParameters[paramName].type)) {
      ret.errors.push(
        errorPrefix +
          'parameter "' +
          paramName +
          '" has a type not supported by Leena'
      );
      continue;
    }
    if (uParameters[paramName].hasOwnProperty("value")) {
      let typeofValueParam = typeof uParameters[paramName].value;
      let typeofTypeParam = typeof getDefaultValue(uParameters[paramName].type);
      if (typeofValueParam !== typeofTypeParam) {
        ret.errors.push(
          errorPrefix +
            'parameter "' +
            paramName +
            '" has different type from its value'
        );
        continue;
      }
      paramValue = uParameters[paramName].hasOwnProperty("value");
    }
    ret.parameters[paramName] = {
      type: uParameters[paramName].type,
      value: uParameters[paramName].hasOwnProperty("value")
        ? uParameters[paramName].value
        : getDefaultValue(uParameters[paramName].type)
    };
  }
  return ret;
}
exports.parseFunctionSignature = parseFunctionSignature;

function getTestCase(parameters) {
  let params = {};
  for (let pName in parameters) {
    if (parameters.hasOwnProperty(pName)) {
      params[pName] = parameters[pName].value;
    }
  }
  return params;
}
exports.getTestCase = getTestCase;

function getActualParameters(parameters) {
  let parametersValues = [];
  for (let pName in parameters) {
    if (parameters.hasOwnProperty(pName)) {
      parametersValues.push(parameters[pName].value);
    }
  }
  return parametersValues.join(", ");
}
exports.getActualParameters = getActualParameters;

function getDefaultValue(type) {
  for (let k = 0; k < supportedTypes.length; k++) {
    if (type === supportedTypes[k].type) {
      return supportedTypes[k].defaultValue;
    }
  }
  return null;
}
exports.getDefaultValue = getDefaultValue;

function typeIsSupported(type) {
  for (let k = 0; k < supportedTypes.length; k++) {
    if (type === supportedTypes[k].type) {
      return true;
    }
  }
  return false;
}

function getAST(instruction) {
  let instructionAST;
  let illegalStatement = false;
  try {
    instructionAST = esprima.parse(instruction);
  } catch (e) {
    let statementInstruction =
      "function leenaFunc(){for(;;){" + instruction + "}}";
    try {
      instructionAST = esprima.parse(statementInstruction);
      illegalStatement = true;
    } catch (e) {
      throw e;
    }
  }
  try {
    instructionAST = !illegalStatement
      ? instructionAST.body[0]
      : instructionAST.body[0].body.body[0].body.body[0];
  } catch (e) {
    throw e;
  }
  return instructionAST;
}
exports.getAST = getAST;

function isBranch(node) {
  if (!node.hasOwnProperty("type")) {
    return false;
  }
  return (
    node.type === "IfStatement" ||
    node.type === "ConditionalExpression" ||
    node.type === "SwitchStatement"
  );
}
exports.isBranch = isBranch;

function statementInsideTable(statementKey, table) {
  for (let k = 0; k < table.length; k++) {
    if (table[k].statementKey === statementKey) {
      return k;
    }
  }
  return -1;
}
exports.statementInsideTable = statementInsideTable;

function addStatementInTable(statementKey, branchIndex, table) {
  let index;
  if ((index = statementInsideTable(statementKey, table)) !== -1) {
    table[index].branchesIndexes.push(branchIndex);
  } else {
    let newEntry;
    newEntry = {};
    newEntry.statementKey = statementKey;
    newEntry.branchesIndexes = [branchIndex];
    table.push(newEntry);
  }
}
exports.addStatementInTable = addStatementInTable;

function conditionIsSymbolic(conditionAST, S, parameters) {
  let isSymbolic = false;
  esTraverse.traverse(conditionAST, {
    enter: function(node) {
      if (node.type === "CallExpression") {
        this.skip();
      }
    },
    leave: function(node, parent) {
      if (node.type === "Identifier") {
        if (parameters[node.name] !== undefined) {
          isSymbolic = true;
          this.break();
        } else {
          let prop;
          let symbolicContent;
          prop = S.hasProperty(node.name);
          if (prop.hasProperty) {
            symbolicContent = prop.content;
            if (symbolicContent !== undefined) {
              let astSymbolicContent;
              try {
                astSymbolicContent = esprima.parse(symbolicContent);
                esTraverse.traverse(astSymbolicContent, {
                  enter: function(node) {
                    if (node.type === "CallExpression") {
                      this.skip();
                    }
                  },
                  leave: function(node, parent) {
                    if (node.type === "Identifier") {
                      if (parameters[node.name] !== undefined) {
                        isSymbolic = true;
                        this.break();
                      }
                    }
                  }
                });
                if (isSymbolic) {
                  this.break();
                }
              } catch (e) {}
            }
          }
        }
      }
    }
  });
  return isSymbolic;
}
exports.conditionIsSymbolic = conditionIsSymbolic;
