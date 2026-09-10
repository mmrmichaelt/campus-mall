import { NextResponse } from 'next/server';
export async function POST(_:Request,{params}:{params:Promise<{id:string}>}){const {id}=await params;return NextResponse.json({ok:true,id,soldAt:new Date().toISOString(),message:'In production this action must be authorized for the listing owner and persisted in the database.'});}
