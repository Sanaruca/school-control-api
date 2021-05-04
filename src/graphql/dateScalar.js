const { GraphQLScalarType } = require("graphql"),
  { isDate } = require("validator");

const parseValue = (value) => {
    // esto es para verificar y pasar el dato como fecha // el valor que recive es cadena
    // console.log(value, 1, isDate(value));
    if (isDate(value)) return new Date(value);
    throw new Error("test parce");
  },
  serialize = (value) => {
    // para el output de response para graphql // supongo que es para pasarlo a JSON como cadena
    // console.log(value,2);
    const valueAsString = value.toISOString().slice(0, 10);
    if (isDate(value)) return valueAsString;
    throw new Error("test serialize");
  },
  parceLiteral = (ast) => {
    // For input payload i.e. for mutation
    // console.log(value,3);
    if (isDate(ast.value)) return new Date(ast.value);
    throw new Error("test lteral");
  };

module.exports = new GraphQLScalarType({
  name: "Date",
  description: "Format: YYYY-MM-DD",
  serialize,
  parseValue,
  parceLiteral,
});
