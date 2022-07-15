const {
    src, //поиск
    dest, //выдача
    watch, //наблюдатель
    parallel,
    series
} = require('gulp');
const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const del = require('del');

function browsersync() {
    browserSync.init({
        server: {
            baseDir: 'app/' //добавить потом настройки
        }
    });
}
function cleanDist(){
    return del('dist');
}
function images() {
    return src('app/images/**/*')
        .pipe(imagemin([
            imagemin.gifsicle({
                interlaced: true
            }),
            imagemin.mozjpeg({
                quality: 75,
                progressive: true
            }),
            imagemin.optipng({
                optimizationLevel: 5
            }),
            imagemin.svgo({
                plugins: [{
                        removeViewBox: true
                    },
                    {
                        cleanupIDs: false
                    }
                ]
            })
        ]))
        .pipe(dest('dist/images'));
}

function styles() {
    return src('app/scss/style.scss') //находим файл, с которым нужно работать.
        .pipe(scss({
            outputStyle: 'expanded'
        })) //обработали. сжали. 
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true
        }))
        .pipe(concat('style.min.css')) //переименуем, конкатенируем
        .pipe(dest('app/css')) //отправили 
        .pipe(browserSync.stream());
}

function scripts() {
    return src([
            'node_modules/jquery/dist/jquery.js',
            'app/js/main.js'
        ]) //взяли файл
        .pipe(concat('main.min.js')) //конкатенируем файлы
        .pipe(uglify()) //минифицируем
        .pipe(dest('app/js')) //отправляем в папку js
        .pipe(browserSync.stream());
}

function build() {
    return src([
            'app/css/style.min.css',
            'app/fonts/**/*',
            'app/js/main.min.js',
            'app/*.html',
        ], {
            base: 'app'
        })
        .pipe(dest('dist'));
}

function watching() {
    watch(['app/scss/**/*.scss'], styles); //слежка за сцссб  и запуск функции стайлс для обработки данных.
    watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts); //слежка за сцссб  и запуск функции стайлс для обработки данных.
    watch(['app/*.html']).on('change', browserSync.reload); //обновление страницы при изменении хтмл.
}

exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.images = images;


exports.build = series(cleanDist, images, build);
exports.default = parallel(styles, scripts, browsersync, watching); 