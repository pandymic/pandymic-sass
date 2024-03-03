# pandymic-sass library

This is a collection of handy common functions and mixins that are frequently used throughout my projects.

## SVG usage

### Initializing SVG data

#### <code>svg( svgMap: <i>map[svgName,map[svg-add()]</i> )</code>
This mixin register all of the SVG strings within the module. Since `@use` modules exist outside of the global scope there is no way to access global variables defined elsewhere in the code, therefore we register all of our SVG data within the scope of the module itself.

_**Note:** Due to the fact that there is no return or output value this is a `@mixin` and not a `@function` and must be invoked with `@include`._

#### <code>svg-add( svgString: <i>string</i> [, colorOrColors: <i>color|map[colorName,color]</i> [, __returnString: <i>bool</i> ]] )</code>
This function registers an SVG string with the library for later use. It's run as the value of a map of SVG images where the name of the item is the key. The function returns a map of one or more SVG strings formatted based on the colors provided.

It generates the SVG in various colours, since the "currentColor" keyword isn't supported within the scope of CSS generated SVG images using the data url's (Though I'm storing them, anyway for posterity's sake.)

The function accepts a color or colors as its second argument. If it's a single color, a *hex color* is expected. If it's a collection of multiple colors, a map in *key: value* format is expected, where the key is a string *"name"* and the value is a *hex color*. It does a string replacement on the term "currentColor" for the color(s) passed and registers them as individual mapped values. If this argument is left blank it defaults to the color *#000*

The third optional argument is used internally when using the function to return an SVG string generated on the fly, rather than pulling pre-generated color values.

#### Example
<pre>
@use "dist/lib/pandymic" as pandymic;

/* Register your SVG's */
@include pandymic.svg( (
  "demo": pandymic.svg-add( '&lt;svg xmlns="http://www.w3.org/2000/svg" width="640" height="512" viewBox="0 0 640 512"&gt;&lt;path fill="currentColor" d="M392.8 1.2c-17-4.9-34.7 5-39.6 22l-128 448c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l128-448c4.9-17-5-34.7-22-39.6zm80.6 120.1c-12.5 12.5-12.5 32.8 0 45.3L562.7 256l-89.4 89.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l112-112c12.5-12.5 12.5-32.8 0-45.3l-112-112c-12.5-12.5-32.8-12.5-45.3 0zm-306.7 0c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3l112 112c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256l89.4-89.4c12.5-12.5 12.5-32.8 0-45.3z"/&gt;&lt;/svg&gt;', ( "lime": #0f0 ) )
) );
</pre>

### Using SVG data

#### <code>svg-get( svgName [, color: <i>string|color</i>] )</code>
Returns a base64 encoded SVG string. If the optional second parameter is a *string* it will return the corresponding SVG string in the desired color from the registered SVG data. If the second parameter is a *hex color* it will return the string with that color. If the color is omitted it will return the default color *#000*.

#### <code>svg-url( svgName [, color: <i>string|color</i>] )</code>
Similar to the above function with the same arguments. This function returns a fully formed CSS `url()` function with the full data url, including the content type definition and the base64 encoded string that is returned by `svg-get()`.

### Assumptions

* All attributes in the SVG string are surrounded in quotation marks (")
* Apostrophes are not used anywhere in the string *(I haven't written the sanitization logic for it...)*

### base64 string encoding with `bota()` and invocation via gulp.

In order to take advantage of base64 encoding a function has to be defiened within the project gulpfile to add the necessary interface between the sass compiler and Node.js. The result is a function in the sass environment equivalent to Javascript's `btoa()` function.

The `functions` property passed to the sass module as part of the settings object on inititialization. See the [Dart Sass documentation](https://sass-lang.com/documentation/js-api/interfaces/options/#functions) for more information.

_**Note:** Since libSass and node-sass have been deprecated I'm referring to [Dart Sass](https://sass-lang.com/dart-sass/) documentation, however the code I'm using within the function declaration should work within a node-sass environment as well. Per the developer, libSass and node-sass will continue to receive maintenance releases indefinitely._

See the "demo" task in the gulpfile or below for an example.

<pre>
const gulp = require( 'gulp' ),
  sass = require('gulp-sass')( require('sass') );

gulp.task( 'demo', () => {
  return gulp.src( './src/demo/demo.scss' )
    .pipe( sass( {
      outputStyle: 'compressed',
      functions: {
        // base64 encode strings for data url's within sass files.
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

gulp.task( 'default', gulp.series( 'demo' ) );
</pre>