import Server from './server';
import path from 'path';
import fs from 'fs';

export default class Core {
    run(hooks = {}) {
        this.loadGlobalConfig();
        new Server(hooks, this.globalConfig);
        this.initModuleAliases();
    }

    initModuleAliases() {
        const ModuleAlias = require('module-alias');
        const aliases = {
            '@models': `${process.env.API_PATH}/models`,
            '@errors': `${process.env.API_PATH}/errors`,
            '@middlewares': `${process.env.API_PATH}/middlewares`,
            '@mail': `${process.env.API_PATH}/mail`,
            '@database': `${process.env.API_PATH}/database`,
            '@queues': `${process.env.API_PATH}/queues`,
            '@routes': `${process.env.API_PATH}/routes`
        };

        if (typeof this.globalConfig.aliases !== 'undefined') Object.assign(aliases, this.globalConfig.aliases);

        ModuleAlias.addAliases(aliases);
    }
    
    build() {
        const Builder = require('vue-ssr-renderer').default;
        const builder = new Builder();
        return builder.compile();
    }

    init() {
        console.log('Check if required folder and files exist...');

        if (fs.existsSync(process.env.PROJECT_PATH)) {
            console.log('Root directory "src" already exists');
        } else {
            console.log('Root directory does not exist. Setting it up...');
            const appDir = path.resolve(require.resolve('vue-ssr'), '../app');
            const ncp = require('ncp').ncp;
            ncp(path.resolve(appDir, './src'), process.env.PROJECT_PATH, (err) => {
                if (err) return console.error(err);

                console.log('Root directory successfully copied!');
                console.log('Copying necessary files...');
                fs.copyFileSync(path.resolve(appDir, './.eslintignore'), path.resolve(process.env.PROJECT_PATH, '../.eslintignore'));
                fs.copyFileSync(path.resolve(appDir, './.eslintrc.js'), path.resolve(process.env.PROJECT_PATH, '../.eslintrc.js'));
                fs.copyFileSync(path.resolve(appDir, './index.js'), path.resolve(process.env.PROJECT_PATH, '../index.js'));
                fs.copyFileSync(path.resolve(appDir, './vue-ssr-config.js'), path.resolve(process.env.PROJECT_PATH, '../vue-ssr-config.js'));
                fs.copyFileSync(path.resolve(appDir, './.gitignore'), path.resolve(process.env.PROJECT_PATH, '../.gitignore'));
                fs.copyFileSync(path.resolve(appDir, './Dockerfile'), path.resolve(process.env.PROJECT_PATH, '../Dockerfile'));
                fs.copyFileSync(path.resolve(appDir, './jsconfig.json'), path.resolve(process.env.PROJECT_PATH, '../jsconfig.json'));
                fs.copyFileSync(path.resolve(appDir, './.gitlab-ci.yml'), path.resolve(process.env.PROJECT_PATH, '../.gitlab-ci.yml'));

                const dockerComposePath = path.resolve(process.env.PROJECT_PATH, '../docker-compose.yml');
                if(fs.existsSync(dockerComposePath)) console.log('docker-compose.yml already exists, skipping...')
                else fs.copyFileSync(path.resolve(appDir, './docker-compose.example.yml'), path.resolve(process.env.PROJECT_PATH, '../docker-compose.yml'));

                console.log('Modifying package.json');
                const corePackageJSON = require(path.resolve(appDir, './package.json'));
                const packageJSONPath = path.resolve(process.env.PROJECT_PATH, '../package.json');
                const packageJSON = require(packageJSONPath);

                fs.writeFileSync(packageJSONPath, JSON.stringify(Object.assign(corePackageJSON, packageJSON), null, 2));

                console.log('Project setup successfull!');
            });
        }
    }

    setupAuth() {
        console.log('Setting up authentication routes...');
        console.log('Authentication setup successfull!');
    }

    loadGlobalConfig() {
        const globalConfPath = path.resolve(process.env.PROJECT_PATH, '../vue-ssr-config.js');
        if (fs.existsSync(globalConfPath)) {
            this.globalConfig = require(globalConfPath).default;
        } else {
            this.globalConfig = {};
        }
    }
}
