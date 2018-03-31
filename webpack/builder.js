const webpack       = require("webpack");
const clientConfig  = require("./client.config");
const serverConfig  = require("./server.config");
const compilers = [];

compilers.push(clientConfig);
compilers.push(serverConfig);

compilers.map(compiler => {
   return new Promise((resolve, reject) => {
      const compile = webpack(compiler);

      compile.run((err, stats) => {
         if (err) {
            console.error(err);
            return reject(err);
         }
         resolve(stats);
      })
   });
});

Promise.all(compilers)
   .then(stats => {
   });