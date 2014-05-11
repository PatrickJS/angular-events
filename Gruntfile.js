
'use strict';

module.exports = function(grunt){

  var config = {

    module: {
      pkg: grunt.file.readJSON('./bower.json'),
      alias: 'angular-events',
      dist: 'dist',
      staging: '.tmp',
      components: grunt.file.readJSON('./.bowerrc').directory,
      banner: '/* License MIT */\n',
      src: 'src'
    },

    concat: {

      javascript: {

        options: {
          separator: ';'
        },

        src: [
          '<%= module.src %>/main.js',
          '<%= module.src %>/!(tests)/*.js'
        ],

        dest: '<%= module.staging %>/<%= module.pkg.name %>.js'

      }

    },

    uglify: {

      dist: {

        options: {
          sourceMap: true,
          mangle: false,
          banner: '<%= module.banner %>',
          wrap: '<%= module.alias %>'
        },

        files: {
          '<%= module.dist %>/<%= module.pkg.name %>.min.js': ['<%= module.dist %>/<%= module.pkg.name %>.js']
        }

      }

    },

    copy: {

      javascript: {
        files: [
          {
            expand: true,
            cwd: '<%= module.staging %>/',
            src: ['<%= module.pkg.name %>.js'],
            dest: '<%= module.dist %>/',
            filter: 'isFile'
          }
        ]
      },

      components: {
        files: [
          {
            expand: true,
            src: '<%= module.components %>/**/*.*',
            dest: '<%= module.staging %>/'
          }
        ]
      }

    },

    jshint: {
      options: {
        reporter: require('jshint-stylish')
      },
      src: {
        options: {
          jshintrc: '.jshintrc'
        },
        src:[
          'Gruntfile.js',
          '<%= module.src %>/main.js',
          '<%= module.src %>/controllers/*.js',
          '<%= module.src %>/directives/*.js',
          '<%= module.src %>/providers/*.js',
          '<%= module.src %>/services/*.js'
        ]
      },
      tests: {
        options: {
          jshintrc: '.jasminejshintrc'
        },
        src: [
          '<%= module.src %>/tests/*.spec.js'
        ]
      }
    },

    watch: {

      javascript: {
        files: [
          '<%= module.src %>/main.js',
          '<%= module.src %>/controllers/*.js',
          '<%= module.src %>/directives/*.js',
          '<%= module.src %>/providers/*.js',
          '<%= module.src %>/services/*.js'
        ],
        tasks: ['newer:jshint:src','concat:javascript', 'karma:precompile'],
        options: {
          atBegin: true
        }
      },


      components: {
        files: [
          '<%= module.components %>/*'
        ],
        tasks: ['copy:components','bowerInstall'],
        options: {
          atBegin: true
        }
      },

      tests: {
        files: [
          '<%= module.src %>/tests/*.spec.js'
        ],
        tasks: ['newer:jshint:tests', 'karma:precompile'],
        options: {
          atBegin: true
        }
      }

    },

    karma: {

      precompile: {
        configFile: 'karma.precompile.conf.js'
      },

      postcompile: {
        configFile: 'karma.postcompile.conf.js'
      }

    },
    bowerInstall: {

      tests: {
        src: ['karma.precompile.conf.js', 'karma.postcompile.conf.js'],
        dependencies: true,
        devDependencies: true,
        fileTypes: {
          js: {
            block: /(([\s\t]*)\/\/\s*bower:*(\S*))(\n|\r|.)*?(\/\/\s*endbower)/gi,
            detect: {
              js: /'.*\.js'/gi
            },
            replace: {
              js: '\'{{filePath}}\','
            }
          }
        }
      }
    },

    clean: {
      dist: '<%= module.dist %>',
      staging: '<%= module.staging %>'
    }

  };

  require('load-grunt-tasks')(grunt);

  grunt.initConfig(config);

  grunt.registerTask('default',[
    'clean:staging',
    'watch'
  ]);

  grunt.registerTask('build',[
    'clean:staging',
    'jshint',
    'concat:javascript',
    'bowerInstall',
    'karma:precompile',
    'clean:dist',
    'copy:javascript',
    'uglify',
    'karma:postcompile'
  ]);

};
