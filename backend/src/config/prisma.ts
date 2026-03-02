import { PrismaClient } from '../../generated/prisma/client.js';

import { PrismaPg } from "@prisma/adapter-pg";
import { envData } from "./dotenv.js";
const connectionString = `${envData.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });


const prisma = new PrismaClient({ adapter });
export { prisma };