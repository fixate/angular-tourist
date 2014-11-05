gulp = require 'gulp'
coffee = require 'gulp-coffee'
gutil = require 'gulp-util'
watch = require 'gulp-watch'
serve = require 'gulp-serve'
plumber = require 'gulp-plumber'
slim = require 'gulp-slim'

COFFEE_FILES = [
  './src/module.coffee'
  './src/tour.coffee'
  './src/step.coffee'
  './src/template.coffee'
]

DEMO_JS_FILES = [
  'demo/demo.coffee'
]

DEMO_HTML_FILES = [
  'demo/index.slim'
]

gulp.task 'coffee', () ->
  gulp.src COFFEE_FILES
    .pipe plumber(errorHandler: gutil.log)
    .pipe coffee(bare: true)
    .pipe gulp.dest('./dist/')

gulp.task 'demo-coffee', () ->
  gulp.src DEMO_JS_FILES
    .pipe plumber(errorHandler: gutil.log)
    .pipe coffee(bare: true)
    .pipe gulp.dest('./demo/js')

gulp.task 'demo-slim', () ->
  gulp.src DEMO_HTML_FILES
    .pipe plumber(errorHandler: gutil.log)
    .pipe slim(pretty: true)
    .pipe gulp.dest('./demo/')

gulp.task 'watch', () ->
  gulp.watch COFFEE_FILES, ['coffee']
  gulp.watch DEMO_JS_FILES, ['demo-coffee']
  gulp.watch DEMO_HTML_FILES, ['demo-slim']

gulp.task 'build', () ->
  gulp.start('coffee', 'concat', 'minify')

gulp.task 'serve', serve(root: __dirname, port: 8000)
