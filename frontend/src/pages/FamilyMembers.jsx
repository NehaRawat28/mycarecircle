import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function FamilyMembers() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showMedicineModal, setShowMedicineModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberMedicines, setMemberMedicines] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState("");
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    relationship: "",
    bloodType: "",
    gender: "",
    allergies: "",
    conditions: "",
    emergencyContact: "",
    phone: "",
    email: "",
    notes: "",
  });

  const [medicineData, setMedicineData] = useState({
    name: "",
    dosage: "",
    frequency: "once-daily",
    times: ["08:00"],
    startDate: "",
    endDate: "",
    instructions: "",
  });

  // Fetch family members on component mount
  useEffect(() => {
    fetchFamilyMembers();
  }, []);

  const fetchFamilyMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/family/get", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch family members");
      }

      const data = await response.json();
      setFamilyMembers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/family/add", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          age: parseInt(formData.age),
          allergies: formData.allergies
            .split(",")
            .map((a) => a.trim())
            .filter((a) => a),
          conditions: formData.conditions
            .split(",")
            .map((c) => c.trim())
            .filter((c) => c),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add family member");
      }

      const newMember = await response.json();
      setFamilyMembers([...familyMembers, newMember]);
      setShowAddForm(false);
      setFormData({
        name: "",
        age: "",
        relationship: "",
        bloodType: "",
        gender: "",
        allergies: "",
        conditions: "",
        emergencyContact: "",
        phone: "",
        email: "",
        notes: "",
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    setError("");

    try {
      console.log("Submitting medicine data for:", selectedMember.name);
      console.log("Medicine data:", medicineData);

      const payload = {
        name: medicineData.name,
        dosage: medicineData.dosage,
        time: medicineData.times, // Send as 'time' array
        familyMember: selectedMember._id, // Make sure this is included
        startDate: new Date(medicineData.startDate),
        endDate: medicineData.endDate ? new Date(medicineData.endDate) : null,
      };

      console.log("Sending payload:", payload);

      const response = await fetch("http://localhost:5000/api/medicines/add", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(errorData.error || "Failed to add medicine");
      }

      const newMedicine = await response.json();
      console.log("Medicine added successfully:", newMedicine);

      // Close medicine modal
      setShowMedicineModal(false);

      // Reset form
      setMedicineData({
        name: "",
        dosage: "",
        frequency: "once-daily",
        times: ["08:00"],
        startDate: "",
        endDate: "",
        instructions: "",
      });

      // If profile modal is open, refresh the medicines list
      if (showProfileModal && selectedMember) {
        console.log("Refreshing medicines for profile view...");
        try {
          const medicinesResponse = await fetch(
            `http://localhost:5000/api/medicines/get?familyMemberId=${selectedMember._id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (medicinesResponse.ok) {
            const medicines = await medicinesResponse.json();
            console.log("Refreshed medicines:", medicines);
            setMemberMedicines(medicines);
          }
        } catch (err) {
          console.error("Error refreshing medicines:", err);
        }
      }

      // Don't reset selectedMember if profile is open
      if (!showProfileModal) {
        setSelectedMember(null);
      }

      // Show success message
      alert(
        `Medicine "${newMedicine.name}" added successfully for ${selectedMember.name}!`
      );
    } catch (err) {
      console.error("Error adding medicine:", err);
      setError(err.message);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleMedicineInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "frequency") {
      // Update times based on frequency
      let newTimes = [];
      switch (value) {
        case "once-daily":
          newTimes = ["08:00"];
          break;
        case "twice-daily":
          newTimes = ["08:00", "20:00"];
          break;
        case "three-times-daily":
          newTimes = ["08:00", "14:00", "20:00"];
          break;
        case "four-times-daily":
          newTimes = ["08:00", "12:00", "16:00", "20:00"];
          break;
        default:
          newTimes = ["08:00"];
      }

      setMedicineData({
        ...medicineData,
        frequency: value,
        times: newTimes,
      });
    } else {
      setMedicineData({
        ...medicineData,
        [name]: value,
      });
    }
  };

  const handleTimeChange = (index, value) => {
    const newTimes = [...medicineData.times];
    newTimes[index] = value;
    setMedicineData({
      ...medicineData,
      times: newTimes,
    });
  };

  const openMedicineModal = (member) => {
    setSelectedMember(member);
    setShowMedicineModal(true);
    setError("");
  };

  const openProfileModal = async (member) => {
    setSelectedMember(member);
    setShowProfileModal(true);
    setError("");

    // Fetch medicines for this family member
    try {
      setProfileLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/medicines/get?familyMemberId=${member._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch medicines");
      }

      const medicines = await response.json();
      setMemberMedicines(medicines);
    } catch (err) {
      console.error("Error fetching medicines:", err);
      setMemberMedicines([]);
    } finally {
      setProfileLoading(false);
    }
  };

  const getAvatarEmoji = (relationship, gender) => {
    if (relationship === "Self") return gender === "Female" ? "👩" : "👨";
    if (relationship === "Spouse") return gender === "Female" ? "👩" : "👨";
    if (relationship === "Child") return gender === "Female" ? "👧" : "👦";
    if (relationship === "Parent") return gender === "Female" ? "👵" : "👴";
    return "👤";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-slate-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-600">Loading family members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="gradient-bg rounded-2xl p-8 border border-zinc-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-zinc-900 mb-3">
              Family Members
            </h1>
            <p className="text-lg text-zinc-600 mb-4">
              Manage your family's health profiles and medical information
            </p>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-zinc-600">
                  {familyMembers.length} Active Members
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-zinc-600">All profiles complete</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary px-8 py-4 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            + Add Member
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Enhanced Family Members Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {familyMembers.map((member) => (
          <div
            key={member._id}
            className="card p-8 hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-100 to-transparent rounded-full -translate-y-16 translate-x-16 opacity-50"></div>

            <div className="relative">
              {/* Member Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                    {getAvatarEmoji(member.relationship, member.gender)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900">
                      {member.name}
                    </h3>
                    <p className="text-zinc-500 font-medium">
                      {member.relationship} • {member.age} years
                    </p>
                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mt-2 bg-emerald-100 text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      Active
                    </div>
                  </div>
                </div>
                <button className="text-zinc-400 hover:text-zinc-600 p-2 rounded-lg hover:bg-zinc-100 transition-all duration-200">
                  ⋯
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                  <p className="text-purple-600 text-sm font-medium">
                    Blood Type
                  </p>
                  <p className="text-xl font-bold text-purple-900">
                    {member.bloodType || "N/A"}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                  <p className="text-blue-600 text-sm font-medium">Gender</p>
                  <p className="text-sm font-semibold text-blue-900">
                    {member.gender || "N/A"}
                  </p>
                </div>
              </div>

              {/* Medical Information */}
              <div className="space-y-4 mb-6">
                {member.allergies && member.allergies.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-zinc-700 mb-2">
                      Allergies
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {member.allergies.map((allergy, index) => (
                        <span
                          key={index}
                          className="bg-red-50 text-red-700 px-2 py-1 rounded-full text-xs font-medium border border-red-200"
                        >
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {member.conditions && member.conditions.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-zinc-700 mb-2">
                      Medical Conditions
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {member.conditions.map((condition, index) => (
                        <span
                          key={index}
                          className="bg-zinc-100 text-zinc-700 px-2 py-1 rounded-full text-xs font-medium border border-zinc-200"
                        >
                          {condition}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => openProfileModal(member)}
                  className="flex-1 btn-secondary py-3 text-sm rounded-xl hover:shadow-md transition-all duration-300"
                >
                  View Profile
                </button>
                <button
                  onClick={() => openMedicineModal(member)}
                  className="flex-1 btn-primary py-3 text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Add Medicine
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Add Member Card */}
        <div
          onClick={() => setShowAddForm(true)}
          className="card p-8 border-2 border-dashed border-zinc-300 hover:border-slate-400 cursor-pointer transition-all duration-300 group flex items-center justify-center min-h-[400px]"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-slate-100 transition-colors duration-300">
              <span className="text-2xl text-zinc-400 group-hover:text-slate-600">
                +
              </span>
            </div>
            <h3 className="text-lg font-semibold text-zinc-700 mb-2">
              Add Family Member
            </h3>
            <p className="text-zinc-500 text-sm">Create a new health profile</p>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900">
                  Add Family Member
                </h2>
                <p className="text-zinc-500 mt-1">
                  Create a new health profile for your family
                </p>
              </div>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-zinc-400 hover:text-zinc-600 p-2 rounded-lg hover:bg-zinc-100 transition-all duration-200"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleAddMember} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">
                    Relationship
                  </label>
                  <select
                    name="relationship"
                    value={formData.relationship}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  >
                    <option value="">Select relationship</option>
                    <option value="Self">Self</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child</option>
                    <option value="Parent">Parent</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Age"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">
                    Blood Type
                  </label>
                  <select
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="">Select blood type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">
                  Known Allergies
                </label>
                <input
                  type="text"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., Penicillin, Shellfish, Peanuts (separate with commas)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">
                  Medical Conditions
                </label>
                <input
                  type="text"
                  name="conditions"
                  value={formData.conditions}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., Diabetes, Hypertension (separate with commas)"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="e.g., +1 (555) 123-4567"
                  />
                  <p className="text-xs text-zinc-500 mt-1">
                    For SMS reminders
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="e.g., member@example.com"
                  />
                  <p className="text-xs text-zinc-500 mt-1">
                    For email reminders
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">
                  Emergency Contact
                </label>
                <input
                  type="tel"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Phone number for emergencies"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="input-field"
                  rows="4"
                  placeholder="Any additional medical information, preferences, or notes..."
                ></textarea>
              </div>

              <div className="flex gap-4 pt-6 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 btn-secondary py-4 text-lg rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary py-4 text-lg rounded-xl shadow-lg hover:shadow-xl"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Medicine Modal */}
      {showMedicineModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900">
                  Add Medicine
                </h2>
                <p className="text-zinc-500 mt-1">
                  Add medication for {selectedMember.name}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowMedicineModal(false);
                  setSelectedMember(null);
                }}
                className="text-zinc-400 hover:text-zinc-600 p-2 rounded-lg hover:bg-zinc-100 transition-all duration-200"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleAddMedicine} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">
                    Medicine Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={medicineData.name}
                    onChange={handleMedicineInputChange}
                    className="input-field"
                    placeholder="e.g., Lisinopril, Vitamin D"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">
                    Dosage
                  </label>
                  <input
                    type="text"
                    name="dosage"
                    value={medicineData.dosage}
                    onChange={handleMedicineInputChange}
                    className="input-field"
                    placeholder="e.g., 10mg, 1 tablet"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">
                  Frequency
                </label>
                <select
                  name="frequency"
                  value={medicineData.frequency}
                  onChange={handleMedicineInputChange}
                  className="input-field"
                  required
                >
                  <option value="once-daily">Once daily</option>
                  <option value="twice-daily">Twice daily</option>
                  <option value="three-times-daily">Three times daily</option>
                  <option value="four-times-daily">Four times daily</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">
                  Times
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {medicineData.times.map((time, index) => (
                    <input
                      key={index}
                      type="time"
                      value={time}
                      onChange={(e) => handleTimeChange(index, e.target.value)}
                      className="input-field"
                      required
                    />
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={medicineData.startDate}
                    onChange={handleMedicineInputChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={medicineData.endDate}
                    onChange={handleMedicineInputChange}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">
                  Instructions (Optional)
                </label>
                <textarea
                  name="instructions"
                  value={medicineData.instructions}
                  onChange={handleMedicineInputChange}
                  className="input-field"
                  rows="3"
                  placeholder="Special instructions, take with food, etc."
                ></textarea>
              </div>

              <div className="flex gap-4 pt-6 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowMedicineModal(false);
                    setSelectedMember(null);
                  }}
                  className="flex-1 btn-secondary py-4 text-lg rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary py-4 text-lg rounded-xl shadow-lg hover:shadow-xl"
                >
                  Add Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile View Modal */}
      {showProfileModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-zinc-200 p-8 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-slate-800 to-slate-600 text-white rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                    {getAvatarEmoji(
                      selectedMember.relationship,
                      selectedMember.gender
                    )}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-zinc-900">
                      {selectedMember.name}
                    </h2>
                    <p className="text-lg text-zinc-500">
                      {selectedMember.relationship} • {selectedMember.age} years
                      old
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span className="text-sm text-emerald-600 font-medium">
                        Active Profile
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    setSelectedMember(null);
                    setMemberMedicines([]);
                  }}
                  className="text-zinc-400 hover:text-zinc-600 p-3 rounded-lg hover:bg-zinc-100 transition-all duration-200"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 mb-4">
                      Personal Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-zinc-50 rounded-xl">
                        <span className="text-zinc-600 font-medium">
                          Full Name
                        </span>
                        <span className="text-zinc-900 font-semibold">
                          {selectedMember.name}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-zinc-50 rounded-xl">
                        <span className="text-zinc-600 font-medium">Age</span>
                        <span className="text-zinc-900 font-semibold">
                          {selectedMember.age} years
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-zinc-50 rounded-xl">
                        <span className="text-zinc-600 font-medium">
                          Relationship
                        </span>
                        <span className="text-zinc-900 font-semibold">
                          {selectedMember.relationship}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-zinc-50 rounded-xl">
                        <span className="text-zinc-600 font-medium">
                          Gender
                        </span>
                        <span className="text-zinc-900 font-semibold">
                          {selectedMember.gender || "Not specified"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-zinc-50 rounded-xl">
                        <span className="text-zinc-600 font-medium">
                          Blood Type
                        </span>
                        <span className="text-zinc-900 font-semibold">
                          {selectedMember.bloodType || "Not specified"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 mb-4">
                      Medical Information
                    </h3>

                    {/* Allergies */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-zinc-800 mb-3">
                        Allergies
                      </h4>
                      {selectedMember.allergies &&
                      selectedMember.allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedMember.allergies.map((allergy, index) => (
                            <span
                              key={index}
                              className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm font-medium border border-red-200"
                            >
                              {allergy}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-zinc-500 italic">
                          No known allergies
                        </p>
                      )}
                    </div>

                    {/* Medical Conditions */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-zinc-800 mb-3">
                        Medical Conditions
                      </h4>
                      {selectedMember.conditions &&
                      selectedMember.conditions.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedMember.conditions.map((condition, index) => (
                            <span
                              key={index}
                              className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium border border-blue-200"
                            >
                              {condition}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-zinc-500 italic">
                          No medical conditions recorded
                        </p>
                      )}
                    </div>

                    {/* Emergency Contact */}
                    {selectedMember.emergencyContact && (
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-zinc-800 mb-3">
                          Emergency Contact
                        </h4>
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                          <p className="text-amber-800 font-medium">
                            {selectedMember.emergencyContact}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {selectedMember.notes && (
                      <div>
                        <h4 className="text-lg font-semibold text-zinc-800 mb-3">
                          Additional Notes
                        </h4>
                        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
                          <p className="text-zinc-700">
                            {selectedMember.notes}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Medicines Section */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-zinc-900">
                    Current Medicines
                  </h3>
                  <button
                    onClick={() => {
                      setShowProfileModal(false);
                      openMedicineModal(selectedMember);
                    }}
                    className="btn-primary px-4 py-2 rounded-xl"
                  >
                    + Add Medicine
                  </button>
                </div>

                {profileLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-4 border-slate-800 border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-3 text-zinc-600">
                      Loading medicines...
                    </span>
                  </div>
                ) : memberMedicines.length > 0 ? (
                  <div className="grid gap-4">
                    {memberMedicines.map((medicine) => (
                      <div
                        key={medicine._id}
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h4 className="text-xl font-bold text-zinc-900">
                                {medicine.name}
                              </h4>
                              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm font-medium">
                                {medicine.dosage}
                              </span>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-blue-600 font-medium block">
                                  Schedule
                                </span>
                                <span className="text-zinc-900">
                                  {medicine.time && medicine.time.length > 0
                                    ? medicine.time.join(", ")
                                    : "As needed"}
                                </span>
                              </div>
                              <div>
                                <span className="text-blue-600 font-medium block">
                                  Start Date
                                </span>
                                <span className="text-zinc-900">
                                  {medicine.startDate
                                    ? new Date(
                                        medicine.startDate
                                      ).toLocaleDateString()
                                    : "Not specified"}
                                </span>
                              </div>
                              <div>
                                <span className="text-blue-600 font-medium block">
                                  End Date
                                </span>
                                <span className="text-zinc-900">
                                  {medicine.endDate
                                    ? new Date(
                                        medicine.endDate
                                      ).toLocaleDateString()
                                    : "Ongoing"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 ml-4">
                            <button className="bg-white text-blue-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors border border-blue-200">
                              Edit
                            </button>
                            <button className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                              History
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-zinc-50 rounded-xl border-2 border-dashed border-zinc-300">
                    <div className="w-16 h-16 bg-zinc-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">💊</span>
                    </div>
                    <h4 className="text-lg font-semibold text-zinc-700 mb-2">
                      No Medicines Added
                    </h4>
                    <p className="text-zinc-500 mb-4">
                      This family member doesn't have any medicines scheduled
                      yet.
                    </p>
                    <button
                      onClick={() => {
                        setShowProfileModal(false);
                        openMedicineModal(selectedMember);
                      }}
                      className="btn-primary px-6 py-3 rounded-xl"
                    >
                      Add First Medicine
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-zinc-200">
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    setSelectedMember(null);
                    setMemberMedicines([]);
                  }}
                  className="flex-1 btn-secondary py-4 text-lg rounded-xl"
                >
                  Close Profile
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement edit profile functionality
                    alert("Edit profile functionality coming soon!");
                  }}
                  className="flex-1 btn-primary py-4 text-lg rounded-xl shadow-lg hover:shadow-xl"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
