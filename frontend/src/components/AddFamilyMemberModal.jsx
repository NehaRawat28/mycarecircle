import { X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AddFamilyMemberModal({ isOpen, onClose, onAdd }) {
    const { token } = useAuth();
    const [formData, setFormData] = useState({
        name: "",
        relationship: "",
        age: "",
        bloodType: "",
        gender: "",
        allergies: "",
        conditions: "",
        emergencyContact: "",
        phone: "",
        email: "",
        notes: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const payload = {
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
            };

            const response = await fetch("http://localhost:5000/api/family/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || errorData.msg || "Failed to add family member");
            }

            const newMember = await response.json();
            onAdd(newMember);
            onClose();
            
            // Reset form
            setFormData({
                name: "",
                relationship: "",
                age: "",
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
        } finally {
            setLoading(false);
        }
    };

    return (
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
                        onClick={onClose}
                        className="text-zinc-400 hover:text-zinc-600 p-2 rounded-lg hover:bg-zinc-100 transition-all duration-200"
                    >
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
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
                            onClick={onClose}
                            className="flex-1 btn-secondary py-4 text-lg rounded-xl"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 btn-primary py-4 text-lg rounded-xl shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? "Adding..." : "Add Member"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
