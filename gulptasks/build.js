const conf = require('./config');
const pug = require('gulp-pug');

gulp.task('pug', () => {
    return gulp.src('../views/index.pug', {
            since: gulp.lastRun('pug')
        })
        .pipe(pug(config.pug))
        .pipe(gulp.dest('public'))
});