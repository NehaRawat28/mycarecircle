import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function Emergency() {
  const { token } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    relationship: "",
    phone: "",
    email: "",
    specialty: "",
    availability: "",
    address: "",
    notes: "",
  });

  useEffect(() => {
    fetchContacts();
    fetchFamilyMembers();
  }, [token]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/emergency/get", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch emergency contacts");
      }

      const data = await response.json();
      setEmergencyContacts(data);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch emergency contacts:", err);
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
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/emergency/add", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add emergency contact");
      }

      const newContact = await response.json();
      setEmergencyContacts([...emergencyContacts, newContact]);
      setShowAddForm(false);
      
      // Reset form
      setFormData({
        name: "",
        relationship: "",
        phone: "",
        email: "",
        specialty: "",
        availability: "",
        address: "",
        notes: "",
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const quickActions = [
    { name: "Call 911", icon: "🚨", color: "bg-red-600 hover:bg-red-700", action: "emergency" },
    { name: "Poison Control", icon: "☠️", color: "bg-orange-600 hover:bg-orange-700", action: "poison" },
    { name: "Primary Doctor", icon: "👨‍⚕️", color: "bg-blue-600 hover:bg-blue-700", action: "doctor" },
    { name: "Nearest Hospital", icon: "🏥", color: "bg-green-600 hover:bg-green-700", action: "hospital" }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Emergency Contacts</h1>
          <p className="text-zinc-500">Quick access to emergency contacts and medical information</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-slate-800 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-700 transition-colors"
        >
          + Add Contact
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Quick Emergency Actions */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-red-900 mb-4">🚨 Emergency Quick Actions</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className={`${action.color} text-white p-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2`}
            >
              <span className="text-xl">{action.icon}</span>
              {action.name}
            </button>
          ))}
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-zinc-900 mb-6">Emergency Contacts</h2>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-slate-800 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-zinc-600">Loading contacts...</span>
          </div>
        ) : emergencyContacts.length === 0 ? (
          <div className="text-center py-12 bg-zinc-50 rounded-xl border-2 border-dashed border-zinc-300">
            <div className="w-16 h-16 bg-zinc-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📞</span>
            </div>
            <h4 className="text-lg font-semibold text-zinc-700 mb-2">No Emergency Contacts</h4>
            <p className="text-zinc-500 mb-4">
              Add emergency contacts for quick access during emergencies.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary px-6 py-3 rounded-xl"
            >
              Add First Contact
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {emergencyContacts.map((contact) => (
              <div key={contact._id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-800 text-white rounded-full flex items-center justify-center font-medium">
                    {contact.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900">{contact.name}</h3>
                    <p className="text-sm text-zinc-500">
                      {contact.relationship} {contact.specialty ? `• ${contact.specialty}` : ''}
                    </p>
                    {contact.availability && (
                      <p className="text-sm text-zinc-500">Available: {contact.availability}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-medium text-zinc-900">{contact.phone}</p>
                    {contact.email && (
                      <p className="text-sm text-zinc-500">{contact.email}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`tel:${contact.phone}`}
                      className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      📞 Call
                    </a>
                    <button className="bg-slate-100 text-zinc-900 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Medical Information */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-zinc-900 mb-6">Critical Medical Information</h2>
        {familyMembers.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            No family members added yet. Add family members to see their medical information here.
          </div>
        ) : (
          <div className="space-y-4">
            {familyMembers.map((member) => (
              <div key={member._id} className="p-4 bg-zinc-50 rounded-lg">
                <h3 className="font-semibold text-zinc-900 mb-3">{member.name}</h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-zinc-500 block">Blood Type</span>
                    <span className="text-zinc-900 font-medium">
                      {member.bloodType || "Not specified"}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Allergies</span>
                    <span className="text-zinc-900 font-medium">
                      {member.allergies && member.allergies.length > 0
                        ? member.allergies.join(", ")
                        : "None known"}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Medical Conditions</span>
                    <span className="text-zinc-900 font-medium">
                      {member.conditions && member.conditions.length > 0
                        ? member.conditions.join(", ")
                        : "None"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-zinc-900">Add Emergency Contact</h2>
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
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Full Name</label>
                  <input 
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                    placeholder="Dr. John Smith"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Relationship</label>
                  <select
                    name="relationship"
                    value={formData.relationship}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                    required
                  >
                    <option value="">Select relationship</option>
                    <option value="Primary Doctor">Primary Doctor</option>
                    <option value="Specialist">Specialist</option>
                    <option value="Hospital">Hospital</option>
                    <option value="Family Member">Family Member</option>
                    <option value="Friend">Friend</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Phone Number</label>
                  <input 
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Email (Optional)</label>
                  <input 
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                    placeholder="contact@email.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Specialty/Role</label>
                  <input 
                    type="text"
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                    placeholder="Cardiologist, Emergency Room, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Availability</label>
                  <input 
                    type="text"
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                    placeholder="24/7, Business hours, etc."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Address (Optional)</label>
                <textarea 
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                  rows="2"
                  placeholder="Full address for hospitals/clinics"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Notes (Optional)</label>
                <textarea 
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                  rows="3"
                  placeholder="Additional information, special instructions, etc."
                ></textarea>
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
                  Add Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
