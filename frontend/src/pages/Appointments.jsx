import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function Appointments() {
  const { token } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState("upcoming");
  const [appointments, setAppointments] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    familyMember: "",
    doctor: "",
    specialty: "",
    date: "",
    time: "",
    type: "Consultation",
    duration: 30,
    location: "",
    notes: "",
    sendReminder: false,
  });

  useEffect(() => {
    fetchAppointments();
    fetchFamilyMembers();
  }, [token]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/appointments/get", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
      }

      const data = await response.json();
      setAppointments(data);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFamilyMembers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/family/get", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFamilyMembers(data);
      }
    } catch (err) {
      console.error("Failed to fetch family members:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const payload = {
        ...formData,
        date: new Date(formData.date),
      };

      // Remove familyMember if empty
      if (!formData.familyMember) {
        delete payload.familyMember;
      }

      const response = await fetch("http://localhost:5000/api/appointments/add", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add appointment");
      }

      const newAppointment = await response.json();
      setAppointments([...appointments, newAppointment]);
      setShowAddForm(false);
      
      // Reset form
      setFormData({
        familyMember: "",
        doctor: "",
        specialty: "",
        date: "",
        time: "",
        type: "Consultation",
        duration: 30,
        location: "",
        notes: "",
        sendReminder: false,
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const upcomingAppointments = appointments.filter(
    apt => apt.status !== "completed" && apt.status !== "cancelled"
  );
  const pastAppointments = appointments.filter(
    apt => apt.status === "completed" || apt.status === "cancelled"
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Appointments</h1>
          <p className="text-zinc-500">Manage family doctor appointments and checkups</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-slate-800 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-700 transition-colors"
        >
          + Schedule Appointment
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* View Toggle */}
      <div className="flex gap-1 bg-zinc-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setViewMode("upcoming")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === "upcoming" 
              ? "bg-white text-zinc-900 shadow-sm" 
              : "text-zinc-500 hover:text-zinc-900"
          }`}
        >
          Upcoming ({upcomingAppointments.length})
        </button>
        <button
          onClick={() => setViewMode("past")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === "past" 
              ? "bg-white text-zinc-900 shadow-sm" 
              : "text-zinc-500 hover:text-zinc-900"
          }`}
        >
          Past ({pastAppointments.length})
        </button>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-slate-800 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-zinc-600">Loading appointments...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {(viewMode === "upcoming" ? upcomingAppointments : pastAppointments).length === 0 ? (
            <div className="text-center py-12 bg-zinc-50 rounded-xl border-2 border-dashed border-zinc-300">
              <div className="w-16 h-16 bg-zinc-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📅</span>
              </div>
              <h4 className="text-lg font-semibold text-zinc-700 mb-2">
                No {viewMode === "upcoming" ? "Upcoming" : "Past"} Appointments
              </h4>
              <p className="text-zinc-500 mb-4">
                {viewMode === "upcoming" 
                  ? "You don't have any upcoming appointments scheduled."
                  : "No past appointments to display."}
              </p>
              {viewMode === "upcoming" && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="btn-primary px-6 py-3 rounded-xl"
                >
                  Schedule First Appointment
                </button>
              )}
            </div>
          ) : (
            (viewMode === "upcoming" ? upcomingAppointments : pastAppointments).map((appointment) => (
              <div key={appointment._id} className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-slate-800 text-white rounded-full flex items-center justify-center font-medium">
                        {appointment.doctor.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-zinc-900">{appointment.doctor}</h3>
                        <p className="text-zinc-500">{appointment.specialty || appointment.type}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-lg text-sm font-medium ${
                        appointment.status === "confirmed" ? "bg-green-100 text-green-700" :
                        appointment.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                        appointment.status === "completed" ? "bg-blue-100 text-blue-700" :
                        "bg-zinc-100 text-zinc-700"
                      }`}>
                        {appointment.status}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <span className="text-zinc-500 block">Patient</span>
                        <span className="text-zinc-900 font-medium">
                          {appointment.familyMember?.name || "You"}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Date</span>
                        <span className="text-zinc-900 font-medium">
                          {formatDate(appointment.date)}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Time</span>
                        <span className="text-zinc-900 font-medium">{appointment.time}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Type</span>
                        <span className="text-zinc-900 font-medium">{appointment.type}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Location</span>
                        <span className="text-zinc-900 font-medium">
                          {appointment.location || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button className="bg-slate-100 text-zinc-900 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
                      Reschedule
                    </button>
                    <button className="bg-slate-800 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors">
                      View Details
                    </button>
                    <button className="text-zinc-400 hover:text-zinc-600 p-2">
                      ⋯
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Appointment Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-zinc-900">Schedule New Appointment</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-zinc-400 hover:text-zinc-600 p-2"
              >
                ✕
              </button>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Family Member (Optional)</label>
                <select
                  name="familyMember"
                  value={formData.familyMember}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                >
                  <option value="">Select family member (leave empty for yourself)</option>
                  {familyMembers.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name} ({member.relationship})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Doctor Name</label>
                  <input 
                    type="text"
                    name="doctor"
                    value={formData.doctor}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                    placeholder="Dr. John Smith"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Specialty</label>
                  <input 
                    type="text"
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                    placeholder="Cardiologist, Neurologist, etc."
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Date</label>
                  <input 
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Time</label>
                  <input 
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Appointment Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                  >
                    <option value="Check-up">Check-up</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Consultation">Consultation</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Procedure">Procedure</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Duration (minutes)</label>
                  <input 
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                    placeholder="30"
                    min="15"
                    step="15"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Location/Clinic</label>
                <input 
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                  placeholder="Clinic name and address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Notes (Optional)</label>
                <textarea 
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                  rows="3"
                  placeholder="Reason for visit, symptoms, or special instructions..."
                ></textarea>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox"
                  id="sendReminder"
                  name="sendReminder"
                  checked={formData.sendReminder}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-slate-800 border-zinc-300 rounded focus:ring-slate-800"
                />
                <label htmlFor="sendReminder" className="text-sm text-zinc-700">
                  Send reminder notifications
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-slate-100 text-zinc-900 py-3 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-slate-800 text-white py-3 rounded-lg font-medium hover:bg-slate-700 transition-colors"
                >
                  Schedule Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
