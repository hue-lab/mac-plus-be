export const getMongoDB = () => ({
    URI: `${process.env.MONGODB_URI}${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_URL}:${process.env.MONGODB_PORT}`,
    DB: `${process.env.MONGODB_NAME}`
})
