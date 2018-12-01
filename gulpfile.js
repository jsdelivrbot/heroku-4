const gulp = require('gulp');
const del = require('del');
const sass = require('gulp-sass');
const _if = require('gulp-if');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const minifyCSS = require('gulp-csso');
const browserify = require('browserify');
const remember = require('gulp-remember');
const browserSync = require('browser-sync').create();
const plumber = require('gulp-plumber');
const useref = require('gulp-useref');
const nodemon = require('gulp-nodemon');
const imagemin = require('gulp-imagemin');
const imageminPNG = require('imagemin-pngquant');
const imageminJPG = require('imagemin-jpeg-recompress');
const favicons = require('gulp-favicons');
const iconfont = require('gulp-iconfont');
const spritegen = require('gulp-svg-sprite');
const cheerio = require('gulp-cheerio');
const svgmin = require('gulp-svgmin');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const cleancss = require('gulp-clean-css');
const prefixer = require('gulp-autoprefixer');
const pug = require('gulp-pug');
const sourcemaps = require('gulp-sourcemaps');
const path = require('path');
const isDev = process.env.NODE_ENV == 'development';
const conf = require('./config');
const gp = conf.gulpPaths; // пути для работы модулей

// дефолтная папка для статических файлов
const dest = (distpath = 'public') => {
    return gulp.dest(distpath);
}

// запуск шаблонизатора
gulp.task('pug', () => {
    return gulp.src(gp.pug.in, {
            since: gulp.lastRun('pug')
        })
        .pipe(pug(conf.pug))
        .pipe(gulp.dest(gp.pug.out))
});

// обработка стилей sass
gulp.task('css', () => {
    return gulp.src(gp.sass.in, {
            base: 'src/sass',
            since: gulp.lastRun('css')
        })
        // .pipe(remember('css'))
        .pipe(_if(isDev, plumber()))
        .pipe(sass({
            includePaths: [
                path.resolve('media/'),
                path.resolve('src/sass/')
            ]
        }))
        .pipe(prefixer())
        .pipe(cleancss())
        .pipe(dest('public/css'))
});

gulp.task('js', () => {
    return gulp.src('src/js/*.js', {
            base: 'src/js',
            since: gulp.lastRun('js')
        })
        .pipe(remember('js'))
        .pipe(_if(isDev, plumber()))
        .pipe(babel())
        .pipe(_if(isDev, sourcemaps.init()))
        .pipe(_if(isDev, sourcemaps.write()))
        .pipe(dest('public/js'))
});

gulp.task('useref', () => {
    return gulp.src('public/*.html', {
            since: gulp.lastRun('useref')
        })
        .pipe(_if(isDev, plumber()))
        .pipe(useref())
        .pipe(_if('*.js', uglify()))
        .pipe(_if('*.css', minifyCSS()))
        .pipe(_if('*.js', dest('public/js')))
        .pipe(_if('*.css', dest('public/css')))
})

gulp.task('imgs', () => {
    return gulp.src('media/images/**/*.+(png|jpg|gif)', {
            since: gulp.lastRun('imgs')
        })
        .pipe(imagemin())
        .pipe(dest('public/images'))
});

gulp.task('spritesvg', function () {
    return gulp.src('media/icons/**/*.svg')
        .pipe(_if(isDev, plumber()))
        .pipe(svgmin({
                js2svg: {
                    pretty: true
                }
            }))
        // .pipe(cheerio({
        //     run: function ($) {
        //         $('[fill]').removeAttr('fill');
        //         $('[stroke]').removeAttr('stroke');
        //         $('[style]').removeAttr('style');
        //     },
        //     parserOptions: {
        //         xmlMode: true
        //     }
        // }))
        .pipe(spritegen({
            mode: {
                css: {
                    dest: '.', // типа basePath
                    bust: false, //!isDev, // добавляет хеш к имени
                    sprite: 'sprite.svg',
                    layout: 'vertical',
                    // preview: false,
                    // prefix: '=',
                    dimensions: true, // размеры иконки в том же классе
                    svgId: "sprite-%f",
                    render: {
                        scss: {
                            dest: 'sprite.scss',
                            template: "src/sass/sprite/icons.scss"
                        }
                    }
                }
            }
        }))
        .pipe(_if('*.scss', gulp.dest('src/sass/tmp'), gulp.dest('public/css')));
});


gulp.task('browsersync', done => {
    browserSync.init({
        proxy: "localhost:5000"
    });

    browserSync.watch('public/**/*.*').on('change', browserSync.reload)
})

gulp.task('nodemon', done => {
    return nodemon({
        script: 'index.js',
        watch: 'app',
        ignore: [
            ".gitignore",
            "node_modules",
            "public",
            "src",
            "README.md",
            "gulp-pack.js"
        ],
        done: done
    })
});
gulp.task('clean', () => {
    return del(['public/**/*', '!public/images', '!public/images/**/*'])
});

gulp.task('build', gulp.series('clean', gulp.parallel('pug', 'css', 'spritesvg', 'js'), 'useref'));

gulp.task('fwatch',
    done => {
        gulp.watch('src/sass/**/*.+(sass|scss)', gulp.series('css')),
        gulp.watch('src/js/**/*.js', gulp.series('js'))
        // gulp.watch('views/**/*.pug', gulp.series('nodemon:restart'))
    }
)
gulp.task('watch', gulp.parallel('nodemon', 'fwatch', 'browsersync'));

gulp.task('default', gulp.series('build', 'watch'));

