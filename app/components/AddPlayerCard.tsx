"use client";

import { useState } from "react";
import { RolePricing } from "../lib/api/types";

export default function AddPlayerCard({
    roles,
    loading,
    onSubmit,
}: {
    roles: RolePricing[];
    loading: boolean;
    onSubmit: (data: any) => void;
}) {
    const [form, setForm] = useState({
        fullName: "",
        role: "",
        basePrice: 0,
        biddingPrice: 0,
        image: null as File | null,
    });

    const handleRoleChange = (role: string) => {
        const pricing = roles.find(r => r.role === role);
        setForm(prev => ({
            ...prev,
            role,
            basePrice: pricing?.basePrice || 0,
            biddingPrice: pricing?.biddingPrice || 0,
        }));
    };

    return (
        <div className="sticky top-24 p-5 rounded-xl bg-[#020617] border border-white/10">
            <h3 className="font-semibold mb-4">Add Player</h3>

            <div className="space-y-3">
                <input
                    className="input"
                    placeholder="Player Name"
                    value={form.fullName}
                    onChange={e =>
                        setForm({ ...form, fullName: e.target.value })
                    }
                />

                <select
                    className="input"
                    value={form.role}
                    onChange={e => handleRoleChange(e.target.value)}
                >
                    <option value="">Select Role</option>
                    {roles.map(r => (
                        <option key={r._id} value={r.role}>
                            {r.role}
                        </option>
                    ))}
                </select>

                <input className="input" disabled value={form.basePrice} />
                <input className="input" disabled value={form.biddingPrice} />

                <input
                    type="file"
                    onChange={e =>
                        setForm({
                            ...form,
                            image: e.target.files?.[0] || null,
                        })
                    }
                />

                <button
                    className="w-full bg-yellow-500 text-black py-2 rounded-md"
                    disabled={loading}
                    onClick={() => onSubmit(form)}
                >
                    {loading ? "Adding..." : "Add Player"}
                </button>
            </div>
        </div>
    );
}
