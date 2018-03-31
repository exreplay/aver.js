const nodemon	= require('nodemon');
const path		= require('path');

export default class Core {
    run() {
        process.env.PROJECT_PATH = path.resolve(process.cwd(), 'src');
		
        nodemon({
            ignore: ['public', 'dist', 'src', 'storage'],
            delay: '80ms',
            exec: 'kill-port --port 9229 && node --inspect=0.0.0.0:9229 ' + path.resolve(__dirname, './www'),
            env: {
                'NODE_ENV': 'development'
            }
        });
		
        nodemon.on('start', function() {
            console.log('App has started');
        }).on('quit', function() {
            console.log('App has quit');
            process.exit();
        }).on('restart', function(files) {
            console.log('App restarted due to: ', files);
        });
    }
}
