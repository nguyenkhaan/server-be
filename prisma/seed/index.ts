import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from 'generated/prisma/client'
import { Role } from 'generated/prisma/client'
const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() 
{
    const admin = await prisma.user.create({
        data: {
            password : 'admin', 
            active: true, 
            email: 'admin@gmail.com', 
            name : 'admin', 
        }
    })
    //Assign role 
    await prisma.userRole.createMany({
        data: [
            {
                userID : admin.id, 
                role : Role.ADMIN
            }, 
            {
                userID : admin.id, 
                role : Role.USER
            }
        ]
    })
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });