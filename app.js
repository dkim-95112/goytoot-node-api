const path = require('path');
const express = require('express');
const logger = require('morgan');
const debug = require('debug')('trymongo:app');
const http = require('http');
const createError = require('http-errors');
const cors = require('cors');
const session = require('express-session');
const MongooseService = require('./mongoose-service');
const WebSocketService = require('./websocket');


const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const tootsRouter = require('./routes/toots');

function appServerInit(
  app, // express app
  port,
) {
  app.set('port', port);
  // Web server
  const server = app.locals.server = http.createServer(app);
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

  // Using websocket to push data to clients
  const webSocketService = app.locals.webSocketService = new WebSocketService(server);
  // Using mongo for no-sql user/toot databases
  const mongooseService = app.locals.mongooseService = new MongooseService();
  mongooseService.connect().then(() => {
    mongooseService.getTootChangeStream().on('change', change => {
      webSocketService.wss.clients.forEach(client => {
        client.send(JSON.stringify(change));
      })
    })
  }).catch(err => {
    console.log(err)
  })

  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'pug');

  const isProduction = app.get('env') === 'production'
  if (isProduction) {
    // For secure cookie.  See 'express-session' docs.
    // In AWS setup, node is behind load balancer
    // that converts https to http node-side
    app.set('trust proxy', 1)
  }
  app.use(session({ // Express-side session stuff
    name: 'goytoot.sid',
    secret: 'should be session secret key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
    },
  }))
  app.use(logger(process.env.LOGGER_FORMAT || 'dev'));
  app.use(express.json());
  app.use(express.urlencoded({extended: false}));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(cors({
    origin: [
      'https://goytoot.com',
      'http://localhost:4201',
    ],
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
}

module.exports = appServerInit;
