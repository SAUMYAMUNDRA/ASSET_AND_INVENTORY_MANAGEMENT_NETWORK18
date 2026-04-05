"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { toast } from "sonner"; // if using sonner for notifications
import { generatePDF } from '../components/event/PDFGenerator';

export default function EventReportPage({isreviewing = false, eventid=null}) {
  const router = useRouter();
const [form, setForm] = useState({
  eventName: "",
  date: "",
  channel: "",
  broadcastType: "",
  location: "",
  city: "",
  setup: "",
  camera: "",
  jimmy: "",
  showType: "",
  setupDate: "",       // MM/DD/YYYY
  setupStartTime: "",  // --:-- --
  setupEndTime: "",    // --:-- --
  checkingDone: ""  ,   // --:-- --
  day:1,
});

 const [electricData, setElectricData] = useState([
    { id: 1, source: "House Supply", available: "Yes", kva: "", value: "", note: "", status: "" },
    { id: 2, source: "DG",        available: "Yes", kva: "", value: "", note: "", status: "" },
    { id: 3, source: "UPS",      available: "Yes", kva: "", value: "", note: "", status: "" },
    { id: 4, source: "ATS",      available: "Yes", kva: "", value: "", note: "", status: "" },
    { id: 5, source: "Earthling", available: "Yes", kva: "", value: "", note: "", status: "" },
  ]);
  const handleChangepower = (index, field, value) => {
    const updated = [...electricData];
    updated[index][field] = value;
    setElectricData(updated);
  };

  const [teamForm, setTeamForm] = useState({
  engineer: "",
  showProducer: "",
  showDOP: "",
  onlineEditor: "",
  electrical: "",
  soundEngineer: "",
  productionControl: "",
});
  const [days, setDays] = useState([
  {

    date: "",
    feedTestLocation: "",
    feedTestDate: "",
    feedTestTime: "",
    eventStartTime: "",
    eventEndTime: "",
    eventDuration: "",
    comments: "",
    commentColor: "Black",
    signature: "",
    signatureDate: "",
  },
]);
  const [equipmentData, setEquipmentData] = useState([
    
  ]);
const [globalVendor, setGlobalVendor] = useState("");
const [newVendor, setNewVendor] = useState("");


  const [vendors, setVendors] = useState([]);
  const [CHANNEL_OPTIONS, setChannels] = useState([]);
const [SHOW_TYPE_OPTIONS, setShowTypes] = useState([]); // Add this line

 useEffect(() => {
  const fetchData = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

      const [vendorsRes, channelsRes, showTypesRes] = await Promise.all([
        fetch(`${baseUrl}/api/assetinventory/vendor/get-vendors`, {
          credentials: "include",
        }),
        fetch(`${baseUrl}/api/assetinventory/channel/get-channels`, {
          credentials: "include",
        }),
        fetch(`${baseUrl}/api/assetinventory/showtype/get-show-types`, { // Add this fetch
          credentials: "include",
        }),
      ]);

      if (!vendorsRes.ok || !channelsRes.ok || !showTypesRes.ok) {
        throw new Error("Failed to fetch vendors, channels, or show types");
      }

      const vendorsData = await vendorsRes.json();
      const channelsData = await channelsRes.json();
      const showTypesData = await showTypesRes.json(); // Add this line
      
      // Map MySQL rows into arrays of just names
      const vendorList = vendorsData.map(v => v.vendor_name);
      const channelList = channelsData.map(c => c.channel_name);
      const showTypeList = showTypesData.map(s => s.show_type || s.name); // Add this line

      setVendors(vendorList || []);
      setChannels(channelList || []);
      setShowTypes(showTypeList || []); // Add this line

      console.log("Channels:", channelList);
      console.log("Show Types:", showTypeList); // Add this line
    } catch (err) {
      console.error("Error fetching vendors/channels/show types:", err);
    }
  };

  fetchData();
}, []);

const handleAddVendor = () => {
  if (newVendor.trim() && !vendors.includes(newVendor.trim())) {
    setVendors([...vendors, newVendor.trim()]);
    setGlobalVendor(newVendor.trim()); // auto-select new vendor
    setNewVendor(""); // clear input
  }
};

const handleToggleAllHired = () => {
  const allHired = equipmentData.every(row => row.hired); 
  const newData = equipmentData.map(row => ({
    ...row,
    hired: !allHired, // flip the status
    vendorName: !allHired ? row.vendorName : "", // optionally clear vendor name if unchecking
  }));
  setEquipmentData(newData);
};

const handleApplyGlobalVendor = () => {
  const updatedData = equipmentData.map((row) =>
    row.hired
      ? { ...row, vendorName: globalVendor } // only apply if hired is true
      : row // leave the row unchanged if not hired
  );
  setEquipmentData(updatedData);
};

const handleResetVendors = () => {
  const updatedData = equipmentData.map((row) => ({
    ...row,
    hired: false,
    vendorName: "",
  }));
  setEquipmentData(updatedData);
};

  // Handle Change Function
  const handleChangeEquipment = (index, field, value) => {
    const newData = [...equipmentData];
	  // Enforce only one of inHouse/hired
    newData[index][field] = value;

    // Reset vendor name if hired unchecked
    if (field === "hired" && value === false) {
      newData[index].vendorName = "";
    }

    setEquipmentData(newData);
  };

  // Add new row
  const addEquipmentRow = () => {
    setEquipmentData([
      ...equipmentData,
      {
        id: equipmentData.length + 1,
        equipment: "",
        modelNo: "",
        qty: "",
        installationTime: "",
        doneTime: "",
        inHouse: false,
        hired: false,
        vendorName: "",
        remarks: "",
        status: "",
      },
    ]);
  };
  const addTwentyDefaultRows = () => {
  const defaultEquipment = [
    "Cameras",
    "Lens",
    "Lens HJ 40x",
    "Lens HJ 24x",
    "Lens 70x",
    "Lens 14 Wide angle",
    "Tripod",
    "Jimmy Jib",
    "14\" Monitor",
    "Plasma",
    "Switcher",
    "Talk Back",
    "P2 VTR / AXA J PRO",
    "Audio Mixer",
    "PCB Speaker",
    "Anchor EP",
    "Watchout / Vmix",
    "Main Sound",
    "PCP UPS",
  ];

  const newRows = [];
  const startId = equipmentData.length;

  for (let i = 0; i < 19; i++) {
    const equipmentName = defaultEquipment[i % defaultEquipment.length] || "";
    newRows.push({
      id: startId + i + 1,
      equipment: equipmentName,
      modelNo: "",
      qty: "",
      installationTime: "",
      doneTime: "",
      inHouse: false,
      hired: false,
      vendorName: "",
      remarks: "",
      status: "",
    });
  }

  setEquipmentData([...equipmentData, ...newRows]);
};

  const [user, setUser] = useState({ name: "", email: "" });
  const [userLoading, setUserLoading] = useState(true);
 

// For text inputs
// ✅ New handler for team details form

 
const [liveSourceData, setLiveSourceData] = useState([
  { id: 1, name: "Uplink Main", available: "", type: "", bandwidth: "", note: "", status: "" },
  { id: 2, name: "Uplink Backup", available: "", type: "", bandwidth: "", note: "", status: "" },
  { id: 3, name: "Longshot Camera", available: "", type: "", bandwidth: "", note: "", status: "" },
  { id: 4, name: "LAN", available: "", type: "", bandwidth: "", note: "", status: "" },
]);

  const fetchUser = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/users/current-user`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch user data.");
      const userData = await res.json();
      setUser({ name: userData.user.name, email: userData.user.email });
    } catch (err) {
      console.error("Error fetching user data:", err);
      toast.error("Error fetching user data.");
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
	  addTwentyDefaultRows();
    fetchUser();
  }, []);
  // Fetch event details when reviewing
 useEffect(() => {
  console.log(isreviewing, "PRINTNED");
  if (!isreviewing) return;

  const fetchEventDetails = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/eventreport/get`, {
        method: "POST", // <-- switch to POST
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId: eventid }), // <-- send eventId here
      });

      if (!res.ok) throw new Error("Failed to fetch event data");
      const data = await res.json();
		console.log(data);
      // Populate states with fetched data
setForm({
  eventName: data.event_name || "",
  date: data.event_date || "",
  channel: data.channel || "",
  broadcastType: data.broadcast_type || "",
  location: data.location_hotel_name || "",
  city: data.state_city || "",
  setup: data.setup_type || "",
  camera: data.camera || "",
  jimmy: data.jimmy_jib || "",
  showType: data.show_type || "",
  setupDate: data.setup_date || "",
  setupStartTime: data.setup_start_time || "",
  setupEndTime: data.setup_end_time || "",
  checkingDone: data.checking_done || "",
  day: data.days?.length || 1,
  event_engineer: data.event_engineer || "",
  show_producer: data.show_producer || "",
  show_dop: data.show_dop || "",
  online_editor: data.online_editor || "",
  electrical: data.electrical || "",
  sound_engineer: data.sound_engineer || "",
  production_control: data.production_control || "",
});


		setElectricData((data.power || []).map(p => ({
		  id: p.id,
		  event_id: p.event_id,
		  source: p.source,
		  available: p.available,
		  kva: p.kva,
		  value: p.value,
		  note: p.note,
		  status: p.status
		})) || electricData);
      setLiveSourceData(data.liveSource || liveSourceData);
setEquipmentData(
  (data.equipment || []).map(eq => ({
    id: eq.id || "",
    equipment: eq.equipment || "",
    modelNo: eq.model_no || "",
    qty: eq.qty || "",
    installationTime: eq.installation_time || "",
    doneTime: eq.done_time || "",
    inHouse: false, // default, as API doesn't provide this
    hired: false,   // default, as API doesn't provide this
    vendorName: eq.vendor_name || "",
    remarks: eq.remarks || "",
    status: eq.status || "",
  }))
);const cleanDate = (d) => {
  if (!d) return "";
  const invalidDates = ["1899-11-29", "0000-00-00"];
  const datePart = d.split("T")[0];
  return invalidDates.includes(datePart) ? "" : datePart;
};

setDays(
  (data.days || []).map(day => ({
    date: cleanDate(day.date),
    feedTestLocation: day.feed_test_location || "",
    feedTestDate: cleanDate(day.feed_test_date),
    feedTestTime: day.feed_test_time || "",
    eventStartTime: day.event_start_time || "",
    eventEndTime: day.event_end_time || "",
    eventDuration: day.event_duration || "",
    comments: day.comments || "",
    commentColor: "Black",
    signature: day.signature || "",
    signatureDate: cleanDate(day.signatureDate),
  }))
);

    } catch (err) {
      console.error(err);
      toast.error("Failed to load event details");
    }
  };

  fetchEventDetails();
}, [isreviewing, eventid]);

const handleChangeLiveSource = (index, field, value) => {
  const updated = [...liveSourceData];
  updated[index][field] = value;
  setLiveSourceData(updated);
};
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    // Include daysarray in the payload
    const payload = { 
      ...form,
      electricData,
      liveSourceData,
	  equipmentData,
      day: days,
	  
    };

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/eventreport/create-event`, 
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();
    if (res.ok) {
      toast.success("Event created successfully!");
	  handleGeneratePDF();
    } else {
      toast.error(`Error: ${data.error}`);
    }
  } catch (err) {
    console.error("Network error:", err);
    toast.error("Network error");
  }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const clearSetup = () => setForm((prev) => ({ ...prev, setup: "" }));

  const handleDaysCounter = (delta) => {
    let newCount = form.day + delta;
    if (newCount < 1) newCount = 1;
    const newDays = [];
    for (let i = 0; i < newCount; i++) {
      newDays.push(
        days[i] || {
          date: "",
          checkingDone: "",
          feedTestLocation: "",
          feedTestDate: "",
          feedTestTime: "",
          eventStartTime: "",
          eventEndTime: "",
          eventDuration: "",
          comments: "",
          commentColor: "Black",
          signature: "",
          signatureDate: "",
        }
      );
    }
    setDays(newDays);
    setForm((prev) => ({ ...prev, day: newCount }));
  };
const handleDayChange = (index, field, value) => {
  setDays((prev) =>
    prev.map((day, i) => {
      if (i !== index) return day;

      const updatedDay = { ...day, [field]: value };

      // If both times are available, calculate duration
      if (updatedDay.eventStartTime && updatedDay.eventEndTime) {
        const start = new Date(`1970-01-01T${updatedDay.eventStartTime}:00`);
        const end = new Date(`1970-01-01T${updatedDay.eventEndTime}:00`);

        let diff = (end - start) / 1000 / 60; // in minutes
        if (diff < 0) diff += 24 * 60; // handle overnight events

        const days = Math.floor(diff / (24 * 60));
        diff %= 24 * 60;

        const hours = Math.floor(diff / 60);
        const minutes = diff % 60;

        let duration = "";
        if (days > 0) duration += `${days}d `;
        if (hours > 0) duration += `${hours}h `;
        if (minutes > 0) duration += `${minutes}m`;

        updatedDay.eventDuration = duration.trim() || "0m";
      } else {
        updatedDay.eventDuration = "";
      }

      return updatedDay;
    })
  );
};
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/users/current-user`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error("Failed to fetch user data.");
        const data = await res.json();

        setUser({
          name: data.user.name,
          email: data.user.email,
          city: data.user.city_name, // fetch city name too
        });
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setUserLoading(false);
      }
    };

    fetchUser();
  }, []);

const handleGenerateExcel = async () => {
  try {
    const workbook = new ExcelJS.Workbook();

    // Event Details Sheet
    const wsEvent = workbook.addWorksheet("Event Details");
    wsEvent.addRow(["Field", "Value"]);
    wsEvent.addRows([
      ["Event Name", form.eventName],
      ["Date", form.date],
      ["Channel", form.channel],
      ["Broadcast Type", form.broadcastType],
      ["Location", form.location],
      ["City", form.city],
      ["Setup Type", form.setup],
      ["Show Type", form.showType],
      ["Camera", form.camera],
      ["Jimmy Jib", form.jimmy],
      ["Setup Date", form.setupDate],
      ["Setup Start Time", form.setupStartTime],
      ["Setup End Time", form.setupEndTime],
      ["Checking Done", form.checkingDone],
      ["Event Engineer", form.event_engineer],
      ["Show Producer", form.show_producer],
      ["Show DOP", form.show_dop],
      ["Online Editor", form.online_editor],
      ["Electrical", form.electrical],
      ["Sound Engineer", form.sound_engineer],
      ["Production Control", form.production_control],
    ]);

    // Equipment Sheet
    const wsEquipment = workbook.addWorksheet("Equipment");
    wsEquipment.columns = Object.keys(equipmentData[0] || {}).map((key) => ({ header: key, key }));
    wsEquipment.addRows(equipmentData);

    // Live Source Sheet
    const wsLiveSource = workbook.addWorksheet("Live Source");
    wsLiveSource.columns = Object.keys(liveSourceData[0] || {}).map((key) => ({ header: key, key }));
    wsLiveSource.addRows(liveSourceData);

    // Electrical Sheet
    const wsElectric = workbook.addWorksheet("Electrical");
    wsElectric.columns = Object.keys(electricData[0] || {}).map((key) => ({ header: key, key }));
    wsElectric.addRows(electricData);

    // Days Sheet
    const wsDays = workbook.addWorksheet("Days");
    wsDays.columns = Object.keys(days[0] || {}).map((key) => ({ header: key, key }));
    wsDays.addRows(days);

    // Generate buffer and save
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer], { type: "application/octet-stream" }),
      `${form.eventName || "EventReport"}.xlsx`
    );

    toast.success("Excel generated successfully!");
  } catch (err) {
    console.error(err);
    toast.error("Failed to generate Excel");
  }
};

const handleGeneratePDF = async () => {
  try {
    // Map the `days` state into the format your PDF generator expects
    const formattedDays = days.map((day) => ({
      
      feedTestLocation: day.feedTestLocation,
      feedTestDate: day.feedTestDate,
      feedTestTime: day.feedTestTime,
      eventStartTime: day.eventStartTime,
      eventEndTime: day.eventEndTime,
      eventDuration: day.eventDuration,
      eventEngineerComments: day.comments,
      dayCommentColor: day.commentColor,
      signature: day.signature,
	  comments: day.comments,
	  date: day.date,
      signatureDate: day.signatureDate,
    }));
	console.log("FORMATTED  DAYS:",formattedDays);
    await generatePDF({
      eventName: form.eventName,
      date: form.date,
      channel: form.channel,
      broadcastType: form.broadcastType,
      location: form.location,
      city: form.city,
      setupType: form.setup,
      showType: form.showType,
      camera: form.camera,
      jimmyJib: form.jimmy,
      power:electricData,
      liveSource: liveSourceData,
	  equipment: equipmentData,
	  setupDate : form.setupDate,
	  setupStartTime: form.setupStartTime,
	  setupEndTime: form.setupEndTime,
	  checkingDone: form.checkingDone,
      eventEngineer: form.event_engineer,
      showProducer: form.show_producer,
      showDop: form.show_dop,
      onlineEditor: form.online_editor,
      electrical: form.electrical,
      soundEngineer: form.sound_engineer,
      productionControl: form.production_control,
      loggedInUser: user.name,
      userFullName: user.name,
      userEmail: user.email,
      days: formattedDays, 
    });
	console.log(electricData);
    toast.success("PDF generated successfully!");
	if (!isreviewing){
		window.location.reload();
	}	
  } catch (err) {
    console.error("PDF generation error:", err);
    toast.error("PDF GENRATION FAILED, MAKE SURE TO ADD REQUIRED FIELDS");
  }
};


  return (
<main className="relative min-h-screen  bg-gray-100 text-gray-700 p-6">
  


      {/* === Header Bar === */}
      <div className="bg-white shadow-md rounded-md flex items-center justify-between px-6 py-3 mb-6">
        <div className="flex items-center gap-3">
          <img src="/NW18.png" alt="Network18" className="h-10" />
          <div>
            <h1 className="text-xl font-bold text-blue-800">
              Network 18 Event Report
            </h1>
            <div className="text-sm">
              {user.city && <p className="font-bold "> City: {user.city}</p>}
              <span className="font-semibold text-gray-700">
                {userLoading ? "Loading..." : user.name}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
			<button
			  onClick={() => {
				if (isreviewing) {
				  window.close();
				} else {
				  router.push("/home");
				}
			  }}
			  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
			>
			  ← Back
			</button>
        </div>
      </div>

      {/* === Filters Row (Days Counter + Created By) === */}
	  {!isreviewing && (
      <div className="flex gap-6 mb-6">
        <div className="flex flex-col items-start">
          <label className="block text-sm font-semibold mb-1">
            Days
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleDaysCounter(-1)}
              className="px-2 py-1 bg-gray-200 rounded-md"
            >
              -
            </button>
            <span className="px-3 ">{form.day}</span>
            <button
              type="button"
              onClick={() => handleDaysCounter(1)}
              className="px-2 py-1 bg-gray-200 rounded-md"
            >
              +
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold  mb-1">
            Created By
          </label>
          <input
            type="text"
            value={userLoading ? "Loading..." : user.name}
            readOnly
            className="border rounded-md px-3 py-2 w-40 bg-gray-100"
          />
        </div>
      </div>
	  )}
      {/* === Event Details Form === */}
     <div className="bg-white shadow-md rounded-md p-6 space-y-12">
  {/* ================= Event Details & Team Details Form ================= */}
  <div>
    <h2 className="text-center text-lg font-semibold mb-4">Event Details</h2>
    <hr className="mb-6" />

    <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
      {/* Event Name */}
      <div className="flex flex-col">
        <label className="text-sm font-semibold text-slate-800 mb-2">
          Event Name*
        </label>
        <input
          required
          type="text"
          name="eventName"
          value={form.eventName}
          onChange={handleChange}
          placeholder="Event Name"
          className="border border-gray-200 rounded-md px-4 py-2"
        />
      </div>

      {/* Date */}
      <div className="flex flex-col">
        <label className="text-sm font-semibold text-slate-800 mb-2">Date*</label>
		<input
		  required
		  type="date"
		  name="date"
		  value={form.date ? form.date.split("T")[0] : ""}  // <-- take only YYYY-MM-DD
		  onChange={handleChange}
		  className="border border-gray-200 rounded-md px-4 py-2"
		/>
      </div>

      {/* Channel */}
      <div className="flex flex-col">
        <label className="text-sm font-semibold text-slate-800 mb-2">Channel*</label>
        <select
          name="channel"
          required
          value={form.channel}
          onChange={handleChange}
          className="border border-gray-200 rounded-md px-4 py-2"
        >
          <option value="">Select Channel</option>
      {CHANNEL_OPTIONS.map((channel, index) => (
        <option key={index} value={channel}>
          {channel}
        </option>
      ))}
        </select>
      </div>

      {/* Broadcast Type */}
      <div className="flex flex-col">
        <label className="text-sm font-semibold text-slate-800 mb-2">Broadcast Type*</label>
        <select
          name="broadcastType"
          required
          value={form.broadcastType}
          onChange={handleChange}
          className="border border-gray-200 rounded-md px-4 py-2"
        >
          <option value="">Select Broadcast Type</option>
          <option value="Live">Live</option>
          <option value="Recorded">Recorded</option>
        </select>

        {form.broadcastType === "Live" && (
          <div className="flex gap-4 mt-2">
            {["Digital", "TV"].map((ch) => (
              <label key={ch} className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  name="broadcastChannel"
                  value={ch}
                  checked={form.broadcastChannel?.includes(ch) || false}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setForm((prev) => {
                      const prevChannels = prev.broadcastChannel || [];
                      const updated = checked
                        ? [...prevChannels, ch]
                        : prevChannels.filter((c) => c !== ch);
                      return { ...prev, broadcastChannel: updated };
                    });
                  }}
                />
                {ch}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Location */}
      <div className="flex flex-col">
        <label className="text-sm font-semibold text-gray-700 mb-2">
          Location/Hotel Name
        </label>
        <input
          type="text"
          name="location"
          value={form.location}
          onChange={handleChange}
          placeholder="Location/Hotel Name"
          className="border border-gray-200 rounded-md px-4 py-2"
        />
      </div>

      {/* City */}
      <div className="flex flex-col">
        <label className="text-sm font-semibold text-gray-700 mb-2">State/City</label>
        <input
          type="text"
          name="city"
          value={form.city}
          onChange={handleChange}
          placeholder="State/City"
          className="border border-gray-200 rounded-md px-4 py-2"
        />
      </div>

      {/* Setup Type */}
      <div className="md:col-span-2 ">
        <label className="text-sm font-semibold text-gray-700 mb-3 block">Setup Type</label>
        <div className="flex items-center gap-6">
          {["BNC", "TRIAX"].map((type) => (
            <label key={type} className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="setup"
                value={type}
                checked={form.setup === type}
                onChange={handleChange}
              />
              {type}
            </label>
          ))}
          <button
            type="button"
            onClick={clearSetup}
            className="px-3 py-1 rounded-md border border-red-200 bg-red-50 text-red-600 font-semibold"
          >
            Clear Selection
          </button>
        </div>
      </div>

      {/* Camera */}
      <div className="flex flex-col">
        <label className="text-sm font-semibold text-gray-700 mb-2">Camera</label>
        <input
          type="text"
          name="camera"
          value={form.camera}
          onChange={handleChange}
          placeholder="Camera"
          className="border border-gray-200 rounded-md px-4 py-2"
        />
      </div>

      {/* Jimmy Jib */}
      <div className="flex flex-col">
        <label className="text-sm font-semibold text-gray-700 mb-2">Jimmy Jib</label>
        <input
          type="text"
          name="jimmy"
          value={form.jimmy}
          onChange={handleChange}
          placeholder="Jimmy Jib"
          className="border border-gray-200 rounded-md px-4 py-2"
        />
      </div>

      {/* Show Type */}
      <div className="md:col-span-2 flex flex-col">
  <label className="text-sm font-semibold text-gray-700 mb-2">Show Type</label>
  <select
    name="showType"
    value={form.showType}
    onChange={handleChange}
    className="border border-gray-200 rounded-md px-4 py-2"
  >
    <option value="">Select Show Type</option>
    {SHOW_TYPE_OPTIONS.map((showType, index) => (
      <option key={index} value={showType}>
        {showType}
      </option>
    ))}
  </select>
</div>

      {/* Team Details */}
      <div className="md:col-span-2 bg-white shadow-md rounded-md p-6">
        <h2 className="text-center text-lg font-semibold mb-4">Team Details</h2>
        <hr className="mb-6" />

        {/* Event Engineer */}
        <div className="flex flex-col mb-6">
          <label className="text-sm font-semibold text-slate-800 mb-2">Event Engineer*</label>
			<input
			  type="text"
			  name="event_engineer"
			  placeholder="Name of Engineer"
			  value={form.event_engineer || ""}  // <-- controlled input
			  onChange={handleChange}
			  className="border border-gray-200 rounded-md px-3 py-2"
			/>
        </div>

        {/* Other Team Members */}
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { label: "Show Producer", name: "show_producer" },
            { label: "Show DOP", name: "show_dop" },
            { label: "Online Editor", name: "online_editor" },
            { label: "Electrical", name: "electrical" },
            { label: "Sound Engineer", name: "sound_engineer" },
            { label: "Production Control", name: "production_control" },
          ].map((member) => (
           <div key={member.name} className="flex flex-col">
		  <label className="text-sm font-semibold text-gray-700 mb-2">{member.label}</label>
		  <input
			type="text"
			name={member.name}
			placeholder={member.label}
			value={form[member.name] || ""}  // <-- get value from form object
			onChange={handleChange}
			className="border border-gray-200 rounded-md px-4 py-2"
		  />
		</div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="md:col-span-2 text-center mt-6">
      
      </div>
    </form>
  </div>
{/* ================= Setup Date and Timing Section ================= */}
<form 
  onSubmit={handleSubmit} 
  className="p-4 md:p-6 bg-white border rounded-lg shadow-sm mb-6"
  style={{ borderColor: '#e2e8f0' }}
>
  <h2
    className="text-xl md:text-2xl font-semibold mb-4 pb-2"
    style={{ color: '#2d3748', borderBottom: '2px solid #4299e1' }}
  >
    Setup Date and Timing
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {/* Setup Date */}
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-1">
        Setup Date
      </label>
      <input
        type="date"
        value={form.setupDate ? form.setupDate.split("T")[0] : ""}
        onChange={(e) => setForm({ ...form, setupDate: e.target.value })}
        className="p-3 border border-gray-300 rounded-lg w-full 
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      />
    </div>

    {/* Setup Start Time */}
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-1">
        Setup Start Time
      </label>
      <input
        type="time"
        value={form.setupStartTime}
        onChange={(e) => setForm({ ...form, setupStartTime: e.target.value })}
        className="p-3 border border-gray-300 rounded-lg w-full 
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      />
    </div>

    {/* Setup End Time */}
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-1">
        Setup End Time
      </label>
      <input
        type="time"
        value={form.setupEndTime}
        onChange={(e) => setForm({ ...form, setupEndTime: e.target.value })}
        className="p-3 border border-gray-300 rounded-lg w-full 
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      />
    </div>

    {/* Checking Done */}
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-1">
        Checking Done
      </label>
      <input
        type="time"
        value={form.checkingDone}
        onChange={(e) => setForm({ ...form, checkingDone: e.target.value })}
        placeholder="Checking Done"
        className="p-3 border border-gray-300 rounded-lg w-full 
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      />
    </div>
  </div>
</form>



<div>
  <h2 className="text-center text-lg font-semibold mb-4">Equipment</h2>
  <hr className="mb-6" />

  <div className="flex gap-2 mb-4">
    <select
      value={globalVendor}
      onChange={(e) => setGlobalVendor(e.target.value)}
      className="border border-gray-300 rounded-md px-2 py-1"
    >
      <option value="">Select Global Vendor</option>
      {vendors.map((vendor, index) => (
        <option key={index} value={vendor}>
          {vendor}
        </option>
      ))}
    </select>

    <button
      onClick={handleApplyGlobalVendor}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"
      disabled={!globalVendor}
    >
      Apply Global Vendor
    </button>
<button
  onClick={handleToggleAllHired}
  className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-700"
>
  Toggle All Hired
</button>
    <button
      onClick={handleResetVendors}
      className="bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700"
    >
      Reset
    </button>
	    <input
      type="text"
      placeholder="New Vendor"
      value={newVendor}
      onChange={(e) => setNewVendor(e.target.value)}
      className="border border-gray-300 rounded-md px-2 py-1"
    />
    <button
      onClick={handleAddVendor}
      className="bg-green-600 text-white px-3 py-1 rounded-lg shadow hover:bg-green-700"
      disabled={!newVendor.trim()}
    >
      + Add Vendor
    </button>
  </div>

  <table className="w-full border-collapse">
    <thead>
      <tr className="bg-gray-800 text-white">
        <th className="px-4 py-2 border">Sr.No.</th>
        <th className="px-4 py-2 border">Equipment</th>
        <th className="px-4 py-2 border">Model No.</th>
        <th className="px-4 py-2 border">Qty</th>
        <th className="px-4 py-2 border">Installation Time</th>
        <th className="px-4 py-2 border">Done Time</th>
        <th className="px-4 py-2 border">In-House</th>
        <th className="px-4 py-2 border">Hired</th>
        <th className="px-4 py-2 border">Vendor Name</th>
        <th className="px-4 py-2 border">Remarks</th>
        <th className="px-4 py-2 border">Status</th>
        <th className="px-4 py-2 border">Action</th>
      </tr>
    </thead>
    <tbody>
      {equipmentData.map((row, index) => (
        <tr key={index} className="border-t">
          <td className="px-4 py-2 border text-center">{index + 1}</td>
          <td className="px-4 py-2 border">
            <input
              type="text"
              placeholder="Equipment"
              className="border border-gray-300 rounded-md px-2 py-1 w-full"
              value={row.equipment}
              onChange={(e) => handleChangeEquipment(index, "equipment", e.target.value)}
            />
          </td>
          <td className="px-4 py-2 border">
            <input
              type="text"
              placeholder="Model No."
              className="border border-gray-300 rounded-md px-2 py-1 w-full"
              value={row.modelNo}
              onChange={(e) => handleChangeEquipment(index, "modelNo", e.target.value)}
            />
          </td>
          <td className="px-4 py-2 border">
            <input
              type="number"
              placeholder="Qty"
              className="border border-gray-300 rounded-md px-2 py-1 w-full"
              value={row.qty}
              onChange={(e) => handleChangeEquipment(index, "qty", e.target.value)}
            />
          </td>
          <td className="px-4 py-2 border">
            <input
              type="time"
              className="border border-gray-300 rounded-md px-2 py-1 w-full"
              value={row.installationTime}
              onChange={(e) => handleChangeEquipment(index, "installationTime", e.target.value)}
            />
          </td>
          <td className="px-4 py-2 border">
            <input
              type="time"
              className="border border-gray-300 rounded-md px-2 py-1 w-full"
              value={row.doneTime}
              onChange={(e) => handleChangeEquipment(index, "doneTime", e.target.value)}
            />
          </td>

          {/* In-House */}
          <td className="px-4 py-2 border text-center">
            <input
              type="checkbox"
              checked={row.inHouse}
              onChange={(e) => handleChangeEquipment(index, "inHouse", e.target.checked)}
            />
          </td>

          {/* Hired */}
          <td className="px-4 py-2 border text-center">
            <input
              type="checkbox"
              checked={row.hired}
              onChange={(e) => handleChangeEquipment(index, "hired", e.target.checked)}
            />
          </td>

          {/* Vendor Name (text input) */}
          <td className="px-4 py-2 border">
            <input
              type="text"
              placeholder="Vendor Name"
              className="border border-gray-300 rounded-md px-2 py-1 w-full"
              value={row.vendorName}
              disabled={!row.hired}
              onChange={(e) => handleChangeEquipment(index, "vendorName", e.target.value)}
            />
          </td>

          <td className="px-4 py-2 border">
            <input
              type="text"
              placeholder="Remarks"
              className="border border-gray-300 rounded-md px-2 py-1 w-full"
              value={row.remarks}
              onChange={(e) => handleChangeEquipment(index, "remarks", e.target.value)}
            />
          </td>
          <td className="px-4 py-2 border">
            <input
              type="text"
              placeholder="Status"
              className="border border-gray-300 rounded-md px-2 py-1 w-full"
              value={row.status}
              onChange={(e) => handleChangeEquipment(index, "status", e.target.value)}
            />
          </td>
          <td className="px-4 py-2 border text-center">
            {equipmentData.length > 19 && index > 18 && (
              <button
                onClick={() => {
                  const newData = [...equipmentData];
                  newData.splice(index, 1);
                  setEquipmentData(newData);
                }}
                className="text-red-600 hover:text-red-800"
              >
                🗑
              </button>
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </table>

  <div className="mt-4">
    <button
      onClick={addEquipmentRow}
      className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow hover:bg-slate-900"
    >
      + Add Equipment
    </button>
  </div>
</div>



  {/* ================= Live Source Table ================= */}
  <div>
    <h2 className="text-center text-lg font-semibold mb-4">Live Source</h2>
    <hr className="mb-6" />

      <table className="w-full border-collapse">
        <thead>
          <tr className=" bg-gray-800 text-white">
            <th className="px-4 py-2 border">Sr.No.</th>
            <th className="px-4 py-2 border">Name</th>
            <th className="px-4 py-2 border">Available</th>
            <th className="px-4 py-2 border">Type</th>
            <th className="px-4 py-2 border">Bandwidth (/mbps) </th>
            <th className="px-4 py-2 border">Note</th>
            <th className="px-4 py-2 border">Status</th>
          </tr>
        </thead>
        <tbody>
          {liveSourceData.map((row, index) => (
  <tr key={index} className="border-t">
    <td className="px-4 py-2 border text-center">{index + 1}</td>
    <td className="px-4 py-2 border">{row.name}</td>
    <td className="px-4 py-2 border">
      <select
        name="available"
        className="border border-gray-300 rounded-md px-2 py-1 w-full"
        value={row.available}
        onChange={(e) =>
          handleChangeLiveSource(index, "available", e.target.value)
        }
      >
        <option value="">Select</option>
        <option value="Yes">Yes</option>
        <option value="No">No</option>
      </select>
    </td>
    <td className="px-4 py-2 border">
      <select
        name="type"
        className="border border-gray-300 rounded-md px-2 py-1 w-full"
        value={row.type}
        onChange={(e) =>
          handleChangeLiveSource(index, "type", e.target.value)
        }
      >
        <option value="">Select</option>
        {row.name.toLowerCase() === "lan" ? (
          <>
            <option value="Mbps">Mbps</option>
            <option value="Gbps">Gbps</option>
          </>
        ) : (
          <>
            <option value="LiveU">LiveU</option>
            <option value="OB">OB</option>
          </>
        )}
      </select>
    </td>
    <td className="px-4 py-2 border">
      <input
        type="text"
        name="bandwidth"
        placeholder="Bandwidth"
        className="border border-gray-300 rounded-md px-2 py-1 w-full"
        value={row.bandwidth}
        onChange={(e) =>
          handleChangeLiveSource(index, "bandwidth", e.target.value)
        }
      />
    </td>
    <td className="px-4 py-2 border">
      <input
        type="text"
        name="note"
        placeholder="Enter Note"
        className="border border-gray-300 rounded-md px-2 py-1 w-full"
        value={row.note}
        onChange={(e) =>
          handleChangeLiveSource(index, "note", e.target.value)
        }
      />
    </td>
    <td className="px-4 py-2 border">
      <input
        type="text"
        name="status"
        placeholder="Status"
        className="border border-gray-300 rounded-md px-2 py-1 w-full"
        value={row.status}
        onChange={(e) =>
          handleChangeLiveSource(index, "status", e.target.value)
        }
      />
    </td>
  </tr>
))}
        </tbody>
      </table>
  </div>







  

  {/* ================= Electrical Power Source Table ================= */}
  <div>
    <h2 className="text-center text-lg font-semibold mb-4">Electrical Power Source</h2>
    <hr className="mb-6" />

      <table className="w-full border-collapse">
        <thead>
          <tr className=" bg-gray-800 text-white">
            <th className="px-4 py-2 border">Sr.No.</th>
            <th className="px-4 py-2 border">Source</th>
            <th className="px-4 py-2 border">Available</th>
            <th className="px-4 py-2 border">kVA</th>
            <th className="px-4 py-2 border">Enter Value</th>
            <th className="px-4 py-2 border">Note</th>
            <th className="px-4 py-2 border">Status</th>
          </tr>
        </thead>
        <tbody>
          {electricData.map((row, index) => (
            <tr key={index} className="border-t">
              <td className="px-4 py-2 border text-center">{index+1}</td>
              <td className="px-4 py-2 border">{row.source}</td>
              <td className="px-4 py-2 border">
                <select
                  name="available"
                  className="border border-gray-300 rounded-md px-2 py-1 w-full"
                  value={row.available}
                  onChange={(e) => handleChangepower(index, "available", e.target.value)}
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </td>
              <td className="px-4 py-2 border">
                <input
                  type="text"
                  name="kva"
                  placeholder="kVA"
                  className="border border-gray-300 rounded-md px-2 py-1 w-full"
                  value={row.kva}
                  onChange={(e) => handleChangepower(index, "kva", e.target.value)}
                />
              </td>
              <td className="px-4 py-2 border">
                <input
                  type="text"
                  name="value"
                  placeholder="Enter Value"
                  className="border border-gray-300 rounded-md px-2 py-1 w-full"
                  value={row.value}
                  onChange={(e) => handleChangepower(index, "value", e.target.value)}
                />
              </td>
              <td className="px-4 py-2 border">
                <input
                  type="text"
                  name="note"
                  placeholder="Note"
                  className="border border-gray-300 rounded-md px-2 py-1 w-full"
                  value={row.note}
                  onChange={(e) => handleChangepower(index, "note", e.target.value)}
                />
              </td>
              <td className="px-4 py-2 border">
                <input
                  type="text"
                  name="status"
                  placeholder="Status"
                  className="border border-gray-300 rounded-md px-2 py-1 w-full"
                  value={row.status}
                  onChange={(e) => handleChangepower(index, "status", e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
  </div>
</div>


      {/* === Dynamic Day Details Sections === */}
      {days.map((day, index) => (
        <div key={index} className="bg-white shadow-md rounded-md p-6 mt-6">
          <h2 className="text-center text-lg font-semibold mb-4">
            {`Day ${index + 1} Details`}
          </h2>
          <hr className="mb-6" />
          <div className="grid md:grid-cols-3 gap-6">
            {/* Date */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={day.date}
                onChange={(e) => handleDayChange(index, "date", e.target.value)}
                className="border border-gray-200 rounded-md px-4 py-2"
              />
            </div>

            {/* Checking Done */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">
                Checking Done
              </label>
              <input
                type="text"
                value={day.checkingDone}
                onChange={(e) =>
                  handleDayChange(index, "checkingDone", e.target.value)
                }
                placeholder="Checking Done"
                className="border border-gray-200 rounded-md px-4 py-2"
              />
            </div>

            {/* Feed Test Location */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">
                Feed Test Location
              </label>
              <input
                type="text"
                value={day.feedTestLocation}
                onChange={(e) =>
                  handleDayChange(index, "feedTestLocation", e.target.value)
                }
                placeholder="Feed Test Location"
                className="border border-gray-200 rounded-md px-4 py-2"
              />
            </div>

            {/* Feed Test Date */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">
                Feed Test Date
              </label>
              <input
                type="date"
                value={day.feedTestDate}
                onChange={(e) =>
                  handleDayChange(index, "feedTestDate", e.target.value)
                }
                className="border border-gray-200 rounded-md px-4 py-2"
              />
            </div>

            {/* Feed Test Time */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">
                Feed Test Time
              </label>
              <input
                type="time"
                value={day.feedTestTime}
                onChange={(e) =>
                  handleDayChange(index, "feedTestTime", e.target.value)
                }
                className="border border-gray-200 rounded-md px-4 py-2"
              />
            </div>

            {/* Event Start Time */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">
                Event Start Time
              </label>
              <input
                type="time"
                value={day.eventStartTime}
                onChange={(e) =>
                  handleDayChange(index, "eventStartTime", e.target.value)
                }
                className="border border-gray-200 rounded-md px-4 py-2"
              />
            </div>

            {/* Event End Time */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">
                Event End Time
              </label>
              <input
                type="time"
                value={day.eventEndTime}
                onChange={(e) =>
                  handleDayChange(index, "eventEndTime", e.target.value)
                }
                className="border border-gray-200 rounded-md px-4 py-2"
              />
            </div>

            {/* Event Duration */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">
                Event Duration
              </label>
              <input
                type="text"
                value={day.eventDuration}
                readOnly
                placeholder="Event Duration (auto-calculated)"
                className="border border-gray-200 rounded-md px-4 py-2 bg-gray-100"
              />
            </div>

            {/* Comments */}
            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-semibold text-gray-700 mb-2">
                Comments (Day {index + 1})
              </label>
              <textarea
                value={day.comments}
                onChange={(e) =>
                  handleDayChange(index, "comments", e.target.value)
                }
                placeholder={`Event Engineer Comments & Remarks (Day ${
                  index + 1
                })`}
                className="border border-gray-200 rounded-md px-4 py-2 resize-none"
                rows={3}
              />
            </div>

            {/* Comment Color */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">
                Comment Color
              </label>
              <select
                value={day.commentColor}
                onChange={(e) =>
                  handleDayChange(index, "commentColor", e.target.value)
                }
                className="border border-gray-200 rounded-md px-4 py-2"
              >
                <option value="Black">Black</option>
                <option value="Red">Red</option>
                <option value="Blue">Blue</option>
                <option value="Green">Green</option>
              </select>
              <div
                className="w-6 h-6 mt-1 rounded border"
                style={{ backgroundColor: day.commentColor }}
              />
            </div>

            {/* Signature */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">
                Signature
              </label>
              <input
                type="text"
                value={day.signature}
                onChange={(e) =>
                  handleDayChange(index, "signature", e.target.value)
                }
                placeholder="Signature"
                className="border border-gray-200 rounded-md px-4 py-2"
              />
            </div>

            {/* Signature Date */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={day.signatureDate}
                onChange={(e) =>
                  handleDayChange(index, "signatureDate", e.target.value)
                }
                className="border border-gray-200 rounded-md px-4 py-2"
              />
            </div>
          </div>         
        </div>
      ))}

      {/* === Submit / PDF / Excel Buttons at the Bottom === */}
      <div className="flex gap-3 justify-center mt-6">
		  {!isreviewing && (
			<button
			  type="submit"
			  onClick={handleSubmit}
			  className="px-6 py-2  bg-blue-500 text-white rounded-md hover:bg-blue-600"
			>
			  Submit Report and Generate PDF
			</button>
		  )}
{isreviewing && (
<button
  className="px-4 py-2  bg-blue-500 text-white rounded-md hover:bg-blue-600"
  onClick={handleGeneratePDF} // <-- add this
>
  Generate PDF
</button>
)}

<button
  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
  onClick={handleGenerateExcel}
>
  Generate Excel
</button>
      </div>
    </main>
  );
}
