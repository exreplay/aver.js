import webpack from 'webpack';
import WebpackClientConfiguration from './client.config';
import WebpackServerConfiguration from './server.config';

export default class Builder {
    constructor() {
        this.compilers = [];
        const client = new WebpackClientConfiguration();
        const server = new WebpackServerConfiguration();

        this.compilers.push(client.config());
        this.compilers.push(server.config());
    }
    
    compile() {
        const promises = [];
        
        for (const compiler of this.compilers) {
            promises.push(new Promise((resolve, reject) => {
                const compile = webpack(compiler);
                
                compile.run();
                compile.hooks.done.tap('load-resource', stats => {
                    const info = stats.toJson();
    
                    if (stats.hasErrors()) {
                        console.error(info.errors);
                        return reject(info.errors);
                    }
    
                    resolve(info);
                });
            }));
        }
        
        return Promise.all(promises);
    }
}