import { Client, Databases, Account } from "appwrite";

export const PROJECT_ID = "650ccc4b569337ca6ee4";
export const DATABASE_ID = "6512010f4d1b2cad0bae";
export const COLLECTION_ID_MESSAGES = "65120118d5993cac2f49";

const client = new Client();

client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("650ccc4b569337ca6ee4");

export const databases = new Databases(client);
export const account = new Account(client);

export default client;
