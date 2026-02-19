import {
  Activity,
  Pill,
  CheckCircle2,
  Clock,
  Stethoscope,
  Users,
  Calendar,
  Plus
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AddMedicineModal from "../components/AddMedicineModal";
import AddFamilyMemberModal from "../components/AddFamilyMemberModal";

export default function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [isAddMedicineModalOpen, setIsAddMedicineModalOpen] = useState(false);
  const [isAddFamilyMemberModalOpen, setIsAddFamilyMemberModalOpen] = useState(false);

  const fetchMedicines = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/medicines/get", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        // Transform data to match UI requirements
        const formattedMedicines = data.map(med => ({
          id: med._id,
          name: med.name,
          time: med.times && med.times.length > 0 ? med.times[0] : "N/A",
          member: med.familyMember?.name || "You",
          status: "pending", // Default status
          dosage: med.dosage
        }));
        setMedicines(formattedMedicines);
      }
    } catch (error) {
      console.error("Failed to fetch medicines:", error);
    }
  };

  const fetchFamilyMembers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/family/get", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const formattedMembers = data.map(member => ({
          id: member._id,
          _id: member._id, // Keep _id for navigation
          name: member.name,
          age: member.age,
          relation: member.relationship,
          medicines: 0, // Placeholder
          status: "active", // Placeholder
          lastTaken: "N/A" // Placeholder
        }));
        setFamilyMembers(formattedMembers);
      }
    } catch (error) {
      console.error("Failed to fetch family members:", error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/appointments/get", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    }
  };

  useEffect(() => {
    fetchMedicines();
    fetchFamilyMembers();
    fetchAppointments();
  }, [token]);

  const handleMedicineAdded = (newMedicine) => {
    // Refresh medicines list from API
    fetchMedicines();
  };

  const handleFamilyMemberAdded = (newMember) => {
    fetchFamilyMembers(); // Refresh from API
  };

  // Calculate stats from real data
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todaysMedicines = medicines.filter(med => {
    // For now, show all medicines as today's medicines
    // In future, can filter by startDate/endDate
    return true;
  });

  const completedMedicines = medicines.filter(med => med.status === "taken");
  const pendingMedicines = medicines.filter(med => med.status === "pending");

  // Get upcoming appointments (not completed or cancelled)
  const upcomingAppointments = appointments
    .filter(apt => apt.status !== "completed" && apt.status !== "cancelled")
    .slice(0, 2) // Show only first 2
    .map(apt => {
      const aptDate = new Date(apt.date);
      const isToday = aptDate.toDateString() === today.toDateString();
      const isTomorrow = aptDate.toDateString() === new Date(today.getTime() + 86400000).toDateString();
      
      return {
        id: apt._id,
        doctor: apt.doctor,
        date: isToday ? "Today" : isTomorrow ? "Tomorrow" : aptDate.toLocaleDateString(),
        time: apt.time,
        member: apt.familyMember?.name || "You",
        type: apt.specialty || apt.type,
      };
    });

  const upcomingAppointmentsCount = appointments.filter(
    apt => apt.status !== "completed" && apt.status !== "cancelled"
  ).length;



  const getStatusColor = (status) => {
    switch (status) {
      case "taken":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "upcoming":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-zinc-100 text-zinc-700 border-zinc-200";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with gradient background */}
      <div className="gradient-bg rounded-2xl p-8 border border-zinc-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-zinc-900 mb-3">
              Hello {user?.name || "User"}!
            </h1>
            <p className="text-lg text-zinc-600 mb-4">
              Here's what's happening with your family's health today
            </p>
            <div className="flex items-center gap-4 text-sm text-zinc-500">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                All systems healthy
              </span>
              <span>•</span>
              <span>Last updated: 2 minutes ago</span>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="w-32 h-32 bg-slate-800 rounded-2xl flex items-center justify-center text-white">
              <Activity size={48} />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="card p-6 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-500 text-sm font-medium">
                Today's Medicines
              </p>
              <p className="text-3xl font-bold text-zinc-900 mt-1">{todaysMedicines.length}</p>
              <p className="text-xs text-zinc-400 mt-1">
                {completedMedicines.length} completed, {pendingMedicines.length} pending
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Pill className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card p-6 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-500 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">{completedMedicines.length}</p>
              <p className="text-xs text-emerald-500 mt-1">Completed today</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <CheckCircle2 className="text-emerald-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card p-6 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-500 text-sm font-medium">Pending</p>
              <p className="text-3xl font-bold text-amber-600 mt-1">{pendingMedicines.length}</p>
              <p className="text-xs text-amber-500 mt-1">Pending medicines</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Clock className="text-amber-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card p-6 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-500 text-sm font-medium">Appointments</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{upcomingAppointmentsCount}</p>
              <p className="text-xs text-blue-500 mt-1">
                {upcomingAppointments.length > 0 
                  ? `Next: ${upcomingAppointments[0].date} ${upcomingAppointments[0].time}`
                  : "No upcoming appointments"}
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Stethoscope className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Today's Medicines - Enhanced */}
        <div className="lg:col-span-2">
          <div className="card p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900">
                  Today's Medicines
                </h2>
                <p className="text-zinc-500 mt-1">
                  Track your family's medication schedule
                </p>
              </div>
              <button
                onClick={() => setIsAddMedicineModalOpen(true)}
                className="btn-primary px-4 py-2 rounded-xl flex items-center gap-2"
              >
                <Plus size={18} />
                Add Medicine
              </button>
            </div>

            <div className="space-y-4">
              {medicines.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">
                  No medicines added yet. Click "Add Medicine" to get started.
                </div>
              ) : (
                medicines.map((medicine) => (
                  <div key={medicine.id} className="group">
                    <div className="flex items-center justify-between p-5 bg-gradient-to-r from-zinc-50 to-zinc-100/50 rounded-xl border border-zinc-100 hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-4 h-4 rounded-full ${medicine.status === "taken"
                            ? "bg-emerald-500 shadow-lg shadow-emerald-200"
                            : medicine.status === "pending"
                              ? "bg-amber-500 shadow-lg shadow-amber-200 animate-pulse"
                              : "bg-blue-500 shadow-lg shadow-blue-200"
                            }`}
                        ></div>
                        <div>
                          <p className="font-semibold text-zinc-900 text-lg">
                            {medicine.name}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-sm text-zinc-500">
                              {medicine.member}
                            </p>
                            <span className="text-zinc-300">•</span>
                            <p className="text-sm font-medium text-zinc-700">
                              {medicine.time}
                            </p>
                            <span className="text-zinc-300">•</span>
                            <p className="text-sm text-zinc-500">
                              {medicine.dosage}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`status-badge border flex items-center gap-1 ${getStatusColor(
                            medicine.status
                          )}`}
                        >
                          {medicine.status === "taken" && <CheckCircle2 size={12} />}
                          {medicine.status === "pending" && <Clock size={12} />}
                          {medicine.status === "upcoming" && <Calendar size={12} />}
                          {medicine.status === "taken" && "Taken"}
                          {medicine.status === "pending" && "Pending"}
                          {medicine.status === "upcoming" && "Upcoming"}
                        </span>

                        {medicine.status === "pending" && (
                          <button className="btn-primary px-4 py-2 text-sm opacity-0 group-hover:opacity-100 transition-all duration-300">
                            Mark Taken
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )))}
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-100">
              <button className="text-slate-800 font-medium hover:text-slate-600 transition-colors">
                View all medicines →
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Appointments */}
          <div className="card p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-zinc-900">Upcoming</h3>
              <Calendar className="text-blue-500" size={24} />
            </div>
            <div className="space-y-4">
              {upcomingAppointments.length === 0 ? (
                <div className="text-center py-4 text-zinc-500 text-sm">
                  No upcoming appointments
                </div>
              ) : (
                upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-zinc-900">
                          {appointment.doctor}
                        </p>
                        <p className="text-sm text-blue-600 font-medium">
                          {appointment.type}
                        </p>
                        <p className="text-sm text-zinc-500 mt-1">
                          {appointment.member}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-zinc-900">
                          {appointment.date}
                        </p>
                        <p className="text-sm text-zinc-500">
                          {appointment.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button 
              onClick={() => navigate("/appointments")}
              className="w-full mt-4 text-blue-600 font-medium hover:text-blue-700 transition-colors"
            >
              View all appointments
            </button>
          </div>

          {/* Family Members */}
          <div className="card p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-zinc-900">Family</h3>
              <Users className="text-slate-500" size={24} />
            </div>
            <div className="space-y-4">
              {familyMembers.map((member) => (
                <div 
                  key={member.id} 
                  className="group cursor-pointer"
                  onClick={() => navigate(`/family/${member._id || member.id}`)}
                >
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-zinc-50 rounded-xl border border-zinc-100 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-800 text-white rounded-full flex items-center justify-center font-medium text-sm">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-900">
                          {member.name}
                        </p>
                        <p className="text-sm text-zinc-500">
                          {member.medicines} medicines • Last:{" "}
                          {member.lastTaken}
                        </p>
                      </div>
                    </div>
                    <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-lg shadow-emerald-200"></div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setIsAddFamilyMemberModalOpen(true)}
              className="w-full mt-4 text-slate-800 font-medium hover:text-slate-600 transition-colors"
            >
              Add Family Member →
            </button>
          </div>
        </div>
      </div>


      <AddMedicineModal
        isOpen={isAddMedicineModalOpen}
        onClose={() => setIsAddMedicineModalOpen(false)}
        onAdd={handleMedicineAdded}
      />

      <AddFamilyMemberModal
        isOpen={isAddFamilyMemberModalOpen}
        onClose={() => setIsAddFamilyMemberModalOpen(false)}
        onAdd={handleFamilyMemberAdded}
      />
    </div >
  );
}
