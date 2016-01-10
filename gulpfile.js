var gulp = require('gulp');

//plugins
var ngAnnotate = require('gulp-ng-annotate');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var paperbagjs = [
    'src/paperbag.js',
    'src/paperbag.badge.js',
    'src/paperbag.cart.js',
    'src/paperbag.item.js',
    'src/processors/paperbag.processor.js',
    'src/processors/paperbag.processor.paypal.js',
    'src/processors/paperbag.processor.stripe.js'
];

gulp.task('js', function () {
    gulp.src(paperbagjs)
        .pipe(ngAnnotate())
        .pipe(concat('paperbag.js'))
        .pipe(gulp.dest('./dist/'))
        .pipe(rename('paperbag.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist/'));
});

gulp.task('watch', function () {
    gulp.watch('./src/*.js', ['js']);
});

gulp.task('default', ['js', 'watch']);