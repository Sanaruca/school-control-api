const { ApolloServer } = require("apollo-server"),
  resolvers = require("./graphql/resolvers"),
  fs = require("fs"),
  path = require("path");
require("./DataBase/mongo-conection");

const server = new ApolloServer({
  typeDefs: fs.readFileSync(path.join(__dirname, "schema.graphql"), "utf8"),
  resolvers,
});

server.listen().then(({ url }) => console.log(`server on url ${url}`));
