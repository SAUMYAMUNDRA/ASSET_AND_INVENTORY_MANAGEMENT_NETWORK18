
import { Toaster } from "sonner";
import "./globals.css";
export const metadata = {
  title: "Network 18",
  description: "Network 18 Events, Studio Displays and Assets.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        {/* Toast provider */}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
