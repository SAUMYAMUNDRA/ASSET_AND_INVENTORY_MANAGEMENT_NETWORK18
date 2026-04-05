"use client";

import { useState, useEffect } from "react";

export default function Dashboard() {
  const [studioCount, setStudioCount] = useState(0);

  useEffect(() => {
    const fetchStudios = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/studiodisplays/get-displays`,
          { credentials: "include" }
        );
        const data = await res.json();
        // Assuming API returns an array of studios
        setStudioCount(data.displays?.length || 0);
      } catch (error) {
        console.error("Error fetching studios:", error);
        setStudioCount(0);
      }
    };

    fetchStudios();
  }, []);

  return (
    <div className="w-full p-6">
      <div className="bg-blue-500 text-white rounded-lg shadow p-6 text-center">
        <p className="text-3xl font-bold">{studioCount}</p>
        <p className="mt-1 text-lg">Studios</p>
      </div>
    </div>
  );
}
