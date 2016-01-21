var gulp = require('gulp');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');
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

gulp.task('release', ['sass'], function() {
    gulp.src('./index.html')
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('./release'));

    gulp.src('./sass/**/*.scss')
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(gulp.dest('./release/css'));

    gulp.src('./js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('./release/js'));
});
