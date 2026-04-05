"use client";
import { useState } from "react";
import { toast } from "sonner";
const statusColors = {
  OK: "bg-green-500 text-white",
  Standby: "bg-yellow-400 text-black",
  FAULT: "bg-red-600 text-white",
  "NOT WORKING": "bg-red-700 text-white",
  OFF: "bg-gray-500 text-white",
  "Under Maintenance": "bg-orange-500 text-white",
  "Needs Repair": "bg-pink-500 text-white",
  Testing: "bg-blue-400 text-white",
  "Awaiting Parts": "bg-purple-500 text-white",
  Calibrating: "bg-indigo-500 text-white",
  "Out of Service": "bg-black text-white",
  "Cube-A": "bg-teal-500 text-white",
  "Cube-B": "bg-cyan-500 text-white",
  "Cube-C": "bg-lime-500 text-black",
  "Cube-D": "bg-amber-500 text-black",
};
const initialFormData = {
  floor: "",
  studio: "",
  barco_model: "",
  cube_a: "",
  cube_b: "",
  cube_c: "",
  cube_d: "",
  led_size_85_75_inch: "",
  led_size_65_55_inch: "",
  controller: "",
  lvc_sr_no: "",
  novastar_sr_no: "",
  lvc_nds_status: "OK", 
  wme_net_status: "OK", 
  convertor: "OK",      
  led_tv_85_75_input: "",
  led_tv_65_55_input: "",
  hdmi_input: "",
  lvc_input: "",
  pixel_input: "",
  time: "",
  status: "ok",
  remarks: "",
};

export default function CreateStudios() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.floor || !formData.studio) {
      toast.error("Floor and Studio are required!");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/studiodisplays/create-display`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create studio");

      toast.success("Studio created successfully!");
      setFormData(initialFormData);
      setStep(1);
    } catch (err) {
      console.error("Error creating studio:", err);
      toast.error(err.message || "Failed to create studio.");
    }
  };

  // Step 1 – Basic Info
  const step1 = (
    <div className="space-y-3">
    
      <div>
        <label className="block font-medium">Floor *</label>
        <input
          type="text"
          name="floor"
          value={formData.floor}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        />
      </div>
      <div>
        <label className="block font-medium">Studio *</label>
        <input
          type="text"
          name="studio"
          value={formData.studio}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        />
      </div>
      <div>
        <label className="block font-medium">Barco Model</label>
        <input
          type="text"
          name="barco_model"
          value={formData.barco_model}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
      </div>
    </div>
  );

  // Step 2 – Cubes + Serial Numbers
  const step2 = (
    <div className="space-y-3">
      <div>
        <label className="block font-medium">Cube A</label>
        <input
          type="text"
          name="cube_a"
          value={formData.cube_a}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
      </div>
      <div>
        <label className="block font-medium">Cube B</label>
        <input
          type="text"
          name="cube_b"
          value={formData.cube_b}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
      </div>
      <div>
        <label className="block font-medium">Cube C</label>
        <input
          type="text"
          name="cube_c"
          value={formData.cube_c}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
      </div>
      <div>
        <label className="block font-medium">Cube D</label>
        <input
          type="text"
          name="cube_d"
          value={formData.cube_d}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
      </div>

      <div>
        <label className="block font-medium">LVC sr.no</label>
        <input
          type="text"
          name="lvc_sr_no"
          value={formData.lvc_sr_no}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
      </div>
      <div>
        <label className="block font-medium">Novastar sr.no</label>
        <input
          type="text"
          name="novastar_sr_no"
          value={formData.novastar_sr_no}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
      </div>
    </div>
  );

  // Step 3 – Display + Status
  const step3 = (
    <div className="space-y-3">
      <div>
        <label className="block font-medium">LED Size 85/75</label>
        <input
          type="text"
          name="led_size_85_75_inch"
          value={formData.led_size_85_75_inch}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
      </div>
      <div>
        <label className="block font-medium">LED Size 65/55</label>
        <input
          type="text"
          name="led_size_65_55_inch"
          value={formData.led_size_65_55_inch}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
      </div>
      <div>
        <label className="block font-medium">Controller</label>
        <input
          type="text"
          name="controller"
          value={formData.controller}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
      </div>

     <div>
  <label className="block font-medium">LVC NDS Status</label>
  <select
    name="lvc_nds_status"
    value={formData.lvc_nds_status || "OK"}
    onChange={handleChange}
    className="border p-2 w-full rounded"
  >
    <option value="OK">OK</option>
    <option value="NOT WORKING">NOT WORKING</option>
    <option value="STANDBY">STANDBY</option>
    <option value="OFF">OFF</option>
    <option value="FAULT">FAULT</option>
     <option value="NULL">NULL</option>
  </select>
</div>
     
<div>
  <label className="block font-medium">WME/NET</label>
  <select
    name="wme_net_status"
    value={formData.wme_net_status || "OK"}
    onChange={handleChange}
    className="border p-2 w-full rounded"
  >
     <option value="OK">OK</option>
    <option value="NOT WORKING">NOT WORKING</option>
    <option value="STANDBY">STANDBY</option>
    <option value="OFF">OFF</option>
    <option value="FAULT">FAULT</option>
     <option value="NULL">NULL</option>
  </select>
</div>

     <div>
  <label className="block font-medium">Convertor</label>
  <select
    name="convertor"
    value={formData.convertor || "OK"}
    onChange={handleChange}
    className="border p-2 w-full rounded"
  >
    <option value="OK">OK</option>
    <option value="NOT WORKING">NOT WORKING</option>
    <option value="STANDBY">STANDBY</option>
    <option value="OFF">OFF</option>
    <option value="FAULT">FAULT</option>
     <option value="NULL">NULL</option>
  </select>
</div>


      <div>
        <label className="block font-medium">LED TV 85/75 Input</label>
        <input
          type="text"
          name="led_tv_85_75_input"
          value={formData.led_tv_85_75_input}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
      </div>
      <div>
        <label className="block font-medium">LED TV 65/55 Input</label>
        <input
          type="text"
          name="led_tv_65_55_input"
          value={formData.led_tv_65_55_input}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
      </div>
    </div>
  );

  // Step 4 – Inputs + Remarks
  const step4 = (
    <div className="space-y-3">
      <div>
        <label className="block font-medium">HDMI Input</label>
        <input
          type="text"
          name="hdmi_input"
          value={formData.hdmi_input}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
      </div>
      <div>
        <label className="block font-medium">LVC Input</label>
        <input
          type="text"
          name="lvc_input"
          value={formData.lvc_input}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
      </div>
      <div>
        <label className="block font-medium">Pixel Input</label>
        <input
          type="text"
          name="pixel_input"
          value={formData.pixel_input}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
      </div>

      <div>
        <label className="block font-medium">Remarks</label>
        <textarea
          name="remarks"
          value={formData.remarks}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
      </div>

      <div>
  <label className="block font-medium">Status *</label>
  <select
    name="status"
    value={formData.status}
    onChange={handleChange}
    className={`border p-2 w-full rounded transition-colors duration-200 ${statusColors[formData.status] || ""}`}
  >
    <option value="OK">OK</option>
    <option value="Standby">Standby</option>
    <option value="FAULT">FAULT</option>
    <option value="NOT WORKING">NOT WORKING</option>
    <option value="OFF">OFF</option>
    <option value="Under Maintenance">Under Maintenance</option>
    <option value="Needs Repair">Needs Repair</option>
    <option value="Testing">Testing</option>
    <option value="Awaiting Parts">Awaiting Parts</option>
    <option value="Calibrating">Calibrating</option>
    <option value="Out of Service">Out of Service</option>
    <option value="Cube-A">Cube-A</option>
    <option value="Cube-B">Cube-B</option>
    <option value="Cube-C">Cube-C</option>
    <option value="Cube-D">Cube-D</option>
  </select>
</div>
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Create Studio</h2>

      {/* optional: show "Step X of 4" */}
      <div className="mb-4 text-sm text-gray-600">Step {step} of 4</div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {step === 1 && step1}
        {step === 2 && step2}
        {step === 3 && step3}
        {step === 4 && step4}

        <div className="flex justify-between mt-6">
          {step > 1 ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setStep((s) => Math.max(1, s - 1));
              }}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Prev
            </button>
          ) : (
            <div /> // keep spacing
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault(); // ensure no submit
                setStep((s) => Math.min(4, s + 1));
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Create Studio
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
const handleDelete = async (id) => {
  if (!id) return;

  const confirmed = window.confirm("Are you sure you want to delete this studio display?");
  if (!confirmed) return;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/studiodisplays/delete-display/${id}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to delete display");

    toast.success("Studio display deleted successfully!");
    // Optionally, reset form if deleted display was being edited
    setFormData(initialFormData);
    setStep(1);
  } catch (err) {
    console.error("Delete error:", err);
    toast.error(err.message || "Failed to delete display");
  }
};