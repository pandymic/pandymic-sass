const { SassString } = require('sass');

const gulp = require( 'gulp' ),
  log = require( 'fancy-log' ),
  plumber = require('gulp-plumber'),
  sass = require('gulp-sass')( require('sass') ),
  shell = require( 'child_process' ).exec;

gulp.task( 'dist', () => {
  return gulp.src( './src/**/*' )
    .pipe( gulp.dest( './dist' ) );
} );

gulp.task( 'demo', () => {
  return gulp.src( './src/demo/demo.scss' )
    .pipe( plumber() )
    .pipe( sass( {
      outputStyle: 'compressed',
      functions: {
        // Base64 encode strings for data url's within sass files.
        'pandymic-jsapi-btoa($string)': function() {
          try {
            const string = arguments[0];
            string.setValue( Buffer.from( string.getValue() ).toString( 'base64' ) );
            return string;
          } catch( e ) {
            console.error( 'Error in `pandymic-jsapi-btoa`', e );
          }
          return new SassString( '' );
        }
      }
    } ) )
    .pipe( gulp.dest( './dist/demo' ) );
});

gulp.task( 'permissions', ( callback ) => {
  shell( 'cd ./dist/demo && find . -user $USER -not -group apache -exec chgrp apache {} \\;', ( err, stdout, stderr ) => {
    log.info( 'File group updated...' );
    if ( stdout.length ) log( stdout.trim() );
    if ( stderr.length ) log.error( stderr.trim() );
    callback( err );
  } );
} );

gulp.task( 'watch', () => {
  gulp.watch( './src/**/*', gulp.series( 'default' ) );
} );

gulp.task( 'default', gulp.series( 'dist', 'demo', 'permissions' ) );