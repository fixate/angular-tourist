gulp = require 'gulp'
coffee = require 'gulp-coffee'
gutil = require 'gulp-util'
watch = require 'gulp-watch'
serve = require 'gulp-serve'
plumber = require 'gulp-plumber'

COFFEE_FILES = [
  './src/module.coffee'
  './src/tour.coffee'
  './src/step.coffee'
  './src/template.coffee'
]

DEMO_FILES = [
  'demo/demo.coffee'
]

gulp.task 'coffee', () ->
  gulp.src COFFEE_FILES
    .pipe plumber(errorHandler: gutil.log)
    .pipe coffee(bare: true)
    .pipe gulp.dest('./dist/')

gulp.task 'compile-demo', () ->
  gulp.src DEMO_FILES
    .pipe plumber(errorHandler: gutil.log)
    .pipe coffee(bare: true)
    .pipe gulp.dest('./demo/js')

gulp.task 'watch', () ->
  gulp.watch COFFEE_FILES, ['coffee']
  gulp.watch DEMO_FILES, ['compile-demo']

gulp.task 'build', () ->
  gulp.start('coffee', 'concat', 'minify')

gulp.task 'serve', serve(root: __dirname, port: 8000)
