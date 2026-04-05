"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Pencil, Check, X, Lock } from "lucide-react";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [formData, setFormData] = useState({
    cityname: "",
    adminname: "",
    adminemail: "",
    adminpassword: "",
    permissions: [],
  });

  const [admins, setAdmins] = useState([]);
  const [editingCityName, setEditingCityName] = useState(null); // track city being edited
  const [editData, setEditData] = useState({}); // store temp edit data
  const [searchTerm, setSearchTerm] = useState(""); // search functionality

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/specialadmin/verify`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: loginData.email,
            password: loginData.password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "❌ Login failed");
        setIsLoggingIn(false);
        return;
      }

      toast.success("✅ Login successful!");
      setIsAuthenticated(true);
      setLoginData({ email: "", password: "" });
    } catch (err) {
      console.error("⚠️ Error during login:", err);
      toast.error(err.message || "Error during login");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    let updatedPermissions = [...formData.permissions];

    if (checked) {
      updatedPermissions.push(value);
    } else {
      updatedPermissions = updatedPermissions.filter((p) => p !== value);
    }

    setFormData({ ...formData, permissions: updatedPermissions });
  };

  const fetchAdmins = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/specialadmin/get-admin`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to fetch admins");
        return;
      }
      setAdmins(data.admins || []);
    } catch (err) {
      console.error("Error fetching admins:", err);
      toast.error(err.message || "Error fetching admins");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.permissions.length === 0) {
      toast.error("❌ Please select at least one checkbox.");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/specialadmin/create-admin`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "❌ Failed to create admin");
        return;
      }

      toast.success("✅ Admin created successfully!");
      setFormData({
        cityname: "",
        adminname: "",
        adminemail: "",
        adminpassword: "",
        permissions: [],
      });

      fetchAdmins();
    } catch (err) {
      console.error("⚠️ Error creating admin:", err);
      toast.error(err.message || "Error creating admin");
    }
  };

  const handleEdit = (admin) => {
    setEditingCityName(admin.cityname); // Use cityname as unique identifier
    setEditData({
      originalCityname: admin.cityname,
      cityname: admin.cityname,
      studio_display: !!admin.studio_display,
      asset_inventory: !!admin.asset_inventory,
      event_report: !!admin.event_report,
    });
  };

  const handleCancel = () => {
    setEditingCityName(null);
    setEditData({});
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData({
      ...editData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSave = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/specialadmin/edit-admindetails`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            originalCityname: editData.originalCityname,
            cityname: editData.cityname,
            studio_display: editData.studio_display,
            asset_inventory: editData.asset_inventory,
            event_report: editData.event_report,
          }),
        }
      );

      if (!res.ok) {
        toast.error("❌ Failed to update admin details");
        return;
      }

      toast.success("✅ Admin updated successfully!");
      setEditingCityName(null);
      setEditData({});
      fetchAdmins();
    } catch (err) {
      console.error("⚠️ Error updating admin:", err);
      toast.error(err.message || "Error updating admin");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoginData({ email: "", password: "" });
    toast.info("Logged out successfully");
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdmins();
    }
  }, [isAuthenticated]);

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <img src="/NW18.PNG" alt="Network18" className="h-16 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Special Admin Login</h2>
            <p className="text-gray-600">Access the administrative dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={loginData.email}
                  onChange={handleLoginChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={loginData.password}
                  onChange={handleLoginChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Verifying...
                </>
              ) : (
                <>
                  <Lock size={16} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <Lock size={14} />
              <span className="text-xs">Secure Authentication Required</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show main admin page if authenticated
  return (
    <div className="min-h-screen bg-white">
      {/* Header with Logo and Logout */}
      <div className="p-4 flex justify-between items-center">
        <button
          className="px-3 py-1 border rounded text-gray-700 hover:bg-gray-100"
          onClick={() => window.location.href = '/'}
        >
          ← Go Back to Login
        </button>
        <button
          onClick={handleLogout}
          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* Header with Logo */}
      <div className="px-6 flex items-center">
        <img src="/NW18.PNG" alt="Network18" className="h-14" />
      </div>

      <hr className="my-4" />

      {/* Admin Registration */}
      <div className="max-w-xl mx-auto">
        <div className="p-6 rounded-lg shadow-md">
          <h2 className="text-xl text-black font-bold mb-4">Admin Registration</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="cityname" className="block mb-2 font-medium text-gray-700">
                City Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="cityname"
                name="cityname"
                value={formData.cityname}
                onChange={handleChange}
                placeholder="Enter City Name"
                className="w-full text-black p-2 border rounded"
                required
              />
            </div>

            <div>
              <label htmlFor="adminname" className="block mb-2 font-medium text-gray-700">
                Admin Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="adminname"
                name="adminname"
                value={formData.adminname}
                onChange={handleChange}
                placeholder="Enter Admin Name"
                className="w-full text-black p-2 border rounded"
                required
              />
            </div>

            <div>
              <label htmlFor="adminemail" className="block mb-2 font-medium text-gray-700">
                Admin Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="adminemail"
                name="adminemail"
                value={formData.adminemail}
                onChange={handleChange}
                placeholder="Enter Admin Email"
                className="w-full text-black p-2 border rounded"
                required
              />
            </div>

            <div>
              <label htmlFor="adminpassword" className="block mb-2 font-medium text-gray-700">
                Admin Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="adminpassword"
                name="adminpassword"
                value={formData.adminpassword}
                onChange={handleChange}
                placeholder="Enter Admin Password"
                className="w-full text-black p-2 border rounded"
                required
              />
            </div>

            <div>
              <div className="flex justify-evenly space-y-2 text-black">
                {["studio_display", "asset_inventory", "event_report"].map((perm) => (
                  <label key={perm}>
                    <input
                      type="checkbox"
                      value={perm}
                      checked={formData.permissions.includes(perm)}
                      onChange={handleCheckboxChange}
                      className="mr-2"
                    />
                    {perm.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Submit
            </button>
          </form>
        </div>
      </div>

      {/* Admin Table */}
      <div className="max-w-4xl mx-auto mt-8 overflow-x-auto py-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Existing Admins</h3>
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search by city name, admin name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-black w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <table className="w-full border border-gray-300 text-black">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">S.No</th>
              <th className="border px-2 py-1">City Name</th>
              <th className="border px-2 py-1">Admin Name</th>
              <th className="border px-2 py-1">Email</th>
              <th className="border px-2 py-1">Studio Display</th>
              <th className="border px-2 py-1">Asset Inventory</th>
              <th className="border px-2 py-1">Event Report</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins
              // Filter admins to show only one per city
              .filter((admin, index, self) => 
                index === self.findIndex(a => a.cityname === admin.cityname)
              )
              // Apply search filter
              .filter((admin) => {
                const searchLower = searchTerm.toLowerCase();
                return (
                  admin.cityname?.toLowerCase().includes(searchLower) ||
                  admin.adminname?.toLowerCase().includes(searchLower) ||
                  admin.adminemail?.toLowerCase().includes(searchLower)
                );
              })
              .map((admin, idx) => (
                <tr key={admin.cityname} className="text-center">
                  <td className="border px-2 py-1">{idx + 1}</td>

                  {/* Editable City Name */}
                  <td className="border px-2 py-1">
                    {editingCityName === admin.cityname ? (
                      <input
                        type="text"
                        name="cityname"
                        value={editData.cityname}
                        onChange={handleEditChange}
                        className="w-full p-1 border rounded text-black"
                      />
                    ) : (
                      admin.cityname
                    )}
                  </td>

                  <td className="border px-2 py-1">{admin.adminname}</td>
                  <td className="border px-2 py-1">{admin.adminemail}</td>

                  {/* Editable Checkboxes */}
                  {["studio_display", "asset_inventory", "event_report"].map((perm) => (
                    <td key={perm} className="border px-2 py-1">
                      {editingCityName === admin.cityname ? (
                        <input
                          type="checkbox"
                          name={perm}
                          checked={!!editData[perm]}
                          onChange={handleEditChange}
                          className="accent-blue-600"
                        />
                      ) : (
                        <div className="flex items-center justify-center">
                          <span className={`inline-block w-4 h-4 rounded border-2 ${
                            !!admin[perm] ? 'bg-blue-600 border-blue-600' : 'bg-gray-200 border-gray-300'
                          }`}>
                            {!!admin[perm] && (
                              <Check size={12} className="text-white" />
                            )}
                          </span>
                        </div>
                      )}
                    </td>
                  ))}

                  {/* Actions */}
                  <td className="border px-2 py-1 text-center">
                    {editingCityName === admin.cityname ? (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={handleSave}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(admin)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                      >
                        <Pencil size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 py-4 mt-8">
        <div className="text-center text-gray-600">
          <div className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">Secure Admin Panel</span>
          </div>
          <p className="text-xs mt-1">Network18 Special Administrative Dashboard</p>
        </div>
      </div>
    </div>
  );
}