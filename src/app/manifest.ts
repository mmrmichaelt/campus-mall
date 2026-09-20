import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest { return {name:"Campus Mall",short_name:"Campus Mall",description:"Campus marketplace for students, outsiders, food, jobs and services.",start_url:"/",display:"standalone",background_color:"#f7f7f8",theme_color:"#c9152d",icons:[{src:"/icon.svg",sizes:"any",type:"image/svg+xml",purpose:"any"}]};}
