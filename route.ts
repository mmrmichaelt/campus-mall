import { NextResponse } from 'next/server';
export function GET(){return NextResponse.json({ok:true,service:'campus-mall',timestamp:new Date().toISOString()});}
