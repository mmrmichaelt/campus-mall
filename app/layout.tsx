import './globals.css';
import type {Metadata} from 'next';
export const metadata:Metadata={title:'Campus Mall — Your space. Your identity. Your future.',description:'A campus-first marketplace for buying, selling and discovering useful items.',manifest:'/manifest.webmanifest'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
