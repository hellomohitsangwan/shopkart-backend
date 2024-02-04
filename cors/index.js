const cors = require("cors");

const corsOptions = {
    origin: ['http://localhost:3000','https://procommerce.netlify.app','https://procommerce.netlify.app/'],
    optionsSuccessStatus: 200
};

const corsMiddleware = cors(corsOptions);

module.exports = corsMiddleware;
