/* eslint-env node */

var gulp = require('gulp');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var insert = require('gulp-file-insert');
var replace = require('gulp-replace');
var browserSync = require('browser-sync').create();

gulp.task('default', ['watch']);

gulp.task('watch', ['server'], function() {
    gulp.watch('./sass/**/*.scss', ['sass']);
    gulp.watch('./css/**/*.css', ['inject']);
    gulp.watch('./*.html', browserSync.reload);
    gulp.watch('./js/**/*.js', browserSync.reload);
});

gulp.task('inject', function() {
    return gulp
        .src('./css/**/*.css')
        .pipe(browserSync.stream());
});

gulp.task('sass', function() {
    return gulp
        .src('./sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./css'));
});

// on windows use 'chrome' instead of 'google chrome'
gulp.task('server', function() {
    return browserSync.init({
        browser: ['google chrome'],
        open: 'local',
        server: {
            baseDir: '.'
        }
    });
});

gulp.task('jsminify', function() {
    gulp.src('./js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('./docs/js'));

    // process bookmarklet again to replace " by ' otherwise
    // the insertion into index.html would break
    gulp.src('./js/bookmarklet.js')
        .pipe(uglify())
        .pipe(replace('"', '\''))
        .pipe(gulp.dest('./docs/js'));

    return;
});

gulp.task('release', ['jsminify'], function() {
    gulp.src('./sass/**/*.scss')
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(gulp.dest('./docs/css'));

    gulp.src('./index.html')
        .pipe(insert({
            '/*bookmarklet*/': 'docs/js/bookmarklet.js',
            '<!-- piwik -->': '_piwik.inc'
        }))
        .pipe(gulp.dest('./docs'));

    gulp.src('./data/attractionrates.csv')
        .pipe(gulp.dest('./docs/data'));
});
