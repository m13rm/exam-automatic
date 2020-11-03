'use strict';

const gulp = require('gulp'),
    rimraf = require('rimraf'),
    scss = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    prefixer = require('gulp-autoprefixer'),
    htmlmin = require('gulp-htmlmin'),
    browserSync = require('browser-sync'),
    plumber = require('gulp-plumber'),
    rigger = require('gulp-rigger'),
    reload = browserSync.reload;

var path = {
        build:{
            all:'build/',
            html:'build/',
            scss:'build/css/',
            js:'build/js/',
            img:'build/img/'
        },
        src:{
            html:'src/*.html',
            scss:'src/scss/style.scss',
            js:'src/js/main.js',
            jsplugins:'src/js/plugins/*.js',
            img:'src/img/**/*.{jpg,png,svg,jpeg}'
        },
        watch:{
            scss:'src/scss/**/*.scss',
            js:'src/js/**/*.js',
            html:'src/*.html,',
            img:'src/img/**/*.{jpg,png,svg,jpeg}'
        },
        clean:'build/'
    },
    config={
        server:{
            baseDir:"./build",
            index:"index.html"
        },
        host:"localhost",
        port:7787,
        tunnel:true,
        logPrefix:"Exam Automation"
    };

// -> clean*******************************
gulp.task('clean',function (done) {
    rimraf(path.clean,done);
});

// -> webserver*******************************
gulp.task('webserver',function (done) {
    browserSync(config);
    done();
});

// ->dev:html*******************************
gulp.task('dev:html',function (done) {
    gulp.src(path.src.html)
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream:true}));
    done();
});
// ->dev:scss*******************************
gulp.task('dev:scss', function (done) {
    gulp.src(path.src.scss,{sourcemaps: true})
        .pipe(plumber()) // помог найти проблему
        .pipe(scss({
            // путь к файлам bourbon для импорта в styles.scss одним словом
            // includePaths:'node_modules/bourbon/app/assets/stylesheets/',
            outputStyle:"compressed",
            sourcemaps:false
        }))
        .pipe(prefixer({
            cascade:false,
            remove:true
        }))
        .pipe(gulp.dest(path.build.scss,{sourcemaps:'.'}))
        .pipe(reload({stream:true}));
    done();
});
// ->dev:js*******************************
gulp.task('dev:js', function (done) {
    gulp.src(path.src.js,{sourcemaps: true})
        .pipe(gulp.dest(path.build.js,{sourcemaps:'.'}))
        .pipe(reload({stream:true}));
    done();
});

// ->prod:html*******************************
gulp.task('prod:html',function (done) {
    gulp.src(path.src.html)
        .pipe(htmlmin({
            collapseWhitespace:true
        }))
        .pipe(gulp.dest(path.build.html));
    done();
});

// ->prod:scss*******************************
gulp.task('prod:scss', function (done) {
    gulp.src(path.src.scss)
        .pipe(scss({
            // путь к файлам bourbon для импорта в styles.scss одним словом
            // includePaths:'node_modules/bourbon/app/assets/stylesheets/',
            outputStyle:"compressed",
            sourcemaps:false
        }))
        .pipe(prefixer({
            cascade:false,
            remove:true
        }))
        .pipe(gulp.dest(path.build.scss));
    done();
});
// Минимизировать  js*******************************
gulp.task('prod:js', function (done) {
    gulp.src(path.src.js)
        .pipe(plumber())
        .pipe(rigger())
        .pipe(uglify())
        .pipe(gulp.dest(path.build.js));
    done();
});

// img -> build
gulp.task('mv:img', function (done) {
    gulp.src(path.src.img)
        .pipe(gulp.dest(path.build.img));
    done();
});

// js -> build & compress*******************************
gulp.task('js:addons', function (done){
    gulp.src(path.src.jsplugins)
        .pipe(uglify())
        .pipe(gulp.dest(path.build.js));
    done();
});

// css -> build & compress*******************************
gulp.task('css:addons', function (done){
    gulp.src('src/css/*.css')
        .pipe(scss({
            outputStyle:"compressed",
            sourcemaps:false
        }))
        .pipe(gulp.dest('build/css/'));
    done();
});

// watch!*******************************
gulp.task('watch', function (done) {
    gulp.watch(path.watch.html,gulp.series('dev:html'),reload({stream:true}));
    gulp.watch(path.watch.js,gulp.series('dev:js'),reload({stream:true}));
    gulp.watch(path.watch.scss,gulp.series('dev:scss'));
    gulp.watch(path.build.scss,reload({stream:true}));
    done();
});

gulp.task('prod',gulp.series('clean',gulp.parallel('css:addons','mv:img','prod:html','prod:scss','prod:js'),'webserver'));
gulp.task('dev',gulp.series('clean',gulp.parallel('css:addons','mv:img','js:addons','dev:html','dev:scss','dev:js'),'webserver','watch'));

gulp.task('default',gulp.series('dev'));