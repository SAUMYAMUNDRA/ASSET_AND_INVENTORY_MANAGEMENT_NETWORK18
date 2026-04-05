"use client";
import { useState, useEffect } from "react";

export default function AddUser() {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [cityId, setCityId] = useState(null);

  const [rbac, setRbac] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState({}); // { id: true }
// inside AddUser component

useEffect(() => {
  if (rbac.length === 0) return;

  if (role === "user") {
    // Select only `get` permissions
    const getPermissions = {};
    rbac.forEach((perm) => {
      if (perm.subcategory === "get") {
        getPermissions[perm.id] = true;
      }
    });
    setSelectedPermissions(getPermissions);
  } else if (role === "admin") {
    // Select all permissions
    const allPermissions = {};
    rbac.forEach((perm) => {
      allPermissions[perm.id] = true;
    });
    setSelectedPermissions(allPermissions);
  }
}, [role, rbac]);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/users/current-user`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setCityId(data.user.city_id);
        }
      } catch (err) {
        console.error("Failed to fetch current user:", err);
      }
    };

    const fetchRbac = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/admin/rbac/get-rbac`);
        if (res.ok) {
          const data = await res.json();
          setRbac(data.rbac || []);
        }
      } catch (err) {
        console.error("Failed to fetch RBAC:", err);
      }
    };

    fetchMe();
    fetchRbac();
  }, []);

 const handlePermissionToggle = (permission) => {
  setSelectedPermissions((prev) => {
    const newSelected = { ...prev };
    const hierarchy = ["get", "create", "edit", "delete"];
    const permIndex = hierarchy.indexOf(permission.subcategory);

    const allInCategory = rbac.filter((p) => p.category === permission.category);

    if (newSelected[permission.id]) {
      // ✅ If unchecking
      if (permission.subcategory === "get") {
        // Just remove THIS one "get"
        delete newSelected[permission.id];
      } else {
        // For others (create/edit/delete), uncheck them and higher ones
        hierarchy.slice(permIndex).forEach((action) => {
          allInCategory
            .filter((p) => p.subcategory === action)
            .forEach((p) => delete newSelected[p.id]);
        });
      }
    } else {
      // ✅ If checking
      if (permission.subcategory === "get") {
        // Only tick this "get"
        newSelected[permission.id] = true;
      } else {
        // For create/edit/delete, tick all lower hierarchy too
        hierarchy.slice(0, permIndex + 1).forEach((action) => {
          allInCategory
            .filter((p) => p.subcategory === action)
            .forEach((p) => (newSelected[p.id] = true));
        });
      }
    }

    return newSelected;
  });
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const permissionsArray = Object.keys(selectedPermissions).map((id) => parseInt(id));

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/admin/users/create-user`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullname, email, password, role, city_id: cityId, permissions: permissionsArray }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to create user");
      }

      setMessage("✅ User created successfully!");
      setFullname("");
      setEmail("");
      setPassword("");
      setRole("user");
      setSelectedPermissions({});
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const groupedRbac = rbac.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-3xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Add User</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            required
            className="w-full border p-3 rounded-md focus:ring-2 focus:ring-blue-400 outline-none transition"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border p-3 rounded-md focus:ring-2 focus:ring-blue-400 outline-none transition"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border p-3 rounded-md focus:ring-2 focus:ring-blue-400 outline-none transition"
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border p-3 rounded-md focus:ring-2 focus:ring-blue-400 outline-none transition"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <div className="border p-4 rounded-lg bg-gray-50 shadow-inner">
            <h3 className="font-semibold mb-3 text-lg">Permissions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {Object.keys(groupedRbac).map((category) => (
                <div key={category} className="bg-white p-3 rounded-md shadow-sm">
                  <h4 className="font-medium mb-2 text-blue-600">{category}</h4>
                  <div className="space-y-2 ml-2">
                    {groupedRbac[category].map((perm) => (
                      <label key={perm.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded transition">
                        <input
                          type="checkbox"
                          checked={!!selectedPermissions[perm.id]}
                          onChange={() => handlePermissionToggle(perm)}
                          className="accent-blue-500"
                        />
                        <span>{perm.name} <span className="text-gray-500 text-sm">({perm.subcategory})</span></span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-md w-full font-semibold hover:bg-blue-700 transition"
          >
            {loading ? "Adding..." : "Add User"}
          </button>
        </form>

        {message && <p className="mt-4 text-center text-sm">{message}</p>}
      </div>
    </div>
  );
}
