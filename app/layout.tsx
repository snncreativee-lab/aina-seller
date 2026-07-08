import "./globals.css";

export const metadata = {
  title: "AINA",
  description: "Partner bisnes awak",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ms">
      <body>{children}</body>
    </html>
  );
}