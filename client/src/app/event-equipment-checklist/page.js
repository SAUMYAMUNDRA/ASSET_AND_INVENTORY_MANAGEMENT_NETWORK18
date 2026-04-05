"use client";

import React, { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Enhanced Event Equipment Checklist with improved UI and PDF formatting
 */

export default function Page() {
  // --- form state ---
  const [form, setForm] = useState({
    eventName: "",
    location: "",
    date: "",
    show: "",
    uplinkRecording: "",
    downlink: "",
    setupType: "",
    // PGM
    pgmTestingLocation: "",
    pgmTestingTime: "",
    pgmEnggName: "",
    pgmFeedRoom: "",
    mainPgm: "",
    backupPgm: "",
    longshotCamera: "",
    downlinkType: "",
    downlinkTestingLocation: "",
    downlinkTestingTime: "",
    downlinkEnggName: "",
    downlinkFeedRoom: "",
    // Phone/LAN
    phoneLineAvailable: "",
    phoneQty: "",
    phoneTestingTime: "",
    lanMainLive: { available: false, bandwidth: "" },
    lanBackupLive: { available: false, bandwidth: "" },
    lanLongshot: { available: false, bandwidth: "" },
    lanDownlink: { available: false, bandwidth: "" },
    // Gensets / UPS
    gensets: {
      electronicsMain: { available: false, kva: "" },
      electronicsBackup: { available: false, kva: "" },
      lightsMain: { available: false, kva: "" },
      lightsBackup: { available: false, kva: "" },
      ats: { available: false, kva: "" },
    },
    ups: {
      broadcastEquipment: { available: false, kva: "" },
      watchout: { available: false, kva: "" },
      sound: { available: false, kva: "" },
      micsEps: { available: false, kva: "" },
      ledWall: { available: false, kva: "" },
      lights: { available: false, kva: "" },
    },
    errorsFeedback: "",
    submittedBy: "",
    submittedDate: "",
    submittedDateTime: "",
  });

  // Equipment list
  const initialEquipment = [
    { id: "camera_chain", label: "Camera Chain" },
    { id: "rcp", label: "RCP" },
    { id: "ccu", label: "CCU" },
    { id: "tripod", label: "Tripod" },
    { id: "lenses", label: "Lenses" },
    { id: "camera_tb", label: "Camera TB" },
    { id: "switcher_main", label: "Switcher Main" },
    { id: "switcher_backup", label: "Switcher Backup" },
    { id: "switcher_main_mux", label: "Switcher Main Mux VDA -O/P" },
    { id: "switcher_backup_mux", label: "Switcher Backup Mux VDA -O/P" },
    { id: "main_mux_monitoring", label: "Main Mux Monitoring" },
    { id: "backup_mux_monitoring", label: "Backup Mux Monitoring" },
    { id: "main_source_lipsync", label: "Main Source Lip Sync" },
    { id: "backup_source_lipsync", label: "Backup Source Lip Sync" },
    { id: "all_source_both_switchers", label: "All Source on Both Switchers" },
    { id: "vtr_rec_format", label: "VTR REC, and Format" },
    { id: "multiviewer_src", label: "Multiviewer SRC and Naming" },
    { id: "audio_face", label: "Audio Face in Vectorscop" },
    { id: "main_audio_mixer", label: "Main Audio Mixer I/P" },
    { id: "backup_audio_mixer", label: "Backup Audio Mixer I/P" },
    { id: "main_line_out_audio", label: "Main Line out Audio Mixer I/P" },
    { id: "backup_line_out_audio", label: "Backup Line out Audio Mixer I/P" },
    { id: "anchor_eps", label: "Anchor EPs" },
    { id: "main_vmix_on_switcher", label: "Main Vmix on Switcher" },
    { id: "backup_vmix_on_switcher", label: "Backup Vmix on Switcher" },
    { id: "main_watchout_on_switcher", label: "Main Watchout on Switcher" },
    { id: "backup_watchout_on_switcher", label: "Backup Watchout on Switcher" },
    { id: "rts_all_panels", label: "RTS All Panels & Beltpacks" },
    { id: "camera_back_focus", label: "Camera Back Focus" },
    { id: "pfl_speaker", label: "PFL Speaker" },
    { id: "table_lamp", label: "Table Lamp" },
  ];

  const [equipment, setEquipment] = useState(
    initialEquipment.map((it) => ({ ...it, maker: "", time: "", checker: "", status: "", notes: "" }))
  );

  // helpers
  function updateForm(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateNested(path, value) {
    const keys = path.split(".");
    setForm((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      let cur = copy;
      for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
      cur[keys[keys.length - 1]] = value;
      return copy;
    });
  }

function updateEquipmentItem(id, payload) {
  setEquipment((prev) =>
    prev.map((it) =>
      it.id === id ? { ...it, ...payload } : it // only re-render the changed item
    )
  );
}

  // --- Enhanced PDF generation ---
  async function loadImageDataURL(path) {
    try {
      const res = await fetch(path);
      if (!res.ok) return null;
      const blob = await res.blob();
      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error("loadImageDataURL error", err);
      return null;
    }
  }

  async function generatePdf() {
    const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginLeft = 50;
    const marginRight = 50;
    const usableWidth = pageWidth - marginLeft - marginRight;
    let cursorY = 60;

    // Add header with image and title
    const img = await loadImageDataURL("/NW18.png");
    if (img) {
      try {
        const imgProps = doc.getImageProperties(img);
        const imgWidth = 100;
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
        doc.addImage(img, "PNG", marginLeft, cursorY, imgWidth, imgHeight);
      } catch (e) {
        console.warn("addImage failed", e);
      }
    }

    // Title and date on the right side
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Event Equipment Checklist", pageWidth - marginRight, cursorY + 15, { align: "right" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const currentDate = new Date().toLocaleDateString();
    doc.text(`Generated: ${currentDate}`, pageWidth - marginRight, cursorY + 35, { align: "right" });
    
    cursorY += 80;

    // Event Details Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Event Details", marginLeft, cursorY);
    cursorY += 20;

    // Create a styled box for event details
    doc.setDrawColor(200);
    doc.setLineWidth(1);
    doc.rect(marginLeft, cursorY - 5, usableWidth, 120);
    
    doc.setFillColor(248, 249, 250);
    doc.rect(marginLeft, cursorY - 5, usableWidth, 120, 'F');

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const leftColX = marginLeft + 15;
    const rightColX = marginLeft + usableWidth/2 + 15;
    
    const leftDetails = [
      ["Event Name:", form.eventName || "N/A"],
      ["Location:", form.location || "N/A"],
      ["Date:", form.date || "N/A"],
      ["Show Type:", form.show || "N/A"],
    ];
    
    const rightDetails = [
      ["Uplink/Rec", form.uplinkRecording || "N/A"],
      ["Downlink:", form.downlink || "N/A"],
      ["Setup Type:", form.setupType || "N/A"],
    ];

    let detailY = cursorY + 15;
    leftDetails.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold");
      doc.text(label, leftColX, detailY);
      doc.setFont("helvetica", "normal");
      doc.text(String(value), leftColX + 80, detailY);
      detailY += 16;
    });

    detailY = cursorY + 15;
    rightDetails.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold");
      doc.text(label, rightColX, detailY);
      doc.setFont("helvetica", "normal");
      doc.text(String(value), rightColX + 80, detailY);
      detailY += 16;
    });

    cursorY += 140;

    // Equipment Table Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Equipment Checklist", marginLeft, cursorY);
    cursorY += 20;

    // Enhanced equipment table
    autoTable(doc, {
      startY: cursorY,
      head: [["Equipment", "Maker", "Time", "Checker", "Status", "Notes"]],
      body: equipment.map((e) => [
        e.label || "", 
        e.maker || "", 
        e.time || "", 
        e.checker || "", 
        e.status || "", 
        e.notes || ""
      ]),
      theme: "striped",
      headStyles: { 
        fillColor: [66, 139, 202],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: { 
        fontSize: 9,
        cellPadding: 4
      },
      alternateRowStyles: { 
        fillColor: [248, 249, 250] 
      },
      styles: {
        lineColor: [200, 200, 200],
        lineWidth: 0.5,
      },
      columnStyles: {
        0: { cellWidth: 120 }, // Equipment name
        1: { cellWidth: 70 },  // Maker
        2: { cellWidth: 50 },  // Time
        3: { cellWidth: 70 },  // Checker
        4: { cellWidth: 60 },  // Status
        5: { cellWidth: 'auto' } // Notes
      },
      margin: { left: marginLeft, right: marginRight },
    });

    let finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 30 : 500;

    // Check if we need a new page
    if (finalY > 650) {
      doc.addPage();
      finalY = 60;
    }

    // PGM / Downlink Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("PGM / Downlink Tests", marginLeft, finalY);
    finalY += 20;

    // Create sections with better formatting
    const sections = [
      {
        title: "PGM Details",
        data: [
          ["Testing Location", form.pgmTestingLocation],
          ["Testing Time", form.pgmTestingTime],
          ["Engineer Name", form.pgmEnggName],
          ["Feed Room", form.pgmFeedRoom],
          ["Main PGM", form.mainPgm],
          ["Backup PGM", form.backupPgm],
          ["Longshot Camera", form.longshotCamera],
        ]
      },
      {
        title: "Downlink Details", 
        data: [
          ["Type", form.downlinkType],
          ["Testing Location", form.downlinkTestingLocation],
          ["Testing Time", form.downlinkTestingTime],
          ["Engineer Name", form.downlinkEnggName],
          ["Feed Room", form.downlinkFeedRoom],
        ]
      }
    ];

    sections.forEach(section => {
      if (finalY > 700) {
        doc.addPage();
        finalY = 60;
      }

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(section.title, marginLeft, finalY);
      finalY += 15;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      section.data.forEach(([label, value]) => {
        if (finalY > 750) {
          doc.addPage();
          finalY = 60;
        }
        doc.text(`${label}: ${value || "N/A"}`, marginLeft + 10, finalY);
        finalY += 14;
      });
      finalY += 10;
    });

    // Phone & LAN Section
    if (finalY > 650) {
      doc.addPage();
      finalY = 60;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Phone & LAN", marginLeft, finalY);
    finalY += 15;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const phoneData = [
      ["Phone Line Available", form.phoneLineAvailable],
      ["Phone Quantity", form.phoneQty],
      ["Phone Testing Time", form.phoneTestingTime],
    ];

    phoneData.forEach(([label, value]) => {
      doc.text(`${label}: ${value || "N/A"}`, marginLeft + 10, finalY);
      finalY += 12;
    });

    finalY += 8;
    doc.text("LAN Connections:", marginLeft + 10, finalY);
    finalY += 12;

    const lanItems = [
      ["Main LiveU", form.lanMainLive],
      ["Backup LiveU", form.lanBackupLive], 
      ["Longshot Camera", form.lanLongshot],
      ["Downlink", form.lanDownlink],
    ];

    lanItems.forEach(([name, config]) => {
      const status = config.available ? "Available" : "Not Available";
      const bandwidth = config.bandwidth ? ` (${config.bandwidth} Mbps)` : "";
      doc.text(`  • ${name}: ${status}${bandwidth}`, marginLeft + 20, finalY);
      finalY += 12;
    });

    // Power Systems Section
    finalY += 15;
    if (finalY > 650) {
      doc.addPage();
      finalY = 60;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Power Systems", marginLeft, finalY);
    finalY += 15;

    // Gensets
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Gensets:", marginLeft + 10, finalY);
    finalY += 12;

    doc.setFont("helvetica", "normal");
    Object.entries(form.gensets).forEach(([key, value]) => {
      const name = key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase());
      const status = value.available ? "Available" : "Not Available";
      const kva = value.kva ? ` (${value.kva} kVA)` : "";
      doc.text(`  • ${name}: ${status}${kva}`, marginLeft + 20, finalY);
      finalY += 12;
    });

    finalY += 8;
    doc.setFont("helvetica", "bold");
    doc.text("UPS Systems:", marginLeft + 10, finalY);
    finalY += 12;

    doc.setFont("helvetica", "normal");
    Object.entries(form.ups).forEach(([key, value]) => {
      const name = key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase());
      const status = value.available ? "Available" : "Not Available";
      const kva = value.kva ? ` (${value.kva} kVA)` : "";
      doc.text(`  • ${name}: ${status}${kva}`, marginLeft + 20, finalY);
      finalY += 12;
    });

    // Feedback Section
    finalY += 20;
    if (finalY > 650) {
      doc.addPage();
      finalY = 60;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Errors and Feedback", marginLeft, finalY);
    finalY += 15;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const feedback = form.errorsFeedback || "None";
    const splitFeedback = doc.splitTextToSize(feedback, usableWidth - 20);
    doc.text(splitFeedback, marginLeft + 10, finalY);
    finalY += splitFeedback.length * 12 + 20;

    // Signature Section
    if (finalY > 700) {
      doc.addPage();
      finalY = 60;
    }

    doc.setDrawColor(100);
    doc.line(marginLeft, finalY, pageWidth - marginRight, finalY);
    finalY += 20;

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Submitted By:", marginLeft, finalY);
    doc.text("Date:", marginLeft + 250, finalY);
    finalY += 16;

    doc.setFont("helvetica", "normal");
    doc.text(form.submittedBy || "_________________", marginLeft, finalY);
    doc.text(form.submittedDate || "_________________", marginLeft + 250, finalY);
    finalY += 20;

    doc.text(`DateTime: ${form.submittedDateTime || "_________________"}`, marginLeft, finalY);

    doc.save("event-equipment-checklist.pdf");
  }

  // --- Enhanced UI Components ---
 function EquipmentRow({ item, onCommit }) {
  const [localItem, setLocalItem] = React.useState(item);

  // keep local in sync if parent item changes
  React.useEffect(() => {
    setLocalItem(item);
  }, [item]);

  const handleChange = (field, value) => {
    setLocalItem((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = () => {
    onCommit(localItem.id, localItem);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900">{localItem.label}</h4>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{localItem.id}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Maker</label>
          <input
            placeholder="Equipment maker"
            value={localItem.maker}
            onChange={(e) => handleChange("maker", e.target.value)}
            onBlur={handleBlur}
            className="w-full rounded-md border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Time</label>
          <input
            placeholder="HH:MM"
            value={localItem.time}
            onChange={(e) => handleChange("time", e.target.value)}
            onBlur={handleBlur}
            className="w-full rounded-md border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Checker</label>
          <input
            placeholder="Name"
            value={localItem.checker}
            onChange={(e) => handleChange("checker", e.target.value)}
            onBlur={handleBlur}
            className="w-full rounded-md border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
          <select
            value={localItem.status}
            onChange={(e) => handleChange("status", e.target.value)}
            onBlur={handleBlur}
            className="w-full rounded-md border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Status</option>
            <option value="OKAY">✅ OKAY</option>
            <option value="Not Working">❌ Not Working</option>
            <option value="NA">➖ N/A</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
        <input
          placeholder="Additional notes or observations"
          value={localItem.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          onBlur={handleBlur}
          className="w-full rounded-md border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );
}
  // --- Enhanced Main UI ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
		<div className="pt-0 ">
  <img
    src="/NW18.png"
    alt="Network18 Logo"
    className="h-16 mt-5"
  />
</div>
          <h1 className="text-3xl font-bold text-gray-900">📋 Event Equipment Checklist</h1>
          
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Event Details Section */}
        <section className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <span className="mr-2">🎬</span> Event Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Name *</label>
              <input
                className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={form.eventName}
                onChange={(e) => updateForm("eventName", e.target.value)}
                placeholder="Enter event name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
              <input
                className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={form.location}
                onChange={(e) => updateForm("location", e.target.value)}
                placeholder="Event venue/location"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
              <input
                type="date"
                className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={form.date}
                onChange={(e) => updateForm("date", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Show Type *</label>
              <select
                className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={form.show}
                onChange={(e) => updateForm("show", e.target.value)}
              >
                <option value="">Select show type</option>
                <option value="Live">📡 Live Broadcast</option>
                <option value="Recording">🎥 Recording</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Uplink/Recording</label>
              <select
                value={form.uplinkRecording}
                onChange={(e) => updateForm("uplinkRecording", e.target.value)}
                className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select quality</option>
                <option value="HD">HD (1080p)</option>
                <option value="4K">4K Ultra HD</option>
                <option value="NA">N/A</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Downlink</label>
              <select
                value={form.downlink}
                onChange={(e) => updateForm("downlink", e.target.value)}
                className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select quality</option>
                <option value="HD">HD (1080p)</option>
                <option value="NA">N/A</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Setup Type</label>
            <select
              value={form.setupType}
              onChange={(e) => updateForm("setupType", e.target.value)}
              className="w-full md:w-1/2 rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select setup type</option>
              <option value="Triax">🔌 Triax Setup</option>
              <option value="BNC">📺 BNC Setup</option>
            </select>
          </div>
        </section>

        {/* Equipment Section */}
        <section className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <span className="mr-2">🎛️</span> Equipment Checklist
            <span className="ml-auto text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {equipment.filter(e => e.status === 'OKAY').length}/{equipment.length} Complete
            </span>
          </h2>

          <div className="space-y-4">
{equipment.map((item) => (
  <EquipmentRow key={item.id} item={item} onCommit={updateEquipmentItem} />
))}
          </div>
        </section>

        {/* PGM/Downlink Tests */}
        <section className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <span className="mr-2">📡</span> PGM / Downlink Tests
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 border-b pb-2">PGM Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Testing Location</label>
                  <input
                    value={form.pgmTestingLocation}
                    onChange={(e) => updateForm("pgmTestingLocation", e.target.value)}
                    className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Control room, venue, etc."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Engineer Name</label>
                    <input
                      value={form.pgmEnggName}
                      onChange={(e) => updateForm("pgmEnggName", e.target.value)}
                      className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Engineer name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Feed Room</label>
                  <input
                    value={form.pgmFeedRoom}
                    onChange={(e) => updateForm("pgmFeedRoom", e.target.value)}
                    className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Feed room details"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Main PGM</label>
                    <input
                      value={form.mainPgm}
                      onChange={(e) => updateForm("mainPgm", e.target.value)}
                      className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Main program feed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Backup PGM</label>
                    <input
                      value={form.backupPgm}
                      onChange={(e) => updateForm("backupPgm", e.target.value)}
                      className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Backup program feed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Longshot Camera</label>
                  <input
                    value={form.longshotCamera}
                    onChange={(e) => updateForm("longshotCamera", e.target.value)}
                    className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Longshot camera details"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 border-b pb-2">Downlink Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Downlink Type</label>
                  <input
                    value={form.downlinkType}
                    onChange={(e) => updateForm("downlinkType", e.target.value)}
                    className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="LiveU / OB / Zoom / Other / NA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Testing Location</label>
                  <input
                    value={form.downlinkTestingLocation}
                    onChange={(e) => updateForm("downlinkTestingLocation", e.target.value)}
                    className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Testing location"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Testing Time</label>
                    <input
                      type="time"
                      value={form.downlinkTestingTime}
                      onChange={(e) => updateForm("downlinkTestingTime", e.target.value)}
                      className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Engineer Name</label>
                    <input
                      value={form.downlinkEnggName}
                      onChange={(e) => updateForm("downlinkEnggName", e.target.value)}
                      className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Engineer name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Feed Room</label>
                  <input
                    value={form.downlinkFeedRoom}
                    onChange={(e) => updateForm("downlinkFeedRoom", e.target.value)}
                    className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Feed room details"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Phone & LAN */}
        <section className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <span className="mr-2">📞</span> Phone & Network
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 border-b pb-2">Phone System</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Line Available?</label>
                  <select
                    value={form.phoneLineAvailable}
                    onChange={(e) => updateForm("phoneLineAvailable", e.target.value)}
                    className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select availability</option>
                    <option value="Yes">✅ Yes</option>
                    <option value="No">❌ No</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                    <input
                      type="number"
                      value={form.phoneQty}
                      onChange={(e) => updateForm("phoneQty", e.target.value)}
                      className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Number of lines"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Testing Time</label>
                    <input
                      type="time"
                      value={form.phoneTestingTime}
                      onChange={(e) => updateForm("phoneTestingTime", e.target.value)}
                      className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 border-b pb-2">LAN Connections</h3>
              <div className="space-y-3">
                {[
                  { key: 'lanMainLive', label: 'Main LiveU' },
                  { key: 'lanBackupLive', label: 'Backup LiveU' },
                  { key: 'lanLongshot', label: 'Longshot Camera' },
                  { key: 'lanDownlink', label: 'Downlink' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <label className="flex items-center gap-2 min-w-0 flex-1">
                      <input
                        type="checkbox"
                        checked={form[key].available}
                        onChange={(e) => updateNested(`${key}.available`, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-medium text-gray-700">{label}</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        placeholder="Bandwidth"
                        value={form[key].bandwidth}
                        onChange={(e) => updateNested(`${key}.bandwidth`, e.target.value)}
                        className="w-24 rounded-md border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={!form[key].available}
                      />
                      <span className="text-sm text-gray-500">Mbps</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Power Systems */}
        <section className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <span className="mr-2">⚡</span> Power Systems
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 border-b pb-2 flex items-center">
                <span className="mr-2">🔋</span> Gensets
              </h3>
              <div className="space-y-3">
                {Object.keys(form.gensets).map((key) => {
                  const displayName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                  return (
                    <div key={key} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <label className="flex items-center gap-2 min-w-0 flex-1">
                        <input
                          type="checkbox"
                          checked={form.gensets[key].available}
                          onChange={(e) => updateNested(`gensets.${key}.available`, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-medium text-gray-700">{displayName}</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          placeholder="Capacity"
                          value={form.gensets[key].kva}
                          onChange={(e) => updateNested(`gensets.${key}.kva`, e.target.value)}
                          className="w-24 rounded-md border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={!form.gensets[key].available}
                        />
                        <span className="text-sm text-gray-500">kVA</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 border-b pb-2 flex items-center">
                <span className="mr-2">🔌</span> UPS Systems
              </h3>
              <div className="space-y-3">
                {Object.keys(form.ups).map((key) => {
                  const displayName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                  return (
                    <div key={key} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <label className="flex items-center gap-2 min-w-0 flex-1">
                        <input
                          type="checkbox"
                          checked={form.ups[key].available}
                          onChange={(e) => updateNested(`ups.${key}.available`, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-medium text-gray-700">{displayName}</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          placeholder="Capacity"
                          value={form.ups[key].kva}
                          onChange={(e) => updateNested(`ups.${key}.kva`, e.target.value)}
                          className="w-24 rounded-md border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={!form.ups[key].available}
                        />
                        <span className="text-sm text-gray-500">kVA</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Feedback & Submission */}
        <section className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <span className="mr-2">📝</span> Feedback & Submission
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Errors and Feedback</label>
              <textarea
                rows={4}
                value={form.errorsFeedback}
                onChange={(e) => updateForm("errorsFeedback", e.target.value)}
                className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Please describe any issues, errors, or additional feedback..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Submitted By</label>
                <input
                  value={form.submittedBy}
                  onChange={(e) => updateForm("submittedBy", e.target.value)}
                  className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={form.submittedDate}
                  onChange={(e) => updateForm("submittedDate", e.target.value)}
                  className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date & Time</label>
                <input
                  type="datetime-local"
                  value={form.submittedDateTime}
                  onChange={(e) => updateForm("submittedDateTime", e.target.value)}
                  className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={generatePdf} 
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <span>📄</span> Generate PDF Report
          </button>

          <button
            onClick={() => {
              if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
                setForm({
                  eventName: "",
                  location: "",
                  date: "",
                  show: "",
                  uplinkRecording: "",
                  downlink: "",
                  setupType: "",
                  pgmTestingLocation: "",
                  pgmTestingTime: "",
                  pgmEnggName: "",
                  pgmFeedRoom: "",
                  mainPgm: "",
                  backupPgm: "",
                  longshotCamera: "",
                  downlinkType: "",
                  downlinkTestingLocation: "",
                  downlinkTestingTime: "",
                  downlinkEnggName: "",
                  downlinkFeedRoom: "",
                  phoneLineAvailable: "",
                  phoneQty: "",
                  phoneTestingTime: "",
                  lanMainLive: { available: false, bandwidth: "" },
                  lanBackupLive: { available: false, bandwidth: "" },
                  lanLongshot: { available: false, bandwidth: "" },
                  lanDownlink: { available: false, bandwidth: "" },
                  gensets: {
                    electronicsMain: { available: false, kva: "" },
                    electronicsBackup: { available: false, kva: "" },
                    lightsMain: { available: false, kva: "" },
                    lightsBackup: { available: false, kva: "" },
                    ats: { available: false, kva: "" },
                  },
                  ups: {
                    broadcastEquipment: { available: false, kva: "" },
                    watchout: { available: false, kva: "" },
                    sound: { available: false, kva: "" },
                    micsEps: { available: false, kva: "" },
                    ledWall: { available: false, kva: "" },
                    lights: { available: false, kva: "" },
                  },
                  errorsFeedback: "",
                  submittedBy: "",
                  submittedDate: "",
                  submittedDateTime: "",
                });
                setEquipment(initialEquipment.map((it) => ({ ...it, maker: "", time: "", checker: "", status: "", notes: "" })));
              }
            }}
            className="sm:w-auto bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span>🗑️</span> Clear All Data
          </button>
        </div>

       
      </main>
    </div>
  );
}