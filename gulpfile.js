const gulp = require('gulp');
const del = require('del');
const sass = require('gulp-sass');
const gulpif = require('gulp-if');
const minifyCSS = require('gulp-csso');
const plumber = require('gulp-plumber');
const useref = require('gulp-useref');
const imagemin = require('gulp-imagemin');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const cleancss = require('gulp-clean-css');
const prefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');

const dist = (distpath = 'dist') => {
    return gulp.dest(distpath);
}

gulp.task('css', () => {
    return gulp.src('src/sass/**/*.sass', {
            base: 'src/sass',
            since: gulp.lastRun('css')
        })
        .pipe(sass())
        .pipe(prefixer())
        .pipe(cleancss())
        .pipe(dist('dist/css'))
        .pipe(browserSync.stream());
});

gulp.task('js', () => {
    return gulp.src('src/js/*.js', {
            base: 'src/js',
            since: gulp.lastRun('js')
        })
        .pipe(babel())
        .pipe(sourcemaps.init())
        .pipe(sourcemaps.write())
        .pipe(dist('dist/js'))
});

gulp.task('useref', () => {
    return gulp.src('dist/**/*.html', {
            since: gulp.lastRun('useref')
        })
        .pipe(useref())
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', minifyCSS()))
        .pipe(gulpif('*.js', dist('dist/js')))
        .pipe(gulpif('*.css', dist('dist/css')))
})

gulp.task('imgs', () => {
    return gulp.src('media/images/**/*.+(png|jpg|gif|svg)', {
            since: gulp.lastRun('imags')
        })
        .pipe(imagemin())
        .pipe(dist('dist/images'))
});

gulp.task('clean', () => {
    return del(['dist/**/*', '!dist/images', '!dist/images/**/*'])
});

gulp.task('watch',
    done => {
        gulp.watch('src/sass/**/*.sass', gulp.series('css')),
            gulp.watch('src/js/**/*.js', gulp.series('js'))
    }
)

gulp.task('build', gulp.series('clean', gulp.parallel('css', 'js'), 'useref'));

gulp.task('default', gulp.series('clean', gulp.parallel('css', 'js'), 'useref', 'watch'));
