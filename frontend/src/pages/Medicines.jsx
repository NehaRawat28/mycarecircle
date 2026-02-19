import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import AddMedicineModal from "../components/AddMedicineModal";

export default function Medicines() {
  const { token } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/medicines/get", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch medicines");
      }

      const data = await response.json();
      setMedicines(data);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch medicines:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMedicineAdded = (newMedicine) => {
    // Refresh medicines list from API
    fetchMedicines();
  };

  // Transform medicines for display
  const formattedMedicines = medicines.map(med => ({
    id: med._id,
    name: med.name,
    dosage: med.dosage,
    frequency: med.frequency || "Once daily",
    time: med.times && med.times.length > 0 ? med.times.join(", ") : "N/A",
    member: "You", // TODO: Get family member name if familyMember is set
    startDate: med.startDate ? new Date(med.startDate).toLocaleDateString() : "N/A",
    endDate: med.endDate ? new Date(med.endDate).toLocaleDateString() : "Ongoing",
    status: med.endDate && new Date(med.endDate) < new Date() ? "completed" : "active",
    adherence: 100, // TODO: Calculate actual adherence
    category: "General", // TODO: Add category field to model
    sideEffects: [], // TODO: Add side effects field to model
    nextDose: med.times && med.times.length > 0 ? `Today ${med.times[0]}` : "N/A"
  }));

  const activeMedicines = formattedMedicines.filter(m => m.status === "active");
  const completedMedicines = formattedMedicines.filter(m => m.status === "completed");

  const getAdherenceColor = (adherence) => {
    if (adherence >= 90) return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (adherence >= 70) return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-red-100 text-red-700 border-red-200";
  };

  const getCategoryColor = (category) => {
    const colors = {
      "Heart": "bg-red-100 text-red-700",
      "Diabetes": "bg-blue-100 text-blue-700",
      "Pain Relief": "bg-purple-100 text-purple-700",
      "Vitamins": "bg-green-100 text-green-700"
    };
    return colors[category] || "bg-zinc-100 text-zinc-700";
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="gradient-bg rounded-2xl p-8 border border-zinc-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-zinc-900 mb-3">Medicine Management</h1>
            <p className="text-lg text-zinc-600 mb-4">Track and manage family medications with smart reminders</p>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-zinc-600">{activeMedicines.length} Active Medicines</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-zinc-600">92% Average Adherence</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setShowAddForm(true)}
            className="btn-primary px-8 py-4 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            + Add Medicine
          </button>
        </div>
      </div>

      {/* Enhanced Tabs */}
      <div className="flex gap-2 bg-zinc-100 p-2 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
            activeTab === "active" 
              ? "bg-white text-zinc-900 shadow-md" 
              : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
          }`}
        >
          Active Medicines ({activeMedicines.length})
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
            activeTab === "completed" 
              ? "bg-white text-zinc-900 shadow-md" 
              : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
          }`}
        >
          Completed ({completedMedicines.length})
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Enhanced Medicine List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-slate-800 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-zinc-600">Loading medicines...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {(activeTab === "active" ? activeMedicines : completedMedicines).length === 0 ? (
            <div className="text-center py-12 bg-zinc-50 rounded-xl border-2 border-dashed border-zinc-300">
              <div className="w-16 h-16 bg-zinc-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💊</span>
              </div>
              <h4 className="text-lg font-semibold text-zinc-700 mb-2">
                No {activeTab === "active" ? "Active" : "Completed"} Medicines
              </h4>
              <p className="text-zinc-500 mb-4">
                {activeTab === "active" 
                  ? "You don't have any active medicines yet. Add one to get started."
                  : "No completed medicines to display."}
              </p>
              {activeTab === "active" && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="btn-primary px-6 py-3 rounded-xl"
                >
                  Add First Medicine
                </button>
              )}
            </div>
          ) : (
            (activeTab === "active" ? activeMedicines : completedMedicines).map((medicine) => (
          <div key={medicine.id} className="card p-8 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Medicine Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                    💊
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-zinc-900">{medicine.name}</h3>
                      <span className="bg-slate-100 text-zinc-900 px-3 py-1 rounded-lg text-sm font-medium">
                        {medicine.dosage}
                      </span>
                      <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getCategoryColor(medicine.category)}`}>
                        {medicine.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`status-badge border ${getAdherenceColor(medicine.adherence)}`}>
                        {medicine.adherence}% adherence
                      </span>
                      <span className="text-zinc-500 text-sm">Next: {medicine.nextDose}</span>
                    </div>
                  </div>
                </div>

                {/* Medicine Details Grid */}
                <div className="grid md:grid-cols-4 gap-6 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                    <span className="text-blue-600 text-sm font-medium block">Patient</span>
                    <span className="text-blue-900 font-semibold text-lg">{medicine.member}</span>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                    <span className="text-purple-600 text-sm font-medium block">Frequency</span>
                    <span className="text-purple-900 font-semibold text-lg">{medicine.frequency}</span>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                    <span className="text-green-600 text-sm font-medium block">Time(s)</span>
                    <span className="text-green-900 font-semibold text-lg">{medicine.time}</span>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-200">
                    <span className="text-amber-600 text-sm font-medium block">Duration</span>
                    <span className="text-amber-900 font-semibold text-sm">
                      {medicine.startDate} - {medicine.endDate}
                    </span>
                  </div>
                </div>

                {/* Side Effects */}
                <div className="mb-4">
                  <span className="text-zinc-700 font-medium text-sm block mb-2">Possible Side Effects:</span>
                  <div className="flex flex-wrap gap-2">
                    {medicine.sideEffects.map((effect, index) => (
                      <span key={index} className="bg-red-50 text-red-700 px-2 py-1 rounded-lg text-xs border border-red-200">
                        {effect}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 ml-6">
                <button className="btn-secondary px-4 py-3 text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300">
                  Edit Schedule
                </button>
                <button className="btn-primary px-4 py-3 text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                  View History
                </button>
                <button className="text-zinc-400 hover:text-zinc-600 p-3 rounded-lg hover:bg-zinc-100 transition-all duration-200">
                  ⋯
                </button>
              </div>
            </div>
          </div>
            ))
          )}
        </div>
      )}

      <AddMedicineModal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onAdd={handleMedicineAdded}
      />
    </div>
  );
}