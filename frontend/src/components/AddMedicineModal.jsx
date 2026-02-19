import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function AddMedicineModal({ isOpen, onClose, onAdd }) {
    const { token } = useAuth();
    const [formData, setFormData] = useState({
        name: "",
        dosage: "",
        frequency: "once-daily",
        times: ["08:00"],
        familyMember: "",
        startDate: "",
        endDate: "",
        instructions: "",
        smsReminder: false,
        emailReminder: false,
    });
    const [selectedMemberInfo, setSelectedMemberInfo] = useState(null);
    const [familyMembers, setFamilyMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            fetchFamilyMembers();
        }
    }, [isOpen]);

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

    if (!isOpen) return null;

    const handleFrequencyChange = (e) => {
        const frequency = e.target.value;
        let newTimes = [];
        
        switch (frequency) {
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

        setFormData({
            ...formData,
            frequency,
            times: newTimes,
        });
    };

    const handleTimeChange = (index, value) => {
        const newTimes = [...formData.times];
        newTimes[index] = value;
        setFormData({
            ...formData,
            times: newTimes,
        });
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        // Handle checkbox inputs
        if (type === "checkbox") {
            setFormData({
                ...formData,
                [name]: checked,
            });
            return;
        }
        
        // Handle family member selection - update relationship info
        if (name === "familyMember") {
            const selectedMember = familyMembers.find(m => m._id === value);
            setSelectedMemberInfo(selectedMember || null);
        }
        
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
                name: formData.name,
                dosage: formData.dosage,
                frequency: formData.frequency,
                times: formData.times,
                startDate: formData.startDate ? new Date(formData.startDate) : new Date(),
                endDate: formData.endDate ? new Date(formData.endDate) : null,
                instructions: formData.instructions,
                reminderSettings: {
                    smsReminder: formData.smsReminder,
                    emailReminder: formData.emailReminder,
                },
            };

            // Add familyMember if selected
            if (formData.familyMember) {
                payload.familyMember = formData.familyMember;
            }

            const response = await fetch("http://localhost:5000/api/medicines/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || errorData.msg || "Failed to add medicine");
            }

            const newMedicine = await response.json();
            onAdd(newMedicine);
            onClose();
            
            // Reset form
            setFormData({
                name: "",
                dosage: "",
                frequency: "once-daily",
                times: ["08:00"],
                familyMember: "",
                startDate: "",
                endDate: "",
                instructions: "",
                smsReminder: false,
                emailReminder: false,
            });
            setSelectedMemberInfo(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
                <div className="flex items-center justify-between p-6 border-b border-zinc-100 sticky top-0 bg-white z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-zinc-900">Add New Medicine</h2>
                        <p className="text-zinc-500 mt-1">Set up medication schedule and reminders</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    {/* Basic Information */}
                    <div className="bg-gradient-to-r from-slate-50 to-zinc-50 p-6 rounded-xl border border-zinc-200">
                        <h3 className="text-lg font-semibold text-zinc-900 mb-4">Basic Information</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-zinc-700 mb-2">
                                    Medicine Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
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
                                    value={formData.dosage}
                                    onChange={handleInputChange}
                                    className="input-field"
                                    placeholder="e.g., 10mg, 1 tablet"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Patient & Schedule */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                        <h3 className="text-lg font-semibold text-zinc-900 mb-4">Patient & Schedule</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-zinc-700 mb-2">
                                    Family Member (Optional)
                                </label>
                                <select
                                    name="familyMember"
                                    value={formData.familyMember}
                                    onChange={handleInputChange}
                                    className="input-field"
                                >
                                    <option value="">Select family member (leave empty for yourself)</option>
                                    {familyMembers.map((member) => (
                                        <option key={member._id} value={member._id}>
                                            {member.name} ({member.relationship})
                                        </option>
                                    ))}
                                </select>
                                {selectedMemberInfo && (
                                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm text-blue-800">
                                            <span className="font-semibold">Selected:</span> {selectedMemberInfo.name} - 
                                            <span className="font-medium"> Your {selectedMemberInfo.relationship}</span>
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-zinc-700 mb-2">
                                        Frequency
                                    </label>
                                    <select
                                        name="frequency"
                                        value={formData.frequency}
                                        onChange={handleFrequencyChange}
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
                                        {formData.times.map((time, index) => (
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
                            </div>
                        </div>
                    </div>

                    {/* Duration */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                        <h3 className="text-lg font-semibold text-zinc-900 mb-4">Duration</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-zinc-700 mb-2">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleInputChange}
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
                                    value={formData.endDate}
                                    onChange={handleInputChange}
                                    className="input-field"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200">
                        <h3 className="text-lg font-semibold text-zinc-900 mb-4">Additional Information</h3>
                        <div>
                            <label className="block text-sm font-semibold text-zinc-700 mb-2">
                                Instructions (Optional)
                            </label>
                            <textarea
                                name="instructions"
                                value={formData.instructions}
                                onChange={handleInputChange}
                                className="input-field"
                                rows="3"
                                placeholder="Special instructions, how to take, with/without food, etc."
                            ></textarea>
                        </div>
                    </div>

                    {/* Reminder Settings */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                        <h3 className="text-lg font-semibold text-zinc-900 mb-4">Reminder Settings</h3>
                        <p className="text-sm text-zinc-600 mb-4">
                            Choose how you want to receive reminders for this medicine
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="smsReminder"
                                    name="smsReminder"
                                    checked={formData.smsReminder}
                                    onChange={handleInputChange}
                                    className="w-5 h-5 text-slate-800 border-zinc-300 rounded focus:ring-slate-800 cursor-pointer"
                                />
                                <label htmlFor="smsReminder" className="text-sm font-medium text-zinc-700 cursor-pointer flex items-center gap-2">
                                    <span className="text-lg">📱</span>
                                    SMS Reminders
                                </label>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="emailReminder"
                                    name="emailReminder"
                                    checked={formData.emailReminder}
                                    onChange={handleInputChange}
                                    className="w-5 h-5 text-slate-800 border-zinc-300 rounded focus:ring-slate-800 cursor-pointer"
                                />
                                <label htmlFor="emailReminder" className="text-sm font-medium text-zinc-700 cursor-pointer flex items-center gap-2">
                                    <span className="text-lg">📧</span>
                                    Email Reminders
                                </label>
                            </div>
                            {!formData.smsReminder && !formData.emailReminder && (
                                <p className="text-xs text-amber-600 italic">
                                    ⚠️ No reminders selected. You won't receive notifications for this medicine.
                                </p>
                            )}
                        </div>
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
                            {loading ? "Adding..." : "Add Medicine & Set Reminders"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
