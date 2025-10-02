import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { ReduxProvider } from "@/components/providers/redux-provider";

export const metadata: Metadata = {
  title: "React Video Editor | Pro",
  description: "Purchased version of the React Video Editor.",
  icons: {
    icon: "/logo.jpg",
    shortcut: "/logo.jpg",
    apple: "/logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head />
      <body>
        <ReduxProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <main className="bg-gray-900">
              {children}
              <Toaster />
            </main>
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
