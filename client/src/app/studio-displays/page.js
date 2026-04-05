"use client";

import { useRouter } from "next/navigation";
import ManageStudios from "../components/studio-displays/ManageStudios";

export default function ManageStudiosPage() {
  const router = useRouter();

  return (
    <main className="p-6 bg-gray-50 min-h-screen text-gray-700 overflow-auto relative">
      {/* Go Back Button */}
<button
  onClick={() => router.push("/home")}
  className="fixed top-2 left-4 px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 z-50"
>
  ← Go Back to Home
</button>

{/* Push content down so it's not hidden behind the fixed button */}
<div className="pt-0 ">
  <img
    src="/NW18.png"
    alt="Network18 Logo"
    className="h-16 mt-5"
  />
</div>
     

      <ManageStudios />
    </main>
  );
}
