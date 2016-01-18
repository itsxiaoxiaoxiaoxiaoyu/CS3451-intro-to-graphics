var gulp = require('gulp');
var ts = require('gulp-typescript');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var merge = require('merge2');

var livereload = require('gulp-livereload');
var http = require('http');
var st = require('st');

var tsProject = ts.createProject('tsconfig.json', { sortOutput: true });

gulp.task('watch', ['serve'], function() {
  livereload.listen({ basePath: 'dist' });
  gulp.watch('*.ts', ['build']);
});

gulp.task('serve', ['build'], function(done) {
  http.createServer(
    st({ path: __dirname, index: 'index.html', cache: false })
  ).listen(8080, done);
});

// Note: you can only use tsProject.src() if your tsconfig.json file 
// has a files property. If it  doesn't, you should use gulp.src('**/**.ts').

// named "build" so VS Code will run this from sft-cmd-B
gulp.task('build', function () {   
  var tsResult = tsProject.src()
                      .pipe(sourcemaps.init()) // This means sourcemaps will be generated 
                       .pipe(ts(tsProject));

  return merge([
      tsResult.dts.pipe(gulp.dest('.')),
      tsResult.js
        // if we wanted to concatenate all the js files into one file!
        // .pipe(concat('app.js')) // You can use other plugins that also support gulp-sourcemaps 
        .pipe(sourcemaps.write()) // Now the sourcemaps are added to the .js file 
        .pipe(gulp.dest('js'))
  ])
});

gulp.task('default', ['serve']);