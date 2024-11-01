"use client";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// import Link from "next/link"; // Import the Link component for navigation
import { FaHome, FaUsers, FaClipboardList, FaChartBar, FaTrophy, FaCog, FaQuestionCircle, FaBars, FaTimes } from "react-icons/fa";

import { PiUsersThreeFill } from "react-icons/pi";
// import { useParams, useRouter } from "next/navigation";
// import { useSession } from "@/app/store/session";
// Define the prop types
interface AdminSidebarProps {
    sidebarOpen: boolean;
    toggleSidebar: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ sidebarOpen, toggleSidebar }) => {

    const sidebarItems = [
        {
            icon: <FaHome className="w-5 h-5" />,
            text: "Dashboard Overview",
            description: "Main dashboard view",
            to:`/admin/dashboard`,
        },
        {
            icon: <FaUsers className="w-5 h-5" />,
            text: "User Management",
            description: "Manage students, teachers, and HODs",
            to:`/admin/users`,
        },
        {
            icon: <FaClipboardList className="w-5 h-5" />,
            text: "Exam Management",
            description: "Create and schedule exams",
            to:`/admin/dashboard/exam`,
        },
        {
            icon: <FaChartBar className="w-5 h-5" />,
            text: "Results & Analytics",
            description: "View performance metrics",
            to:`/admin/results`,
        },
        {
            icon: <FaTrophy className="w-5 h-5" />,
            text: "Leaderboard",
            description: "Manage student rankings",
            to:`/admin/leaderboard`,
        },
        {
            icon: <FaCog className="w-5 h-5" />,
            text: "Settings",
            description: "System configuration",
            to:`/admin/settings`,
        },
        {
            icon: <FaQuestionCircle className="w-5 h-5" />,
            text: "Support & Docs",
            description: "Help and documentation",
            to:`/admin/help`,
        }
    ];

    return (
        <>
            {/* Sidebar */}
            <aside
                className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    } fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between h-16 bg-gray-900 px-4">
                    <h1 className="text-xl font-bold">Admin Dashboard</h1>
                    <button
                        className="text-white lg:hidden"
                        onClick={toggleSidebar} // Trigger close on click
                    >
                        <FaTimes className="w-6 h-6" />
                    </button>
                </div>

                {/* Navigation Menu */}
                <nav className="mt-8">
                    <ul>
                        {sidebarItems.map((item, index) => (
                            <li key={index}>
                                <Link
                                    to={item?.to}
                                    className="flex items-center px-6 py-3 text-gray-300 hover:bg-blue-700 hover:text-white transition-colors duration-200"
                                >
                                    <span className="mr-3">{item.icon}</span>
                                    <div className="ml-4">
                                        <p className="font-medium">{item.text}</p>
                                        <p className="text-xs text-gray-400">{item.description}</p>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>
        </>
    );
};

export default AdminSidebar;