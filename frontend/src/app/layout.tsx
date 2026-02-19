import './globals.css'; // This restores the styles

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0a0f1d]">{children}</body>
    </html>
  );
}