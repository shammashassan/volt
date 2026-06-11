import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

const globalWithMongo = global as typeof globalThis & {
  _mongoClient?: MongoClient;
  _mongoClientPromise?: Promise<MongoClient>;
};

if (!globalWithMongo._mongoClient) {
  globalWithMongo._mongoClient = new MongoClient(uri, options);
  let connectPromise: Promise<MongoClient> | null = null;
  globalWithMongo._mongoClientPromise = new Proxy({} as Promise<MongoClient>, {
    get(target, prop) {
      if (!connectPromise) {
        connectPromise = globalWithMongo._mongoClient!.connect();
      }
      const val = Reflect.get(connectPromise, prop);
      return typeof val === "function" ? val.bind(connectPromise) : val;
    }
  });
}

client = globalWithMongo._mongoClient!;
clientPromise = globalWithMongo._mongoClientPromise!;

export { client, clientPromise };
export default clientPromise;
