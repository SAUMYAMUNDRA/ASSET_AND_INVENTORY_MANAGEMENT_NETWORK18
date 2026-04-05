"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    if (!fetched) {
      setLoading(true);
      fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/admin/users/list-users`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
        .then(async (res) => {
          if (!res.ok) throw new Error("Failed to fetch users");
          const data = await res.json();
          setUsers(data.users);
          setFetched(true);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [fetched]);



const handleLogout = async (user_id) => {
  if (!window.confirm("Are you sure you want to log this user out?")) return;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/admin/users/logout-user`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id }),
      }
    );

    if (!res.ok) {
      toast.error("Failed to log out user ❌", { id: "global-toast" });
      return;
    }

    toast.success("User logged out successfully ✅", { id: "global-toast" });
  } catch (err) {
    console.error(err);
    toast.error("Something went wrong ❌", { id: "global-toast" });
  }
};



  const handleDelete = async (user_id) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/admin/users/delete-user`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id }),
        }
      );

      if (!res.ok) toast.error("Something went wrong ❌", { id: "global-toast" });
      setUsers((prev) => prev.filter((u) => u.user_id !== user_id));
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDelete = (user_id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      handleDelete(user_id);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/admin/users/edit-user`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: editingUser.user_id,
          newname: editingUser.fullname,
          newemail: editingUser.email,
          newpassword: editingUser.password,
          newrole: editingUser.role,
        }),
      });
      if (!res.ok) throw new Error("Failed to update user");
      toast.success("User updated successfully ✅", { id: "global-toast" });
      setEditingUser(null);
      setFetched(false); // refresh list
    } catch (err) {
      console.error(err);
      toast.error("Failed to update user ❌", { id: "global-toast" });
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Manage Users</h2>

      {loading && <p>Loading users...</p>}
      {!loading && users.length === 0 && <p>No users found.</p>}

      {!loading && users.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Full Name</th>
                <th className="px-4 py-2 border">Role</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{user.email}</td>
                  <td className="px-4 py-2 border">{user.fullname}</td>
                  <td className="px-4 py-2 border">{user.role}</td>
                 <td className="px-4 py-2 border space-x-2">
  <button
    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
    onClick={() => setEditingUser(user)}
  >
    Edit
  </button>
  <button
    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
    onClick={() => confirmDelete(user.user_id)}
  >
    Delete
  </button>
  <button
    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
    onClick={() => handleLogout(user.user_id)}
  >
    Logout of all devices
  </button>
</td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

{/* Edit Modal */}
{editingUser && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded shadow-lg w-96">
      <h3 className="text-lg font-semibold mb-4">Edit User</h3>
      <form onSubmit={handleEditSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            value={editingUser.fullname}
            onChange={(e) => setEditingUser({ ...editingUser, fullname: e.target.value })}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={editingUser.email}
            onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="text"
            value={editingUser.password || ""}
            onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Role</label>
          <select
            value={editingUser.role}
            onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
            className="w-full border p-2 rounded"
          >
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
            onClick={() => setEditingUser(null)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  </div>
)}

    </div>
  );
}
