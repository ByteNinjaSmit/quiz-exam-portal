import React, { useState, useEffect } from "react";
import { FaHome, FaUsers, FaClipboardList, FaChartBar, FaTrophy, FaCog, FaQuestionCircle, FaBars, FaTimes } from "react-icons/fa";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";

const AdminSidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [activeItem, setActiveItem] = useState("Dashboard Overview");

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
            if (window.innerWidth > 768) {
                setShowMobileMenu(false);
            }
        };

        window.addEventListener("resize", handleResize);
        handleResize();

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const menuItems = [
        {
            icon: <FaHome className="w-5 h-5" />,
            label: "Dashboard Overview",
            description: "Main dashboard view"
        },
        {
            icon: <FaUsers className="w-5 h-5" />,
            label: "User Management",
            description: "Manage students, teachers, and HODs"
        },
        {
            icon: <FaClipboardList className="w-5 h-5" />,
            label: "Exam Management",
            description: "Create and schedule exams"
        },
        {
            icon: <FaClipboardList className="w-5 h-5" />,
            label: "Coding Problem Managment",
            description: "Create and schedule exams"
        },
        {
            icon: <FaChartBar className="w-5 h-5" />,
            label: "Results & Analytics",
            description: "View performance metrics"
        },
        {
            icon: <FaTrophy className="w-5 h-5" />,
            label: "Leaderboard",
            description: "Manage student rankings"
        },
        {
            icon: <FaCog className="w-5 h-5" />,
            label: "Settings",
            description: "System configuration"
        },
        {
            icon: <FaQuestionCircle className="w-5 h-5" />,
            label: "Support & Docs",
            description: "Help and documentation"
        }
    ];

    const handleItemClick = (label) => {
        setActiveItem(label);
        if (isMobile) {
            setShowMobileMenu(false);
        }
    };

    const renderMobileButton = () => (
        <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="fixed top-[4rem] left-4 z-50 p-2 rounded-lg bg-blue-600 text-white lg:hidden"
        >
            {showMobileMenu ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
    );

    const sidebarClasses = `
    fixed left-0 h-[calc(100vh-4rem)] bg-gray-900 text-white transition-all duration-300 ease-in-out
    ${isMobile ? (showMobileMenu ? "w-64 translate-x-0" : "w-64 -translate-x-full") :
            isCollapsed ? "w-20" : "w-64"}
    ${isMobile ? "z-40" : "z-30"}
    top-[4rem]
  `;

    return (
        <>
            {isMobile && renderMobileButton()}
            <div className={sidebarClasses}>
                <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
                    <h1 className={`font-bold ${isCollapsed ? "hidden" : "block"}`}>Admin Panel</h1>

                    {!isMobile && (
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className={`p-2 rounded-lg transition-all duration-200 ease-in-out
            ${isCollapsed ? "hover:bg-gray-700 bg-gray-800" : "hover:bg-gray-700 bg-gray-900"}
            ${isCollapsed ? "ml-0" : "ml-auto"}`}
                            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            {isCollapsed ? <BiChevronRight size={24} /> : <BiChevronLeft size={24} />}
                        </button>
                    )}
                </div>

                <nav className="mt-4">
                    {menuItems.map((item, index) => (
                        <div
                            key={index}
                            onClick={() => handleItemClick(item.label)}
                            className={`
                        relative flex items-center p-4 cursor-pointer
                        ${activeItem === item.label ? "bg-blue-600" : "hover:bg-gray-800"}
                        ${isCollapsed ? "justify-center" : ""}
                        transition-colors duration-200
                        `}
                        >
                            <div className={`${isCollapsed ? "tooltip-trigger" : ""}`}>
                                {item.icon}
                                {isCollapsed && (
                                    <div className="tooltip absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                        {item.label}
                                    </div>
                                )}
                            </div>

                            {!isCollapsed && (
                                <div className="ml-4">
                                    <p className="font-medium">{item.label}</p>
                                    <p className="text-sm text-gray-400">{item.description}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </nav>
            </div>

        </>
    );
};

export default AdminSidebar;
