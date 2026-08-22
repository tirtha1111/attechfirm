import "./globals.css";

const AT_FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M3 20h3.2l1.5-4.2h8.6L17.8 20H21L13.4 2h-2.8L3 20zm6.1-7.2L12 5.3l2.9 7.5H9.1z'/%3E%3C/svg%3E";

export const metadata = {
  title: "A&T TECH FIRM — Building Digital Solutions for a Better Tomorrow",
  description:
    "A&T TECH FIRM is a technology and digital-solutions company focused on building useful, modern and accessible digital products — web development, database solutions and digital growth.",
  icons: { icon: AT_FAVICON },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ background: "#000", margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
