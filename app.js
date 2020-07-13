const path = require('path');
const express = require('express');
const logger = require('morgan');
const debug = require('debug')('trymongo:server');
const http = require('http');
const cookieParser = require('cookie-parser');
const createError = require('http-errors');
const cors = require('cors');
const session = require('express-session');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const tootsRouter = require('./routes/toots');

function appServerInit(
  app, // express app
  port
) {
  app.set('port', port);
  const server = http.createServer(app);

  server.listen(port, '0.0.0.0');
  server.on('error', (error) => {
    console.error('http server: %o', error);
    if (error.syscall !== 'listen') {
      throw error;
    }

    const bind = typeof port === 'string'
      ? 'Pipe ' + port
      : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
      default:
        throw error;
    }
  });
  server.on('listening', () => {
    const addr = server.address();
    const bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
    debug('Listening on ' + bind);
  });

  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'pug');

  app.use(session({ // Express-side session stuff
    name: 'goytoot.sid',
    secret: 'should be session secret key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: app.get('env') === 'production',
    },
  }))
  app.use(logger(process.env.LOGGER_FORMAT || 'dev'));
  app.use(express.json());
  app.use(express.urlencoded({extended: false}));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(cors({
    origin: ['http://localhost:4201'],
    credentials: true,
  })); // for goy twitter ui

  app.use('/', indexRouter);
  app.use('/ping', (req, res) => {
    res.status(200).json('pong');
  })
  app.use('/api/users', usersRouter);
  app.use('/api/toots', tootsRouter);

  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });
  return server;
}

module.exports = appServerInit;
