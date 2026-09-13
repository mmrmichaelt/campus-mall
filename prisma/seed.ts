import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();
async function main(){
 const passwordHash=await bcrypt.hash("ChangeMe123!",12);
 const user=await prisma.user.upsert({where:{email:"demo@campusmall.local"},update:{},create:{email:"demo@campusmall.local",passwordHash,name:"Campus Mall Demo",countryCode:"KE",university:"Kisii University",accountType:"STUDENT",verification:"Verified",rating:4.8}});
 await prisma.listing.createMany({data:[
  {sellerId:user.id,title:"Scientific Calculator",description:"Good condition calculator for class work.",category:"Electronics",condition:"Used - like new",price:1200,location:"Main campus"},
  {sellerId:user.id,title:"Hostel Chair",description:"Strong study chair, ready for collection.",category:"Furniture",condition:"Used",price:800,location:"Student hostels"},
  {sellerId:user.id,title:"Typing & Printing",description:"Fast campus document printing and typing service.",category:"Printing & photography",condition:"New",price:20,location:"Campus town"}
 ]});
}
main().finally(()=>prisma.$disconnect());
