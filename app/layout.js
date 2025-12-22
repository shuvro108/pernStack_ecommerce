import { Outfit } from "next/font/google";
import "./globals.css";
import { AppContextProvider } from "@/context/AppContext";
import { Toaster } from "react-hot-toast";
import { ClerkProvider } from "@clerk/nextjs";

const outfit = Outfit({ subsets: ["latin"], weight: ["300", "400", "500"] });

export const metadata = {
  title: "TerraCotta - Indigenous Handicrafts",
  description:
    "Discover authentic handmade handicrafts from indigenous artisans",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favIcon/favicon.ico" },
      { url: "/favIcon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favIcon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/favIcon/apple-touch-icon.png",
    other: [
      {
        rel: "android-chrome-192x192",
        url: "/favIcon/android-chrome-192x192.png",
      },
      {
        rel: "android-chrome-512x512",
        url: "/favIcon/android-chrome-512x512.png",
      },
    ],
  },
  manifest: "/favIcon/site.webmanifest",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${outfit.className} antialiased text-gray-700`}
          suppressHydrationWarning
        >
          <Toaster />
          <AppContextProvider>{children}</AppContextProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
