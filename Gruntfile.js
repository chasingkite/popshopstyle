'use strict';


require('dotenv').load();
module.exports = grunt => {

    process.env.TEST_IMG = grunt.option('img') || 'madrid.jpg';
    process.env.NODE_ENV = grunt.option('env') || 'local';
    if (grunt.option('with') === 'app') {
        require('./app')
    }

    grunt.initConfig({
        jshint: {
            options: {
                jshintrc: true
            },
            popShop: [
                '.'
            ]
        },
        mochaTest: {
            test: {
                options: {
                    reporter: grunt.option('reporter') || process.env.reporter || 'nyan',
                    slow: grunt.option('slow') || 75,
                    timeout: grunt.option('timeout') || 25000,
                    quiet: false,
                    bail: true,
                    'check-leaks': true
                },
                src: ['test/index.js']
            }
        },
        nodemon: {
            dev: {
                script: 'app/index.js',
                options: {
                    callback: nodemon => {
                        nodemon.on('log', function (event) {
                            console.log(event.colour);
                        });
                    },
                    env: {
                        NODE_ENV: process.env.NODE_ENV || 'local',
                        PORT: process.env.PORT
                    },
                    cwd: __dirname,
                    ignore: ['node_modules/**'],
                    ext: 'js',
                    delay: 1000
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-nodemon');

    grunt.registerTask('default', 'All default tasks', ['jshint:popShop', 'mochaTest']);
    grunt.registerTask('hint', 'Hinting codebase', 'jshint:popShop');
    grunt.registerTask('test', 'Run tests', 'mochaTest');

};
