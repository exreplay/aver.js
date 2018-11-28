import webpack from "webpack";
import WebpackClientConfiguration from "./client.config";
import WebpackServerConfiguration from "./server.config";

export default class Builder {
    constructor() {
        this.compilers = [];
        const client = new WebpackClientConfiguration();
        const server = new WebpackServerConfiguration();

        this.compilers.push(client.config());
        this.compilers.push(server.config());
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