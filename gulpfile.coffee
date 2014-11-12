gulp = require 'gulp'
bump = require 'gulp-bump'
coffee = require 'gulp-coffee'
gutil = require 'gulp-util'
watch = require 'gulp-watch'
serve = require 'gulp-serve'
plumber = require 'gulp-plumber'
slim = require 'gulp-slim'
uglify = require 'gulp-uglify'
concat = require 'gulp-concat'
rename = require 'gulp-rename'
karma = require('karma').server

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

BUMP_FILES = [
  'bower.json',
  'package.json'
]

gulp.task 'coffee', () ->
  gulp.src COFFEE_FILES
    .pipe plumber(errorHandler: gutil.log)
    .pipe coffee(bare: true)
    .pipe gulp.dest('./dist/dev/')

gulp.task 'bump', () ->
  gulp.src BUMP_FILES
    .pipe bump()
    .pipe gulp.dest('./')

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

gulp.task 'concat', ['coffee'], () ->
  gulp.src './dist/dev/*.js'
    .pipe concat('angular-tourist.js')
    .pipe gulp.dest('./dist/')

gulp.task 'uglify', ['concat'], () ->
  gulp.src './dist/angular-tourist.js'
    .pipe uglify()
    .pipe rename('angular-tourist.min.js')
    .pipe gulp.dest('./dist/')

gulp.task 'test', ['coffee'], ->
  karma.start(configFile: "#{__dirname}/karma.conf.coffee")

gulp.task 'build', ['coffee', 'uglify']

gulp.task 'serve', serve(root: __dirname, port: 8000)
