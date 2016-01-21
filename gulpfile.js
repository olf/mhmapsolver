var gulp = require('gulp');
var sass = require('gulp-sass');
var scp = require('gulp-scp2');
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

gulp.task('server', function() {
    browserSync.init({
        browser: ['chrome'],
        server: {
            baseDir: '.'
        }
    });
});