import React, { useState, useRef, useEffect } from "react";
import { MdDownload, MdPause, MdPlayArrow, MdClear, MdArrowBack, MdInfoOutline, MdWarningAmber, MdErrorOutline, MdCheckCircleOutline, MdExpandMore, MdSearch, MdDateRange, MdFiberManualRecord, MdAutorenew, MdList, MdPauseCircle, MdPlayCircle, MdUpdate } from "react-icons/md";
import { Line, Pie } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";
import io from 'socket.io-client';
import { useAuth } from "../../store/auth";
import { Link } from "react-router-dom";

const LiveLogsViewer = () => {
    const [isPaused, setIsPaused] = useState(false);
    const [logs, setLogs] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLevels, setSelectedLevels] = useState(["info", "warning", "error", "success"]);
    const [dateRange, setDateRange] = useState({ start: "", end: "" });
    const [isLoading, setIsLoading] = useState(false);
    const logsContainerRef = useRef(null);
    const { user, isLoggedIn, authorizationToken, API } = useAuth();
    const socketRef = useRef();

    // Helper to extract log level from a log line
    const extractLevel = (log) => {
        if (/error/i.test(log)) return "error";
        if (/warn/i.test(log)) return "warning";
        if (/success/i.test(log)) return "success";
        if (/info/i.test(log)) return "info";
        return "info";
    };

    // Helper to extract timestamp from a log line (assumes ISO or similar at start)
    const extractTimestamp = (log) => {
        const match = log.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z)/);
        return match ? match[1] : null;
    };

    // Socket.io logic
    useEffect(() => {
        if (!socketRef.current) {
            socketRef.current = io(API, {
                reconnection: true,
                reconnectionAttempts: 10,
                reconnectionDelay: 2000,
                reconnectionDelayMax: 10000,
                transports: ['websocket', 'polling'],
                withCredentials: true,
            });
        }
        const socket = socketRef.current;
        socket.on('log-update', (logsStr) => {
            if (typeof logsStr !== "string" || isPaused) return;
            const newLogs = logsStr.split('\n').filter((log) => log.trim() !== '');
            setLogs((prevLogs) => {
                const updatedLogs = [...newLogs, ...prevLogs].slice(0, 2000);
                return updatedLogs;
            });
        });
        return () => {
            if (socket) socket.off('log-update');
        };
    }, [API, isPaused]);

    useEffect(() => {
        const socket = socketRef.current;
        if (!socket) return;

        socket.on('log-action-result', (result) => {
            alert(result.message); // Replace with toast if desired
        });

        socket.on('log-download', (logData) => {
            const blob = new Blob([logData], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'app.log';
            a.click();
            URL.revokeObjectURL(url);
        });

        return () => {
            socket.off('log-action-result');
            socket.off('log-download');
        };
    }, []);

    // Clear logs
    const handleClear = () => setLogs([]);

    // Filter logs by search, level, and date
    const filteredLogs = logs.filter((log) => {
        // Level filter
        const level = extractLevel(log);
        if (!selectedLevels.includes(level)) return false;
        // Search filter
        if (searchQuery && !log.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        // Date filter
        if (dateRange.start || dateRange.end) {
            const ts = extractTimestamp(log);
            if (!ts) return false;
            const logDate = new Date(ts);
            if (dateRange.start && logDate < new Date(dateRange.start)) return false;
            if (dateRange.end && logDate > new Date(dateRange.end)) return false;
        }
        return true;
    });

    // Scroll to bottom when logs update and not paused
    useEffect(() => {
        if (!isPaused && logsContainerRef.current) {
            logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
        }
    }, [filteredLogs, isPaused]);

    // Analytics: Pie chart for log levels
    const levelCounts = filteredLogs.reduce((acc, log) => {
        const level = extractLevel(log);
        acc[level] = (acc[level] || 0) + 1;
        return acc;
    }, {});
    const chartData = {
        labels: ["Info", "Warning", "Error", "Success"],
        datasets: [{
            data: [levelCounts.info || 0, levelCounts.warning || 0, levelCounts.error || 0, levelCounts.success || 0],
            backgroundColor: ["#3B82F6", "#F59E0B", "#EF4444", "#10B981"]
        }]
    };
    // Analytics: Line chart for logs over time (by hour)
    const logsByHour = {};
    filteredLogs.forEach((log) => {
        const ts = extractTimestamp(log);
        if (ts) {
            const hour = ts.slice(0, 13); // YYYY-MM-DDTHH
            logsByHour[hour] = (logsByHour[hour] || 0) + 1;
        }
    });
    const lineLabels = Object.keys(logsByHour).sort();
    const lineChartData = {
        labels: lineLabels,
        datasets: [{
            label: "Logs Over Time",
            data: lineLabels.map((h) => logsByHour[h]),
            borderColor: "#F72585",
            tension: 0.4
        }]
    };

    const dummyLogs = [
        { id: 1, level: "info", message: "Application started successfully", timestamp: new Date().toISOString() },
        { id: 2, level: "warning", message: "Memory usage above 80%", timestamp: new Date().toISOString() },
        { id: 3, level: "error", message: "Database connection failed", timestamp: new Date().toISOString() },
        { id: 4, level: "success", message: "Backup completed successfully", timestamp: new Date().toISOString() }
    ];

    const scrollToBottom = () => {
        if (logsContainerRef.current) {
            logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
        }
    };

    const getLogIcon = (level) => {
        switch (level) {
            case "info": return <MdInfoOutline className="text-blue-500" />;
            case "warning": return <MdWarningAmber className="text-yellow-500" />;
            case "error": return <MdErrorOutline className="text-red-500" />;
            case "success": return <MdCheckCircleOutline className="text-green-500" />;
            default: return null;
        }
    };

    const getLogTextColor = (level) => {
        switch (level) {
            case "info": return "text-blue-500";
            case "warning": return "text-yellow-500";
            case "error": return "text-red-500";
            case "success": return "text-green-500";
            default: return "text-white";
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <h1 className="text-[28px] font-semibold mb-4 md:mb-0">Live Logs Viewer</h1>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => socketRef.current && socketRef.current.emit('download-logs')}
                        className="bg-[#F72585] hover:bg-opacity-80 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all">
                        <MdDownload /> Download Logs
                    </button>
                    <button
                        onClick={() => setIsPaused(!isPaused)}
                        className="bg-[#3A0CA3] hover:bg-opacity-80 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
                    >
                        {isPaused ? <MdPlayArrow /> : <MdPause />}
                        {isPaused ? "Resume" : "Pause"}
                    </button>
                    <button
                        onClick={() => socketRef.current && socketRef.current.emit('clear-logs')}
                        className="bg-[#FF4C4C] hover:bg-opacity-80 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all">
                        <MdClear /> Clear
                    </button>
                    <Link to={`/developer/dev/dashboard`}>
                        <button className="bg-[#F0F1F3] text-[#3A0CA3] px-4 py-2 rounded-lg flex items-center gap-2 transition-all">
                            <MdArrowBack /> Back
                        </button>
                    </Link>
                </div>
            </div>

            {/* Filters Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="relative">
                    <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search logs..."
                        className="w-full bg-gray-800 border border-[#E0E0E0] rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#F72585]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-4">
                    <input
                        type="date"
                        className="bg-gray-800 border border-[#E0E0E0] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#F72585]"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    />
                    <input
                        type="date"
                        className="bg-gray-800 border border-[#E0E0E0] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#F72585]"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    />
                </div>
                <div className="flex gap-2">
                    {["info", "warning", "error", "success"].map((level, index) => (
                        <button
                            key={index}
                            className={`px-3 py-1 rounded-lg flex items-center gap-1 ${selectedLevels.includes(level) ? "bg-[#3A0CA3]" : "bg-gray-800"}`}
                            onClick={() => setSelectedLevels(prev =>
                                prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
                            )}
                        >
                            {getLogIcon(level)} {level.charAt(0).toUpperCase() + level.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Logs Display Area */}
            <div
                ref={logsContainerRef}
                className="bg-gray-800 rounded-lg p-4 h-[400px] overflow-y-auto mb-6 font-mono relative"
            >
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <MdAutorenew className="animate-spin text-4xl" />
                    </div>
                ) : (
                    filteredLogs.map((log, index) => (
                        <div key={index} className="flex items-start gap-2 mb-2 whitespace-pre font-mono text-sm">
                            <span className="text-white">{log}</span>
                        </div>
                    ))
                )}
                <button
                    onClick={() => {
                        if (logsContainerRef.current) logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
                    }}
                    className="absolute bottom-4 right-4 bg-[#3A0CA3] hover:bg-opacity-80 p-2 rounded-full shadow-lg transition-all"
                >
                    <MdExpandMore />
                </button>
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Log Level Distribution</h3>
                    <div className="h-[200px]">
                        <Pie data={chartData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Logs Over Time</h3>
                    <div className="h-[200px]">
                        <Line data={lineChartData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-[#E0E0E0] p-4">
                <div className="flex justify-between items-center max-w-7xl mx-auto">
                    <div className="flex items-center gap-2">
                        <MdList />
                        <span>Total Logs: {filteredLogs.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {isPaused ? <MdPauseCircle className="text-yellow-500" /> : <MdPlayCircle className="text-green-500" />}
                        <span>{isPaused ? "Paused" : "Live"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MdUpdate />
                        <span>Last Updated: {new Date().toLocaleTimeString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveLogsViewer;