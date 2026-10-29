import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });
export const metadata = {
    title: "Shop Mada | Tableau de bord",
    description: "Tableau de bord d'analyse e-commerce de Shop Mada",
    icons: {
        icon: "/icon.svg",
    },
};
export default function RootLayout({ children, }) {
    return (<html lang="fr">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>);
}
