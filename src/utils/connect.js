import mongoose from "mongoose";
import config from "./config.json" assert { type: "json" };
let global = {}
let cache = global.mongoose;
if(!cache) {
  cache = global.mongoose = {conn: null, promise: null};
}
export default async function connect() {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("called", cache.conn);
      if(cache.conn) return resolve(cache.conn);
      if (!(process.env.DBCONNECT || config.connect)) {
        throw new Error("Database connection string cannot be empty!");
      }
      if (!cache.promise) {
        const opts = {
          bufferCommands: false,
        };
        cache.promise = mongoose.connect(process.env.DBCONNECT || config.connect, opts).then((mongoose) => {
          return resolve(mongoose);
        });
      }
      try {
        cache.conn = await cache.promise;
      } catch (e) {
        cache.promise = null;
        throw e;
      }
      return resolve(cache.conn);
    } catch (e) {
      console.error(e);
      reject(e);
    }
  });
}
