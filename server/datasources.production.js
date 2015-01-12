module.exports = {
    db: {
        connector: 'mongodb',
        hostname: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 27017,
        database: 'yolosh1'
    }
};
