"use client";
import {useEffect} from "react";
export default function Welcome(){useEffect(()=>{const t=setTimeout(()=>location.href="/join",3000);return()=>clearTimeout(t)},[]);return <main style={{minHeight:"80vh",display:"grid",placeItems:"center",textAlign:"center"}}><div><div className="brand-mark" style={{display:"inline-block",fontSize:30,padding:"12px 15px"}}>CM</div><h1>Welcome to campus mall</h1><p className="note">Your space. Your identity. Your future.</p><p className="note">© 2026 Campus Mall</p></div></main>}
