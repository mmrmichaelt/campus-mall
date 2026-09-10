import { NextResponse } from 'next/server';
import { z } from 'zod';
const schema=z.object({title:z.string().min(2).max(120),description:z.string().max(2000).default(''),price:z.number().int().positive(),category:z.string().min(1),condition:z.string().min(1),location:z.string().max(120)});
export async function GET(){return NextResponse.json({message:'Listings API is ready. Configure DATABASE_URL and authentication to enable persistent server storage.'});}
export async function POST(req:Request){try{const body=await req.json(); const data=schema.parse(body); return NextResponse.json({ok:true,listing:data},{status:201});}catch{return NextResponse.json({ok:false,error:'Invalid listing data'},{status:400});}}
