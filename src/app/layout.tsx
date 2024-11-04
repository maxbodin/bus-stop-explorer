import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Bastien & Maxime - La Rochelle Bus Stop Explorer",
  description: "An interactive map built with Leaflet that tracks the bus stops my friend Bastien and I have visited in La Rochelle. As we aim to explore all the bus stops in the city, the map highlights our journey and progress.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        {children}
      </body>
    </html>
  );
}
