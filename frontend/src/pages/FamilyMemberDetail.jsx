import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Pill } from "lucide-react";

export default function FamilyMemberDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [member, setMember] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMemberDetails();
    fetchMemberMedicines();
  }, [id, token]);

  const fetchMemberDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/family/get", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch family member");
      }

      const data = await response.json();
      const foundMember = data.find((m) => m._id === id);
      if (foundMember) {
        setMember(foundMember);
      } else {
        setError("Family member not found");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberMedicines = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/medicines/get?familyMemberId=${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMedicines(data);
      }
    } catch (err) {
      console.error("Error fetching medicines:", err);
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
          <p className="text-zinc-600">Loading family member details...</p>
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Family member not found"}</p>
          <button
            onClick={() => navigate("/family")}
            className="btn-primary px-6 py-3 rounded-xl"
          >
            Back to Family Members
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/")}
          className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} className="text-zinc-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Family Member Profile</h1>
          <p className="text-zinc-500">View complete health information</p>
        </div>
      </div>

      {/* Member Header Card */}
      <div className="gradient-bg rounded-2xl p-8 border border-zinc-200">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-600 text-white rounded-2xl flex items-center justify-center text-4xl shadow-lg">
            {getAvatarEmoji(member.relationship, member.gender)}
          </div>
          <div className="flex-1">
            <h2 className="text-4xl font-bold text-zinc-900 mb-2">{member.name}</h2>
            <p className="text-lg text-zinc-600 mb-3">
              {member.relationship} • {member.age} years old
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-sm text-emerald-600 font-medium">Active Profile</span>
            </div>
          </div>
        </div>
      </div>

      {/* Information Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Personal Information */}
        <div className="card p-6">
          <h3 className="text-xl font-bold text-zinc-900 mb-6">Personal Information</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-zinc-50 rounded-xl">
              <span className="text-zinc-600 font-medium">Full Name</span>
              <span className="text-zinc-900 font-semibold">{member.name}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-zinc-50 rounded-xl">
              <span className="text-zinc-600 font-medium">Age</span>
              <span className="text-zinc-900 font-semibold">{member.age} years</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-zinc-50 rounded-xl">
              <span className="text-zinc-600 font-medium">Relationship</span>
              <span className="text-zinc-900 font-semibold">{member.relationship}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-zinc-50 rounded-xl">
              <span className="text-zinc-600 font-medium">Gender</span>
              <span className="text-zinc-900 font-semibold">
                {member.gender || "Not specified"}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-zinc-50 rounded-xl">
              <span className="text-zinc-600 font-medium">Blood Type</span>
              <span className="text-zinc-900 font-semibold">
                {member.bloodType || "Not specified"}
              </span>
            </div>
            {member.phone && (
              <div className="flex justify-between items-center p-4 bg-zinc-50 rounded-xl">
                <span className="text-zinc-600 font-medium">Mobile Number</span>
                <span className="text-zinc-900 font-semibold">{member.phone}</span>
              </div>
            )}
            {member.email && (
              <div className="flex justify-between items-center p-4 bg-zinc-50 rounded-xl">
                <span className="text-zinc-600 font-medium">Email</span>
                <span className="text-zinc-900 font-semibold">{member.email}</span>
              </div>
            )}
            {member.emergencyContact && (
              <div className="flex justify-between items-center p-4 bg-zinc-50 rounded-xl">
                <span className="text-zinc-600 font-medium">Emergency Contact</span>
                <span className="text-zinc-900 font-semibold">{member.emergencyContact}</span>
              </div>
            )}
          </div>
        </div>

        {/* Medical Information */}
        <div className="card p-6">
          <h3 className="text-xl font-bold text-zinc-900 mb-6">Medical Information</h3>

          {/* Allergies */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-zinc-800 mb-3">Allergies</h4>
            {member.allergies && member.allergies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {member.allergies.map((allergy, index) => (
                  <span
                    key={index}
                    className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm font-medium border border-red-200"
                  >
                    {allergy}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-zinc-500 italic">No known allergies</p>
            )}
          </div>

          {/* Medical Conditions */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-zinc-800 mb-3">Medical Conditions</h4>
            {member.conditions && member.conditions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {member.conditions.map((condition, index) => (
                  <span
                    key={index}
                    className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium border border-blue-200"
                  >
                    {condition}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-zinc-500 italic">No medical conditions recorded</p>
            )}
          </div>

          {/* Notes */}
          {member.notes && (
            <div>
              <h4 className="text-lg font-semibold text-zinc-800 mb-3">Additional Notes</h4>
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
                <p className="text-zinc-700">{member.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Medicines Section */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-zinc-900">Current Medicines</h3>
          <button
            onClick={() => navigate("/medicines")}
            className="btn-primary px-4 py-2 rounded-xl flex items-center gap-2"
          >
            <Pill size={18} />
            Add Medicine
          </button>
        </div>

        {medicines.length > 0 ? (
          <div className="grid gap-4">
            {medicines.map((medicine) => (
              <div
                key={medicine._id}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h4 className="text-xl font-bold text-zinc-900">{medicine.name}</h4>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm font-medium">
                        {medicine.dosage}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-blue-600 font-medium block">Schedule</span>
                        <span className="text-zinc-900">
                          {medicine.times && medicine.times.length > 0
                            ? medicine.times.join(", ")
                            : "As needed"}
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-600 font-medium block">Start Date</span>
                        <span className="text-zinc-900">
                          {medicine.startDate
                            ? new Date(medicine.startDate).toLocaleDateString()
                            : "Not specified"}
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-600 font-medium block">End Date</span>
                        <span className="text-zinc-900">
                          {medicine.endDate
                            ? new Date(medicine.endDate).toLocaleDateString()
                            : "Ongoing"}
                        </span>
                      </div>
                    </div>
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
            <h4 className="text-lg font-semibold text-zinc-700 mb-2">No Medicines Added</h4>
            <p className="text-zinc-500 mb-4">
              This family member doesn't have any medicines scheduled yet.
            </p>
            <button
              onClick={() => navigate("/medicines")}
              className="btn-primary px-6 py-3 rounded-xl"
            >
              Add First Medicine
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
