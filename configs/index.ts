import * as dotenv from 'dotenv';
dotenv.config();

export default () => ({
    app: {
        environment:
            process.env.APP_ENV === 'production'
                ? 'production'
                : process.env.APP_ENV,
        port: parseInt(process.env.APP_PORT, 10) || 3000,
        host: 'localhost',
        name: process.env.APP_NAME || 'SCUD RIDE',
        url: process.env.APP_URL,
        global_url_prefix: process.env.GLOBAL_URL_PREFIX || 'api/v1',
        full_url: `${process.env.APP_URL}/${process.env.GLOBAL_URL_PREFIX}`,
    },
    db: {
        default: {
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT, 10) || 5432,
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            name: process.env.DB_NAME,
            db_url: process.env.DATABASE_URL,
        },
    },
    jwt: {
        access: {
            secret: process.env.JWT_SECRET,
            signInOptions: {
                expiresIn: process.env.JWT_ACCEESS_EXPIRES_IN,
            },
        },
        refresh: {
            secret: process.env.JWT_SECRET,
            signInOptions: {
                expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
            },
        },
    },
    twilio: {
        auth_token: process.env.TWILIO_AUTH_TOKEN,
        account_sid: process.env.TWILIO_ACCOUNT_SID,
        phone_number: process.env.TWILIO_PHONE_NUMBER,
    },
    mail: {
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT, 10),
        user: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASSWORD,
        secure: Boolean(process.env.EMAIL_SECURE),
        from: process.env.EMAIL_FROM,
    },
    encryption: {
        password: process.env.ENCRYPTION_PASSWORD,
    },
    google: {
        api_key: process.env.GOOGLE_API_SECRET,
    },
    cors: {
        origin: process.env.CORS_ORIGN || '*',
        methods: process.env.CORS_METHODS || 'GET,HEAD',
    },
    sentry: {
        dsn: process.env.SENTRY_DSN,
        debug: Boolean(process.env.SENTRY_DEBUG || true),
        environment: process.env.SENTRY_ENV || 'development',
        release: process.env.SENTRY_RELEASE,
    },
    redis: {
        name: 'base',
        host: process.env.REDIS_HOST,
        user: process.env.REDIS_USER,
        port: parseInt(process.env.REDIS_PORT),
        db: parseInt(process.env.REDIS_DB),
        password: process.env.REDIS_PASSWORD,
        keyPrefix: process.env.REDIS_PRIFIX,
        redis_url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    },
    aws: {
        region: process.env.AWS_REGION || 'eu-west-3',
        api_version: process.env.AWS_API_VERSION || '2010-12-01',
    },
});
