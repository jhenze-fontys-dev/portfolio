import colors from 'colors';

// Define color schemes
const colorSchemes = {
  postman: {
    GET: 'green',
    POST: 'yellow',
    PUT: 'blue',
    DELETE: 'red',
  },
  swagger: {
    GET: 'blue',
    POST: 'green',
    PUT: 'yellow',
    DELETE: 'red',
  },
};

const logger = (scheme = process.env.LOG_SCHEME || 'swagger') => {
  const methodColors = colorSchemes[scheme] || colorSchemes.swagger;

  return (req, res, next) => {
    const color = methodColors[req.method] || 'white';
    const logMessage = `${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}`;
    console.log(logMessage[color]);
    next();
  };
};

export default logger;
