import webpack from "webpack";
import clientConfig from "./client.config";
import serverConfig from "./server.config";

export default class Builder {
    constructor() {
        this.compilers = [];
        this.compilers.push(clientConfig);
        this.compilers.push(serverConfig);
    }
    
    compile() {
        this.compilers.map(compiler => {
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
        
        return Promise.all(this.compilers);
    }
}