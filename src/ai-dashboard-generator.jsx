import React, { useState, useMemo, useCallback } from 'react';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import {
    Upload, AlertCircle, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
    Search, Settings, X, FileSpreadsheet, Layers, CheckCircle2, AlertTriangle,
    Info, BarChart3, Table2, Users, UserCheck, FolderOpen, Calendar, Zap,
    Filter, DollarSign, Palette, ArrowRight, ArrowLeft, Download,
    HelpCircle, Database, Activity, FileText, Clock, Target, Award,
    Video, Camera, Stethoscope, Code, Scale, Globe, FileEdit,
    MessageSquare, Send, Sparkles, Home, Menu, ExternalLink
} from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

// Project type configurations
const PROJECT_TYPES = {
    video_generation: {
        name: 'Video Generation',
        icon: Video,
        description: 'Video editing, T2V, V2V, PV2V projects',
        commonFields: {
            expertId: ['srt_id', 'expert_id', 'writer_id', 'worker_id'],
            score: ['score', 'rating', 'quality_score'],
            reviewer: ['auditor', 'reviewer', 'qa_reviewer'],
            category: ['error_category', 'error_type', 'category'],
            timestamp: ['timestamp', 'date', 'created_at']
        }
    },
    photography: {
        name: 'Photography',
        icon: Camera,
        description: 'Image annotation, photo review projects',
        commonFields: {
            expertId: ['name', 'expert_name', 'photographer'],
            score: ['approve', 'approval', 'status'],
            reviewer: ['reviewer', 'reviewer_name'],
            category: ['category', 'pick_category'],
            timestamp: ['timestamp', 'date']
        }
    },
    medical: {
        name: 'Medical/Healthcare',
        icon: Stethoscope,
        description: 'Medical data annotation, clinical reviews',
        commonFields: {
            expertId: ['annotator', 'expert_id', 'clinician_id'],
            score: ['accuracy', 'score', 'validation'],
            reviewer: ['reviewer', 'validator'],
            category: ['condition', 'category'],
            timestamp: ['timestamp', 'review_date']
        }
    },
    coding: {
        name: 'Coding/Programming',
        icon: Code,
        description: 'Code review, programming annotation',
        commonFields: {
            expertId: ['coder_id', 'developer', 'expert_id'],
            score: ['score', 'rating', 'correctness'],
            reviewer: ['reviewer', 'auditor'],
            category: ['language', 'error_type'],
            timestamp: ['timestamp', 'submitted_at']
        }
    },
    legal: {
        name: 'Legal',
        icon: Scale,
        description: 'Legal document annotation',
        commonFields: {
            expertId: ['analyst_id', 'expert_id'],
            score: ['accuracy', 'score'],
            reviewer: ['qa_reviewer', 'auditor'],
            category: ['document_type', 'category'],
            timestamp: ['timestamp', 'date']
        }
    },
    language: {
        name: 'Language/Translation',
        icon: Globe,
        description: 'Translation, transcription',
        commonFields: {
            expertId: ['translator_id', 'linguist'],
            score: ['score', 'quality'],
            reviewer: ['reviewer', 'proofreader'],
            category: ['language_pair', 'category'],
            timestamp: ['timestamp', 'date']
        }
    },
    general: {
        name: 'General Annotation',
        icon: FileEdit,
        description: 'General data labeling',
        commonFields: {
            expertId: ['expert_id', 'worker_id', 'name'],
            score: ['score', 'rating', 'status'],
            reviewer: ['reviewer', 'auditor'],
            category: ['category', 'type'],
            timestamp: ['timestamp', 'date']
        }
    }
};

// Quality measurement types
const QUALITY_TYPES = {
    numeric_1_5: {
        name: 'Numeric Score (1-5)',
        description: 'Scores like 1, 3, 5',
        isNumeric: true,
        minValue: 1,
        maxValue: 5,
        defaultFailThreshold: 2.5,  // Below this = fail
        defaultMinorThreshold: 3.5, // Below this (but above fail) = minor
        // Anything >= minorThreshold = pass
    },
    numeric_1_3: {
        name: 'Numeric Score (1-3)',
        description: 'Simple 1, 2, 3 scoring',
        isNumeric: true,
        minValue: 1,
        maxValue: 3,
        defaultFailThreshold: 1.5,
        defaultMinorThreshold: 2.5,
    },
    percentage: {
        name: 'Percentage (0-100%)',
        description: 'Percentage scores',
        isNumeric: true,
        minValue: 0,
        maxValue: 100,
        defaultFailThreshold: 60,
        defaultMinorThreshold: 80,
    },
    numeric_0_100: {
        name: 'Numeric Score (0-100)',
        description: '0-100 point scale',
        isNumeric: true,
        minValue: 0,
        maxValue: 100,
        defaultFailThreshold: 70,
        defaultMinorThreshold: 85,
    },
    pass_fail: {
        name: 'Pass/Fail',
        description: 'Binary pass or fail',
        defaultPass: ['pass', 'approved', 'yes'],
        defaultMinor: [],
        defaultFail: ['fail', 'rejected', 'no']
    },
    multi_tier: {
        name: 'Multi-Tier Status',
        description: 'Strong pass, weak pass, reject',
        defaultPass: ['strong pass', 'pass'],
        defaultMinor: ['weak pass'],
        defaultFail: ['fail', 'rejected', 'no']
    },
    multi_dimension: {
        name: 'Multiple Dimensions',
        description: 'Good/Bad for each aspect',
        defaultPass: ['good', 'yes'],
        defaultMinor: [],
        defaultFail: ['bad', 'no']
    }
};

const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#F97316', '#EAB308', '#22C55E', '#14B8A6', '#06B6D4', '#3B82F6'];

// Header Component
function Header({ onNavigateHome, showNav = false }) {
    return (
        <header className="relative z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <BarChart3 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">QA Dashboard Generator</h1>
                            <p className="text-xs text-slate-500">Powered by AI</p>
                        </div>
                    </div>
                    {showNav && (
                        <button
                            onClick={onNavigateHome}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm text-slate-300 transition-all"
                        >
                            <Home className="h-4 w-4" />
                            Home
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}

// Footer Component
function Footer() {
    return (
        <footer className="relative z-10 border-t border-white/10 bg-slate-950/90 backdrop-blur-xl mt-auto">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="text-center">
                    <p className="text-sm text-slate-400 mb-2">
                        Conceptualized, Designed, Engineered, and Deployed by
                    </p>
                    <a
                        href="https://tammyhartline.tech"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                    >
                        AI Engineer, Tammy Hartline
                        <ExternalLink className="h-3 w-3" />
                    </a>
                    <p className="text-xs text-slate-600 mt-2">© 2025 All Rights Reserved</p>
                </div>
            </div>
        </footer>
    );
}

// Landing Page Component
function LandingPage({ onGetStarted }) {
    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col">
            <Header />

            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-indigo-500/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-500/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <main className="relative z-10 flex-1 flex items-center">
                <div className="max-w-7xl mx-auto px-6 py-20">
                    {/* Hero Section */}
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-indigo-300 text-sm mb-6">
                            <Sparkles className="h-4 w-4" />
                            AI-Powered Analytics Platform
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
                            Transform QA Data into
                            <br />
                            Actionable Insights
                        </h1>
                        <p className="text-xl text-slate-400 mb-12 max-w-3xl mx-auto">
                            Upload your quality assurance data and let AI guide you through creating comprehensive,
                            customized dashboards with advanced analytics and beautiful visualizations.
                        </p>
                        <button
                            onClick={onGetStarted}
                            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl text-white font-medium text-lg shadow-2xl shadow-indigo-500/30 transition-all transform hover:scale-105"
                        >
                            Get Started
                            <ArrowRight className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-8 hover:border-indigo-500/50 transition-all">
                            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                                <Upload className="h-7 w-7 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">Multi-File Support</h3>
                            <p className="text-slate-400">
                                Upload multiple CSV or Excel files and intelligently join them using common fields like Expert ID.
                            </p>
                        </div>

                        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-8 hover:border-emerald-500/50 transition-all">
                            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-4">
                                <Sparkles className="h-7 w-7 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">AI-Guided Setup</h3>
                            <p className="text-slate-400">
                                Intelligent wizard automatically detects columns and suggests configurations based on your project type.
                            </p>
                        </div>

                        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-8 hover:border-cyan-500/50 transition-all">
                            <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                                <BarChart3 className="h-7 w-7 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">Rich Analytics</h3>
                            <p className="text-slate-400">
                                Expert performance tracking, category breakdowns, trend analysis, and exportable reports.
                            </p>
                        </div>
                    </div>

                    {/* Capabilities */}
                    <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-12">
                        <h2 className="text-3xl font-bold text-white mb-8 text-center">Built for Quality Professionals</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start gap-4">
                                <CheckCircle2 className="h-6 w-6 text-emerald-400 flex-shrink-0 mt-1" />
                                <div>
                                    <h4 className="text-white font-semibold mb-1">Video Generation & Media QA</h4>
                                    <p className="text-slate-400 text-sm">Track T2V, V2V, PV2V projects with expert consensus metrics</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <CheckCircle2 className="h-6 w-6 text-emerald-400 flex-shrink-0 mt-1" />
                                <div>
                                    <h4 className="text-white font-semibold mb-1">Medical & Healthcare Annotation</h4>
                                    <p className="text-slate-400 text-sm">Clinical review workflows with validation tracking</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <CheckCircle2 className="h-6 w-6 text-emerald-400 flex-shrink-0 mt-1" />
                                <div>
                                    <h4 className="text-white font-semibold mb-1">Code Review & Programming</h4>
                                    <p className="text-slate-400 text-sm">Developer performance and correctness metrics</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <CheckCircle2 className="h-6 w-6 text-emerald-400 flex-shrink-0 mt-1" />
                                <div>
                                    <h4 className="text-white font-semibold mb-1">Legal, Translation & More</h4>
                                    <p className="text-slate-400 text-sm">Customizable for any annotation or QA workflow</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

// Metric card component
function MetricCard({ title, value, subtitle, icon: Icon, color = 'indigo' }) {
    const colorClasses = {
        indigo: 'from-indigo-500 to-purple-600',
        emerald: 'from-emerald-500 to-teal-600',
        rose: 'from-rose-500 to-pink-600',
        amber: 'from-amber-500 to-orange-600',
        cyan: 'from-cyan-500 to-blue-600'
    };

    return (
        <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-2xl p-5 text-white shadow-xl`}>
            <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                </div>
            </div>
            <div className="text-3xl font-bold mb-1">{value}</div>
            <div className="text-sm opacity-80">{title}</div>
            {subtitle && <div className="text-xs opacity-60 mt-1">{subtitle}</div>}
        </div>
    );
}

// Data table component
function DataTable({ data, title, columns, searchable = true }) {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'desc' });
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 25;

    const headers = useMemo(() => {
        if (!data || data.length === 0) return [];
        return columns || Object.keys(data[0]);
    }, [data, columns]);

    const sortedData = useMemo(() => {
        if (!data || data.length === 0) return [];
        let sorted = [...data];
        if (sortConfig.key) {
            sorted.sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];
                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return sortConfig.direction === 'desc' ? bVal - aVal : aVal - bVal;
                }
                return sortConfig.direction === 'desc'
                    ? String(bVal).localeCompare(String(aVal))
                    : String(aVal).localeCompare(String(bVal));
            });
        }
        return sorted;
    }, [data, sortConfig]);

    const filteredData = useMemo(() => {
        if (!searchTerm) return sortedData;
        return sortedData.filter(row =>
            Object.values(row).some(val =>
                String(val).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [sortedData, searchTerm]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        return filteredData.slice(start, start + rowsPerPage);
    }, [filteredData, currentPage]);

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    // Early return AFTER all hooks
    if (!data || data.length === 0) return null;

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    const formatValue = (value, header) => {
        if (value === null || value === undefined) return '-';
        if (typeof value === 'number') {
            const h = header.toLowerCase();
            if (h.includes('rate') || h.includes('%')) return `${value.toFixed(1)}%`;
            if (h.includes('pay') || h.includes('$')) return `$${value.toFixed(2)}`;
            return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
        }
        return value;
    };

    const getCellStyle = (value, header) => {
        if (typeof value !== 'number') return {};
        const h = header.toLowerCase();
        if (h.includes('rate') || h.includes('%')) {
            if (h.includes('defect') || h.includes('fail')) {
                if (value <= 10) return { color: '#10b981', fontWeight: 600 };
                if (value <= 20) return { color: '#f59e0b', fontWeight: 600 };
                return { color: '#ef4444', fontWeight: 600 };
            } else {
                if (value >= 80) return { color: '#10b981', fontWeight: 600 };
                if (value >= 60) return { color: '#f59e0b', fontWeight: 600 };
                return { color: '#ef4444', fontWeight: 600 };
            }
        }
        return {};
    };

    return (
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 bg-white/5">
                <div className="flex justify-between items-center flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Table2 className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">{title}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                        {searchable && (
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                    className="pl-9 pr-4 py-2 w-48 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                />
                            </div>
                        )}
                        <span className="text-sm text-slate-400 bg-white/5 px-3 py-1.5 rounded-full">{filteredData.length} rows</span>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            {headers.map(header => (
                                <th
                                    key={header}
                                    onClick={() => handleSort(header)}
                                    className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors whitespace-nowrap"
                                >
                                    <div className="flex items-center gap-1">
                                        {header}
                                        {sortConfig.key === header && (
                                            sortConfig.direction === 'desc'
                                                ? <ChevronDown className="h-3 w-3 text-indigo-400" />
                                                : <ChevronUp className="h-3 w-3 text-indigo-400" />
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {paginatedData.map((row, idx) => (
                            <tr key={idx} className="hover:bg-white/5 transition-colors">
                                {headers.map(header => (
                                    <td
                                        key={header}
                                        className="px-4 py-3 text-sm text-slate-300 whitespace-nowrap"
                                        style={getCellStyle(row[header], header)}
                                    >
                                        {formatValue(row[header], header)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="px-6 py-3 bg-white/5 border-t border-white/10 flex justify-between items-center">
                    <span className="text-sm text-slate-400">Page {currentPage} of {totalPages}</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 bg-white/10 rounded-lg text-sm text-white disabled:opacity-50 hover:bg-white/20"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 bg-white/10 rounded-lg text-sm text-white disabled:opacity-50 hover:bg-white/20"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Sheet Selector Component - responsive and non-overlapping
function SheetSelector({ sheets, selectedSheet, onSheetChange }) {
    const [showDropdown, setShowDropdown] = useState(false);
    const scrollContainerRef = React.useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScroll = useCallback(() => {
        const container = scrollContainerRef.current;
        if (container) {
            setCanScrollLeft(container.scrollLeft > 0);
            setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 1);
        }
    }, []);

    React.useEffect(() => {
        checkScroll();
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScroll);
        }
        window.addEventListener('resize', checkScroll);
        return () => {
            if (container) container.removeEventListener('scroll', checkScroll);
            window.removeEventListener('resize', checkScroll);
        };
    }, [checkScroll, sheets]);

    const scroll = (direction) => {
        const container = scrollContainerRef.current;
        if (container) {
            const scrollAmount = 200;
            container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="w-full mb-6">
            <div className="bg-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg">
                <div className="flex items-center">
                    {/* Left scroll arrow */}
                    <button
                        onClick={() => scroll('left')}
                        disabled={!canScrollLeft}
                        className={`flex-shrink-0 px-2 py-3 transition-colors border-r border-white/10 ${canScrollLeft ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-700 cursor-default'
                            }`}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    {/* Scrollable sheet tabs */}
                    <div
                        ref={scrollContainerRef}
                        className="flex-1 flex gap-1.5 py-2 px-2 overflow-x-auto"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
                    >
                        {sheets.map(sheet => (
                            <button
                                key={sheet}
                                onClick={() => onSheetChange(sheet)}
                                className={`px-3 py-2 rounded-lg text-sm transition-all whitespace-nowrap flex-shrink-0 ${selectedSheet === sheet
                                    ? 'bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-500/25'
                                    : 'bg-white/5 text-slate-300 hover:bg-white/15 hover:text-white'
                                    }`}
                                title={sheet}
                            >
                                {sheet.length > 18 ? sheet.substring(0, 16) + '...' : sheet}
                            </button>
                        ))}
                    </div>

                    {/* Right scroll arrow */}
                    <button
                        onClick={() => scroll('right')}
                        disabled={!canScrollRight}
                        className={`flex-shrink-0 px-2 py-3 transition-colors border-l border-white/10 ${canScrollRight ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-700 cursor-default'
                            }`}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>

                    {/* Dropdown for all sheets */}
                    <div className="relative flex-shrink-0 border-l border-white/10">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="px-3 py-3 text-slate-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5 rounded-r-xl"
                            title={`View all ${sheets.length} sheets`}
                        >
                            <Layers className="h-4 w-4" />
                            <span className="text-xs font-medium hidden sm:inline">{sheets.length}</span>
                            <ChevronDown className={`h-3 w-3 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown menu */}
                        {showDropdown && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                                <div className="absolute right-0 top-full mt-2 w-72 max-h-[60vh] overflow-y-auto bg-slate-800 border border-white/10 rounded-xl shadow-2xl z-50">
                                    <div className="sticky top-0 p-3 border-b border-white/10 bg-slate-800">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-white">All Sheets</span>
                                            <span className="text-xs text-slate-500 bg-white/10 px-2 py-0.5 rounded-full">{sheets.length}</span>
                                        </div>
                                    </div>
                                    <div className="p-2">
                                        {sheets.map((sheet, idx) => (
                                            <button
                                                key={sheet}
                                                onClick={() => { onSheetChange(sheet); setShowDropdown(false); }}
                                                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center gap-3 ${selectedSheet === sheet
                                                    ? 'bg-indigo-500 text-white'
                                                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                                                    }`}
                                            >
                                                <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-medium ${selectedSheet === sheet ? 'bg-white/20' : 'bg-white/10 text-slate-400'
                                                    }`}>
                                                    {idx + 1}
                                                </span>
                                                <span className="truncate flex-1" title={sheet}>{sheet}</span>
                                                {selectedSheet === sheet && <CheckCircle2 className="h-4 w-4 flex-shrink-0" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Current selection - compact inline display */}
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>Working with:</span>
                <span className="text-indigo-400 font-medium truncate max-w-[200px] sm:max-w-none" title={selectedSheet}>
                    {selectedSheet}
                </span>
            </div>
        </div>
    );
}

// Export Menu Component
function ExportMenu({ metrics, expertPerformance, categoryBreakdown, reviewerStats, processedData, config, fileName }) {
    const [showMenu, setShowMenu] = useState(false);
    const [exporting, setExporting] = useState(false);

    const generateCSV = (data, headers) => {
        if (!data || data.length === 0) return '';
        const csvHeaders = headers || Object.keys(data[0]);
        const rows = data.map(row =>
            csvHeaders.map(h => {
                const val = row[h];
                if (val === null || val === undefined) return '';
                const str = String(val);
                // Escape quotes and wrap in quotes if contains comma or quote
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            }).join(',')
        );
        return [csvHeaders.join(','), ...rows].join('\n');
    };

    const downloadFile = (content, filename, type) => {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const exportSummary = () => {
        const summary = [
            '# QA Dashboard Summary Report',
            `Generated: ${new Date().toLocaleString()}`,
            `Source File: ${fileName}`,
            '',
            '## Key Metrics',
            `- Total Records: ${metrics.total.toLocaleString()}`,
            `- Valid Records: ${metrics.totalValid.toLocaleString()}`,
            `- Excluded: ${metrics.excluded.toLocaleString()}`,
            `- Approval Rate: ${metrics.approvalRate.toFixed(1)}%`,
            `- Defect Rate: ${metrics.defectRate.toFixed(1)}%`,
            `- Pass Count: ${metrics.passCount.toLocaleString()}`,
            `- Minor Issues: ${metrics.minorCount.toLocaleString()}`,
            `- Fail Count: ${metrics.failCount.toLocaleString()}`,
            '',
            '## Coverage',
            `- Unique Experts: ${metrics.uniqueExperts}`,
            `- Categories: ${metrics.uniqueCategories}`,
            `- Reviewers: ${metrics.uniqueReviewers}`,
            metrics.avgQuality !== null ? `- Average Quality Score: ${metrics.avgQuality.toFixed(1)}%` : '',
            '',
            '## Configuration',
            `- Project Type: ${config.projectType}`,
            `- Quality System: ${config.qualityType}`,
            `- Expert Column: ${config.expertIdColumn}`,
            `- Score Column: ${config.scoreColumn}`,
        ].filter(Boolean).join('\n');

        downloadFile(summary, `${fileName.replace(/\.[^.]+$/, '')}-summary.md`, 'text/markdown');
    };

    const exportExpertData = () => {
        const csv = generateCSV(expertPerformance);
        downloadFile(csv, `${fileName.replace(/\.[^.]+$/, '')}-expert-performance.csv`, 'text/csv');
    };

    const exportCategoryData = () => {
        const csv = generateCSV(categoryBreakdown);
        downloadFile(csv, `${fileName.replace(/\.[^.]+$/, '')}-category-breakdown.csv`, 'text/csv');
    };

    const exportReviewerData = () => {
        const csv = generateCSV(reviewerStats);
        downloadFile(csv, `${fileName.replace(/\.[^.]+$/, '')}-reviewer-stats.csv`, 'text/csv');
    };

    const exportDetailedData = () => {
        const detailedForExport = processedData.slice(0, 10000).map(r => ({
            Date: r.date || '',
            Expert: r.expertId,
            Status: r.status,
            Score: r.score,
            Category: r.category || '',
            Reviewer: r.reviewer || '',
            Excluded: r.isExcluded ? 'Yes' : 'No',
            QualityScore: r.qualityScore !== null ? r.qualityScore.toFixed(1) : ''
        }));
        const csv = generateCSV(detailedForExport);
        downloadFile(csv, `${fileName.replace(/\.[^.]+$/, '')}-detailed-records.csv`, 'text/csv');
    };

    const exportAllToExcel = async () => {
        setExporting(true);
        try {
            // Create workbook with multiple sheets
            const wb = XLSX.utils.book_new();

            // Summary sheet
            const summaryData = [
                ['QA Dashboard Summary Report'],
                ['Generated', new Date().toLocaleString()],
                ['Source File', fileName],
                [''],
                ['Key Metrics'],
                ['Total Records', metrics.total],
                ['Valid Records', metrics.totalValid],
                ['Excluded', metrics.excluded],
                ['Approval Rate', `${metrics.approvalRate.toFixed(1)}%`],
                ['Defect Rate', `${metrics.defectRate.toFixed(1)}%`],
                ['Pass Count', metrics.passCount],
                ['Minor Issues', metrics.minorCount],
                ['Fail Count', metrics.failCount],
                [''],
                ['Coverage'],
                ['Unique Experts', metrics.uniqueExperts],
                ['Categories', metrics.uniqueCategories],
                ['Reviewers', metrics.uniqueReviewers],
            ];
            if (metrics.avgQuality !== null) {
                summaryData.push(['Average Quality Score', `${metrics.avgQuality.toFixed(1)}%`]);
            }
            const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

            // Expert Performance sheet
            if (expertPerformance.length > 0) {
                const wsExpert = XLSX.utils.json_to_sheet(expertPerformance);
                XLSX.utils.book_append_sheet(wb, wsExpert, 'Expert Performance');
            }

            // Category Breakdown sheet
            if (categoryBreakdown.length > 0) {
                const wsCategory = XLSX.utils.json_to_sheet(categoryBreakdown);
                XLSX.utils.book_append_sheet(wb, wsCategory, 'Category Breakdown');
            }

            // Reviewer Stats sheet
            if (reviewerStats.length > 0) {
                const wsReviewer = XLSX.utils.json_to_sheet(reviewerStats);
                XLSX.utils.book_append_sheet(wb, wsReviewer, 'Reviewer Stats');
            }

            // Detailed Records sheet (limit to 10000 rows for performance)
            const detailedForExport = processedData.slice(0, 10000).map(r => ({
                Date: r.date || '',
                Expert: r.expertId,
                Status: r.status,
                Score: r.score,
                Category: r.category || '',
                Reviewer: r.reviewer || '',
                Excluded: r.isExcluded ? 'Yes' : 'No',
                QualityScore: r.qualityScore !== null ? r.qualityScore.toFixed(1) : ''
            }));
            const wsDetailed = XLSX.utils.json_to_sheet(detailedForExport);
            XLSX.utils.book_append_sheet(wb, wsDetailed, 'Detailed Records');

            // Generate and download
            XLSX.writeFile(wb, `${fileName.replace(/\.[^.]+$/, '')}-dashboard-export.xlsx`);
        } catch (error) {
            console.error('Export error:', error);
            alert('Export failed. Please try again.');
        } finally {
            setExporting(false);
            setShowMenu(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl text-sm text-white font-medium transition-all"
            >
                <Download className="h-4 w-4" />
                Export
                <ChevronDown className={`h-3 w-3 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
            </button>

            {showMenu && (
                <>
                    <div className="fixed inset-0 z-[100]" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 top-full mt-2 w-72 bg-slate-800 border border-white/10 rounded-xl shadow-2xl z-[101] overflow-hidden">
                        <div className="p-3 border-b border-white/10 bg-white/5">
                            <span className="text-sm font-medium text-white">Export Dashboard Data</span>
                        </div>

                        <div className="p-2">
                            {/* Full Excel Export */}
                            <button
                                onClick={exportAllToExcel}
                                disabled={exporting}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-white/10 transition-colors group"
                            >
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                    <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-white group-hover:text-emerald-300">
                                        {exporting ? 'Exporting...' : 'Export All (Excel)'}
                                    </div>
                                    <div className="text-xs text-slate-500">Complete workbook with all data</div>
                                </div>
                            </button>

                            <div className="my-2 border-t border-white/10" />

                            <div className="text-xs text-slate-500 px-3 py-1 uppercase tracking-wider">Individual Exports</div>

                            <button
                                onClick={() => { exportSummary(); setShowMenu(false); }}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-white/10 transition-colors"
                            >
                                <FileText className="h-4 w-4 text-indigo-400" />
                                <div className="flex-1">
                                    <div className="text-sm text-white">Summary Report</div>
                                    <div className="text-xs text-slate-500">Markdown format</div>
                                </div>
                            </button>

                            <button
                                onClick={() => { exportExpertData(); setShowMenu(false); }}
                                disabled={expertPerformance.length === 0}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-white/10 transition-colors disabled:opacity-50"
                            >
                                <Users className="h-4 w-4 text-cyan-400" />
                                <div className="flex-1">
                                    <div className="text-sm text-white">Expert Performance</div>
                                    <div className="text-xs text-slate-500">{expertPerformance.length} experts (CSV)</div>
                                </div>
                            </button>

                            <button
                                onClick={() => { exportCategoryData(); setShowMenu(false); }}
                                disabled={categoryBreakdown.length === 0}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-white/10 transition-colors disabled:opacity-50"
                            >
                                <Layers className="h-4 w-4 text-purple-400" />
                                <div className="flex-1">
                                    <div className="text-sm text-white">Category Breakdown</div>
                                    <div className="text-xs text-slate-500">{categoryBreakdown.length} categories (CSV)</div>
                                </div>
                            </button>

                            <button
                                onClick={() => { exportReviewerData(); setShowMenu(false); }}
                                disabled={reviewerStats.length === 0}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-white/10 transition-colors disabled:opacity-50"
                            >
                                <UserCheck className="h-4 w-4 text-amber-400" />
                                <div className="flex-1">
                                    <div className="text-sm text-white">Reviewer Statistics</div>
                                    <div className="text-xs text-slate-500">{reviewerStats.length} reviewers (CSV)</div>
                                </div>
                            </button>

                            <button
                                onClick={() => { exportDetailedData(); setShowMenu(false); }}
                                disabled={!processedData || processedData.length === 0}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-white/10 transition-colors disabled:opacity-50"
                            >
                                <Table2 className="h-4 w-4 text-rose-400" />
                                <div className="flex-1">
                                    <div className="text-sm text-white">Detailed Records</div>
                                    <div className="text-xs text-slate-500">Up to 10,000 records (CSV)</div>
                                </div>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

// Chat Panel Component - Production
// Chat Panel Component - Production
function ChatPanel({ config, processedData, metrics, onClose, onMinimize, initialMessages, onMessagesChange, onApplyChanges }) {
    const [messages, setMessages] = useState(initialMessages || [
        {
            role: 'assistant',
            content: `Hi! I'm here to help you refine your ${PROJECT_TYPES[config.projectType]?.name || 'QA'} dashboard. You can ask me to:\n\n• Explain metrics or calculations\n• Modify quality thresholds\n• Add custom calculations\n• Filter or analyze specific data\n• Export custom reports\n\nWhat would you like to do?`
        }
    ]);
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const messagesEndRef = React.useRef(null);

    const extractConfigUpdate = (text) => {
        // Try fenced JSON first
        const fenced = text.match(/```json\s*([\s\S]*?)\s*```/i) || text.match(/```\s*([\s\S]*?)\s*```/i);
        const candidate = fenced ? fenced[1] : null;
        try {
            if (candidate) return JSON.parse(candidate);
            const trimmed = text.trim();
            if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
                return JSON.parse(trimmed);
            }
        } catch (e) {
            console.error('Failed to parse assistant JSON:', e);
        }
        return null;
    };

    // Update parent when messages change
    React.useEffect(() => {
        if (onMessagesChange) {
            onMessagesChange(messages);
        }
    }, [messages, onMessagesChange]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    React.useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const buildSystemPrompt = () => {
        // Get sample of actual data structure
        const sampleData = processedData && processedData.length > 0
            ? JSON.stringify(processedData[0].raw, null, 2)
            : 'No data available';

        const availableColumns = processedData && processedData.length > 0
            ? Object.keys(processedData[0].raw || {})
            : [];

        return `You are an AI assistant helping a user analyze their REAL QA data. You work ONLY with actual data that exists - you NEVER make up, alter, or fabricate values.
      
      **CRITICAL RULES:**
      1. ONLY use columns that actually exist in the data
      2. ONLY calculate metrics from real data values
      3. NEVER invent data, columns, or values
      4. If data doesn't exist to fulfill a request, tell the user what's missing
      5. Focus on: calculating, filtering, grouping, visualizing, and drilling down into REAL data
      
      **Current Dashboard State:**
      - Project Type: ${PROJECT_TYPES[config.projectType]?.name || 'Unknown'}
      - Total Records: ${metrics?.total || 0}
      - Approval Rate: ${metrics?.approvalRate?.toFixed(1) || 0}%
      - Defect Rate: ${metrics?.defectRate?.toFixed(1) || 0}%
      - Unique Experts: ${metrics?.uniqueExperts || 0}
      ${metrics?.avgQuality ? `- Average Quality: ${metrics.avgQuality.toFixed(1)}%` : ''}
      
      **ACTUAL DATA STRUCTURE:**
      Available Columns: ${availableColumns.join(', ')}
      
      Sample Record:
      ${sampleData}
      
      **Current Configuration:**
      - Expert ID Column: ${config.expertIdColumn}
      - Score Column: ${config.scoreColumn}
      - Category Column: ${config.categoryColumn || 'Not set'}
      - Reviewer Column: ${config.reviewerColumn || 'Not set'}
      - Timestamp Column: ${config.timestampColumn || 'Not set'}
      - Quality Dimension Columns: ${config.qualityDimensionColumns?.join(', ') || 'None'}
      - Pass Values: ${config.passValues?.join(', ') || 'None'}
      - Minor Values: ${config.minorValues?.join(', ') || 'None'}
      - Fail Values: ${config.failValues?.join(', ') || 'None'}
      
      **WHAT YOU CAN DO:**
      ✅ Calculate metrics from existing columns (averages, counts, percentages, distributions)
      ✅ Create visualizations (charts, tables) of real data
      ✅ Filter and group data by existing column values
      ✅ Set up drill-down views based on categories, experts, time periods
      ✅ Configure quality dimensions using actual column names that contain Good/Bad or similar values
      ✅ Modify thresholds for existing scoring columns
      ✅ Add aggregations (sum, average, min, max, median) of numeric columns
      ✅ Create time-series views if timestamp data exists
      ✅ Compare subsets of data (expert vs expert, category vs category, time period vs time period)
      
      **WHAT YOU CANNOT DO:**
      ❌ Create new data that doesn't exist
      ❌ Alter or fabricate values in the dataset
      ❌ Use column names that don't exist in the actual data
      ❌ Make assumptions about data that isn't present
      ❌ Calculate metrics from columns that aren't in the dataset
      
      **WHEN USER REQUESTS CHANGES:**
      1. First, verify the data exists to support their request
      2. If data is missing, explain what's needed
      3. If data exists, provide the configuration in JSON:
      
      \`\`\`json
      {
        "action": "update_config",
        "changes": {
          "qualityDimensionColumns": ["actual_column_1", "actual_column_2"],
          "enableQualityOverTime": true
        }
      }
      \`\`\`
      
      **EXAMPLE VALID REQUESTS:**
      - "Calculate average score by category" → Aggregate real score values by real category values
      - "Show quality trend over time" → Plot real quality scores by real timestamps
      - "Filter to show only expert X" → Filter existing data where expertId = X
      - "Add drill-down by reviewer" → Create interactive view grouping by actual reviewer column
      
      **EXAMPLE INVALID REQUESTS (Explain what's missing):**
      - "Add sentiment analysis" → If sentiment column doesn't exist, explain it would need to be added to source data
      - "Show projected future performance" → Cannot predict/fabricate future data
      - "Calculate ROI" → If cost/revenue columns don't exist, explain they need to be in the data
      
      Your job: Help users extract maximum insights from their ACTUAL data through smart calculations, filters, groupings, and visualizations.`;
    };

    const handleSend = async () => {
        if (!input.trim() || isProcessing) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsProcessing(true);

        try {
            const conversationHistory = messages
                .filter(msg => msg.role !== 'system')
                .map(msg => ({
                    role: msg.role === 'assistant' ? 'assistant' : 'user',
                    content: msg.content
                }));

            conversationHistory.push({
                role: 'user',
                content: userMessage
            });

            const response = await fetch("/api/claude", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "claude-sonnet-4-20250514",
                    max_tokens: 2000,
                    system: buildSystemPrompt(),
                    messages: conversationHistory
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `API request failed: ${response.status}`);
            }

            const data = await response.json();
            const assistantResponse = data.content[0].text;

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: assistantResponse
            }]);

            // Check if response contains configuration changes
            const configUpdate = extractConfigUpdate(assistantResponse);
            const hasChangesPayload = configUpdate && (configUpdate.action === 'update_config' || configUpdate.changes || configUpdate.customCharts || configUpdate.customCalculations);
            if (hasChangesPayload) {
                const incomingChanges = {
                    ...(configUpdate?.changes || {}),
                    ...(configUpdate?.customCharts ? { customCharts: configUpdate.customCharts } : {}),
                    ...(configUpdate?.customCalculations ? { customCalculations: configUpdate.customCalculations } : {}),
                };

                const allColumns = processedData && processedData.length > 0
                    ? Object.keys(processedData[0].raw || {})
                    : [];
                const sampleRaw = processedData && processedData.length > 0 ? (processedData.find(r => r.raw)?.raw || {}) : {};
                const pickFirstStringColumn = () => allColumns.find(c => typeof sampleRaw[c] === 'string') || allColumns[0];
                const pickFirstNumericColumn = () => {
                    const numeric = allColumns.find(c => typeof sampleRaw[c] === 'number');
                    if (numeric) return numeric;
                    const parsed = allColumns.find(c => !isNaN(parseFloat(sampleRaw[c])));
                    return parsed;
                };

                // Validate qualityDimensionColumns
                if (incomingChanges.qualityDimensionColumns) {
                    const invalidColumns = incomingChanges.qualityDimensionColumns.filter(
                        col => !allColumns.includes(col)
                    );
                    if (invalidColumns.length > 0) {
                        setMessages(prev => [...prev, {
                            role: 'system',
                            content: `Configuration Error: The following columns do not exist in your data: ${invalidColumns.join(', ')}\n\nAvailable columns: ${allColumns.join(', ')}`
                        }]);
                        return;
                    }
                }

                // Validate custom charts
                if (incomingChanges.customCharts) {
                    incomingChanges.customCharts = incomingChanges.customCharts.map(chart => {
                        const metricNeedsColumn = chart.metric && ['avg', 'sum', 'min', 'max'].includes(chart.metric);
                        const metricColumn = chart.metricColumn && chart.metricColumn !== 'auto'
                            ? chart.metricColumn
                            : (metricNeedsColumn ? (config.scoreColumn || pickFirstNumericColumn()) : undefined);
                        const groupBy = chart.groupBy && chart.groupBy !== 'auto'
                            ? chart.groupBy
                            : (config.categoryColumn || config.expertIdColumn || pickFirstStringColumn());
                        return { type: 'bar', ...chart, metricColumn, groupBy };
                    });

                    const invalidCharts = incomingChanges.customCharts.filter(chart => {
                        const hasGroupBy = chart.groupBy && allColumns.includes(chart.groupBy);
                        const metricNeedsColumn = chart.metric && ['avg', 'sum', 'min', 'max'].includes(chart.metric);
                        const hasMetricCol = !metricNeedsColumn || (chart.metricColumn && allColumns.includes(chart.metricColumn));
                        return !hasGroupBy || !hasMetricCol;
                    });
                    if (invalidCharts.length > 0) {
                        setMessages(prev => [...prev, {
                            role: 'system',
                            content: `Configuration Error: Some custom charts reference missing columns. Available columns: ${allColumns.join(', ')}`
                        }]);
                        return;
                    }
                }

                // Validate custom calculations
                if (incomingChanges.customCalculations) {
                    incomingChanges.customCalculations = incomingChanges.customCalculations.map(calc => {
                        const operationNeedsColumn = ['sum', 'avg', 'min', 'max'].includes(calc.operation || '');
                        const column = calc.column && calc.column !== 'auto'
                            ? calc.column
                            : (operationNeedsColumn ? (config.scoreColumn || pickFirstNumericColumn()) : undefined);
                        return { ...calc, column };
                    });

                    const invalidCalcs = incomingChanges.customCalculations.filter(calc => {
                        const operationNeedsColumn = ['sum', 'avg', 'min', 'max'].includes(calc.operation || '');
                        const columnRequired = operationNeedsColumn;
                        const columnOk = !columnRequired || (calc.column && allColumns.includes(calc.column));
                        return !columnOk;
                    });
                    if (invalidCalcs.length > 0) {
                        setMessages(prev => [...prev, {
                            role: 'system',
                            content: `Configuration Error: Some custom calculations reference missing columns. Available columns: ${allColumns.join(', ')}`
                        }]);
                        return;
                    }
                }

                onApplyChanges(incomingChanges);
                setMessages(prev => [...prev, {
                    role: 'system',
                    content: 'Configuration updated! The dashboard has been reconfigured with your changes.'
                }]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Error: ${error.message}`
            }]);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-slate-900 border-l border-white/10 shadow-2xl z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">AI Assistant</h3>
                        <p className="text-xs text-slate-400">Dashboard Refinement</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onMinimize}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                        title="Minimize"
                    >
                        <ChevronDown className="h-5 w-5" />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                        title="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                                : msg.role === 'system'
                                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-200'
                                    : 'bg-white/5 border border-white/10 text-slate-200'
                                }`}
                        >
                            <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                        </div>
                    </div>
                ))}
                {isProcessing && (
                    <div className="flex justify-start">
                        <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-slate-950">
                <div className="flex gap-2">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me anything about your dashboard..."
                        rows={2}
                        disabled={isProcessing}
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none disabled:opacity-50"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isProcessing}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white transition-all"
                    >
                        <Send className="h-5 w-5" />
                    </button>
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                    <Info className="h-3 w-3" />
                    <span>Press Enter to send, Shift+Enter for new line</span>
                </div>
            </div>
        </div>
    );
}

// Data Source Manager Component - for multi-file support
function DataSourceManager({
    dataSources,
    onAddSource,
    onRemoveSource,
    onUpdateSheet,
    joinConfig,
    onJoinConfigChange,
    onProceed,
    isProcessing
}) {
    const [showJoinPanel, setShowJoinPanel] = useState(false);
    const fileInputRef = React.useRef(null);

    const primarySource = dataSources.find(s => s.id === joinConfig?.primarySourceId);
    const secondarySources = dataSources.filter(s => s.id !== joinConfig?.primarySourceId);

    const handleAddFiles = (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => onAddSource(file));
        e.target.value = '';
    };

    const setPrimarySource = (sourceId) => {
        onJoinConfigChange({
            primarySourceId: sourceId,
            joins: joinConfig?.joins?.filter(j => j.sourceId !== sourceId) || []
        });
    };

    const addJoin = (sourceId) => {
        const source = dataSources.find(s => s.id === sourceId);
        if (!source || !joinConfig?.primarySourceId) return;

        onJoinConfigChange({
            ...joinConfig,
            joins: [
                ...(joinConfig.joins || []),
                { sourceId, primaryKey: '', foreignKey: '' }
            ]
        });
    };

    const updateJoin = (sourceId, field, value) => {
        onJoinConfigChange({
            ...joinConfig,
            joins: joinConfig.joins.map(j =>
                j.sourceId === sourceId ? { ...j, [field]: value } : j
            )
        });
    };

    const removeJoin = (sourceId) => {
        onJoinConfigChange({
            ...joinConfig,
            joins: joinConfig.joins.filter(j => j.sourceId !== sourceId)
        });
    };

    const canProceed = () => {
        if (!joinConfig?.primarySourceId) return false;
        const primary = dataSources.find(s => s.id === joinConfig.primarySourceId);
        if (!primary || primary.data.length === 0) return false;

        // Check all joins are configured
        for (const join of (joinConfig.joins || [])) {
            if (!join.primaryKey || !join.foreignKey) return false;
        }
        return true;
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Database className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Data Source Manager</h1>
                    <p className="text-slate-400">Upload files and configure how to connect them</p>
                </div>

                {/* File Upload Area */}
                <div className="mb-8">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAddFiles}
                        accept=".csv,.xlsx,.xls"
                        multiple
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessing}
                        className="w-full border-2 border-dashed border-white/20 hover:border-indigo-500/50 rounded-xl p-8 text-center transition-all hover:bg-white/5"
                    >
                        {isProcessing ? (
                            <div className="flex items-center justify-center gap-3">
                                <div className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                                <span className="text-slate-300">Processing...</span>
                            </div>
                        ) : (
                            <>
                                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                                <p className="text-white font-medium">Click to add more files</p>
                                <p className="text-sm text-slate-500 mt-1">CSV, XLSX, XLS • Multiple files supported</p>
                            </>
                        )}
                    </button>
                </div>

                {/* Data Sources List */}
                {dataSources.length > 0 && (
                    <div className="space-y-4 mb-8">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <FileSpreadsheet className="h-5 w-5 text-indigo-400" />
                            Uploaded Files ({dataSources.length})
                        </h2>

                        <div className="grid gap-4">
                            {dataSources.map((source, idx) => (
                                <div
                                    key={source.id}
                                    className={`bg-slate-900/90 rounded-xl border p-4 transition-all ${joinConfig?.primarySourceId === source.id
                                        ? 'border-indigo-500 ring-1 ring-indigo-500/50'
                                        : 'border-white/10 hover:border-white/20'
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${joinConfig?.primarySourceId === source.id
                                            ? 'bg-indigo-500 text-white'
                                            : 'bg-white/10 text-slate-400'
                                            }`}>
                                            {idx + 1}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-medium text-white truncate">{source.name}</h3>
                                                {joinConfig?.primarySourceId === source.id && (
                                                    <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-xs rounded-full">Primary</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-400">
                                                {source.data.length.toLocaleString()} rows • {source.columns.length} columns
                                            </p>

                                            {/* Sheet selector for Excel files */}
                                            {source.sheets.length > 1 && (
                                                <div className="mt-3">
                                                    <label className="text-xs text-slate-500 mb-1 block">Sheet:</label>
                                                    <select
                                                        value={source.selectedSheet}
                                                        onChange={(e) => onUpdateSheet(source.id, e.target.value)}
                                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                                                    >
                                                        {source.sheets.map(sheet => (
                                                            <option key={sheet} value={sheet}>{sheet}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}

                                            {/* Column preview */}
                                            <div className="mt-3 flex flex-wrap gap-1">
                                                {source.columns.slice(0, 6).map(col => (
                                                    <span key={col} className="px-2 py-0.5 bg-white/5 text-slate-400 text-xs rounded">
                                                        {col}
                                                    </span>
                                                ))}
                                                {source.columns.length > 6 && (
                                                    <span className="text-xs text-slate-500">+{source.columns.length - 6} more</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            {joinConfig?.primarySourceId !== source.id && (
                                                <button
                                                    onClick={() => setPrimarySource(source.id)}
                                                    className="px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs rounded-lg transition-colors"
                                                >
                                                    Set Primary
                                                </button>
                                            )}
                                            <button
                                                onClick={() => onRemoveSource(source.id)}
                                                className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs rounded-lg transition-colors"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Join Configuration */}
                {dataSources.length > 1 && joinConfig?.primarySourceId && (
                    <div className="mb-8">
                        <button
                            onClick={() => setShowJoinPanel(!showJoinPanel)}
                            className="w-full flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl hover:bg-amber-500/15 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Zap className="h-5 w-5 text-amber-400" />
                                <div className="text-left">
                                    <div className="font-medium text-amber-300">Join Data Sources</div>
                                    <div className="text-sm text-amber-300/70">
                                        Connect files using a common field (e.g., Expert ID)
                                    </div>
                                </div>
                            </div>
                            <ChevronDown className={`h-5 w-5 text-amber-400 transition-transform ${showJoinPanel ? 'rotate-180' : ''}`} />
                        </button>

                        {showJoinPanel && (
                            <div className="mt-4 p-4 bg-slate-900/90 border border-white/10 rounded-xl space-y-4">
                                <p className="text-sm text-slate-400">
                                    Select which files to join with <strong className="text-indigo-300">{primarySource?.name}</strong> and specify the matching columns.
                                </p>

                                {/* Available sources to join */}
                                {secondarySources.map(source => {
                                    const existingJoin = joinConfig.joins?.find(j => j.sourceId === source.id);

                                    return (
                                        <div key={source.id} className="p-4 bg-white/5 rounded-lg">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <FileSpreadsheet className="h-4 w-4 text-slate-400" />
                                                    <span className="font-medium text-white">{source.name}</span>
                                                    <span className="text-xs text-slate-500">({source.data.length} rows)</span>
                                                </div>
                                                {existingJoin ? (
                                                    <button
                                                        onClick={() => removeJoin(source.id)}
                                                        className="text-xs text-rose-400 hover:text-rose-300"
                                                    >
                                                        Remove Join
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => addJoin(source.id)}
                                                        className="text-xs text-emerald-400 hover:text-emerald-300"
                                                    >
                                                        + Add Join
                                                    </button>
                                                )}
                                            </div>

                                            {existingJoin && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-xs text-slate-400 mb-1 block">
                                                            Key in {primarySource?.name.replace(/\.[^.]+$/, '')}:
                                                        </label>
                                                        <select
                                                            value={existingJoin.primaryKey}
                                                            onChange={(e) => updateJoin(source.id, 'primaryKey', e.target.value)}
                                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                                                        >
                                                            <option value="">Select column...</option>
                                                            {primarySource?.columns.map(col => (
                                                                <option key={col} value={col}>{col}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-slate-400 mb-1 block">
                                                            Matches column in {source.name.replace(/\.[^.]+$/, '')}:
                                                        </label>
                                                        <select
                                                            value={existingJoin.foreignKey}
                                                            onChange={(e) => updateJoin(source.id, 'foreignKey', e.target.value)}
                                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                                                        >
                                                            <option value="">Select column...</option>
                                                            {source.columns.map(col => (
                                                                <option key={col} value={col}>{col}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {joinConfig.joins?.length > 0 && (
                                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                                        <div className="flex items-center gap-2 text-emerald-300 text-sm">
                                            <CheckCircle2 className="h-4 w-4" />
                                            <span>
                                                {joinConfig.joins.length} join{joinConfig.joins.length > 1 ? 's' : ''} configured -
                                                data will be merged when you proceed
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Proceed Button */}
                <div className="flex justify-end">
                    <button
                        onClick={onProceed}
                        disabled={!canProceed()}
                        className={`flex items-center gap-2 px-8 py-3 rounded-xl text-white font-medium transition-all ${canProceed()
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
                            : 'bg-slate-700 cursor-not-allowed opacity-50'
                            }`}
                    >
                        Continue to Configuration
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// Data Parsing Settings Component
function DataParsingSettings({ dataSources, onComplete, onCancel }) {
    const [settings, setSettings] = useState({
        headerRow: 1,
        dateFormat: 'auto'
    });

    // Sheet selection for multi-sheet workbooks
    const [sheetSelections, setSheetSelections] = useState(() => {
        const selections = {};
        dataSources.forEach(source => {
            if (source.sheets.length > 1) {
                selections[source.id] = [source.selectedSheet]; // Start with first sheet selected
            }
        });
        return selections;
    });

    const toggleSheet = (sourceId, sheetName) => {
        setSheetSelections(prev => {
            const current = prev[sourceId] || [];
            if (current.includes(sheetName)) {
                return { ...prev, [sourceId]: current.filter(s => s !== sheetName) };
            }
            return { ...prev, [sourceId]: [...current, sheetName] };
        });
    };

    const hasMultiSheetWorkbooks = dataSources.some(s => s.sheets.length > 1);

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Settings className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Data Parsing Settings</h1>
                    <p className="text-slate-400">Configure how we should read your data</p>
                </div>

                <div className="space-y-6">
                    {/* Multi-sheet selection */}
                    {hasMultiSheetWorkbooks && (
                        <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Layers className="h-5 w-5 text-indigo-400" />
                                Select Sheets to Include
                            </h3>
                            <p className="text-sm text-slate-400 mb-4">
                                For Excel files with multiple sheets, select which sheets you want to use. Each sheet will become a separate data source.
                            </p>

                            {dataSources.map(source => {
                                if (source.sheets.length <= 1) return null;

                                const selectedSheets = sheetSelections[source.id] || [];

                                return (
                                    <div key={source.id} className="mb-6 last:mb-0">
                                        <div className="flex items-center gap-2 mb-3">
                                            <FileSpreadsheet className="h-4 w-4 text-slate-400" />
                                            <span className="font-medium text-white">{source.name}</span>
                                            <span className="text-xs text-slate-500">({source.sheets.length} sheets)</span>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {source.sheets.map(sheet => (
                                                <label
                                                    key={sheet}
                                                    className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all ${selectedSheets.includes(sheet)
                                                        ? 'bg-indigo-500/20 border-2 border-indigo-500'
                                                        : 'bg-white/5 border-2 border-white/10 hover:border-white/30'
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedSheets.includes(sheet)}
                                                        onChange={() => toggleSheet(source.id, sheet)}
                                                        className="w-4 h-4 rounded border-slate-500 text-indigo-500"
                                                    />
                                                    <span className="text-sm text-slate-300 truncate flex-1" title={sheet}>
                                                        {sheet}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Data parsing settings */}
                    <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Database className="h-5 w-5 text-emerald-400" />
                            Data Format Settings
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                                    <HelpCircle className="h-4 w-4" />
                                    Header Row Number
                                </label>
                                <p className="text-xs text-slate-500 mb-2">Which row contains your column headers?</p>
                                <input
                                    type="number"
                                    min="1"
                                    value={settings.headerRow}
                                    onChange={(e) => setSettings(prev => ({ ...prev, headerRow: parseInt(e.target.value) || 1 }))}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                                    <Clock className="h-4 w-4" />
                                    Date Format
                                </label>
                                <p className="text-xs text-slate-500 mb-2">How are dates formatted in your data?</p>
                                <select
                                    value={settings.dateFormat}
                                    onChange={(e) => setSettings(prev => ({ ...prev, dateFormat: e.target.value }))}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                >
                                    <option value="auto">Auto-detect</option>
                                    <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                                    <option value="DD/MM/YYYY">DD/MM/YYYY (Europe)</option>
                                    <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Sample data preview */}
                    <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Info className="h-5 w-5 text-amber-400" />
                            Data Preview
                        </h3>
                        <p className="text-sm text-slate-400 mb-3">
                            First few rows from {dataSources[0]?.name}:
                        </p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <tbody>
                                    {dataSources[0]?.data.slice(0, 3).map((row, idx) => (
                                        <tr key={idx} className="border-b border-white/10">
                                            <td className="py-2 px-3 text-slate-500 text-xs">{idx + 1}</td>
                                            <td className="py-2 px-3 text-slate-300 truncate max-w-md">
                                                {JSON.stringify(row).substring(0, 100)}...
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between mt-8">
                    <button
                        onClick={onCancel}
                        className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Cancel
                    </button>

                    <button
                        onClick={() => onComplete(settings, sheetSelections)}
                        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-xl text-white transition-all"
                    >
                        Continue to Configuration
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// Setup Wizard Component
function SetupWizard({ columns, sampleData, rawData = [], onComplete, onCancel }) {
    const [step, setStep] = useState(1);
    const totalSteps = 7;

    const [config, setConfig] = useState({
        projectType: '',
        projectName: '',
        qualityType: '',
        expertIdColumn: '',
        scoreColumn: '',
        timestampColumn: '',
        categoryColumn: '',
        reviewerColumn: '',
        taskLinkColumn: '',
        qualityDimensionColumns: [],
        passValues: [],
        minorValues: [],
        failValues: [],
        excludeValues: [],
        goodValue: 'Good',
        scoreFormat: 'numeric', // numeric | percentage | text | binary
        scoringMode: 'auto',
        metricNeeds: { approval: true, quality: true, consensus: false, custom: '' },
        // Numeric thresholds
        numericFailThreshold: null,   // Below this = fail
        numericMinorThreshold: null,  // Below this (but >= fail threshold) = minor
        // Legacy percentage fields (can be merged with numeric)
        percentagePassThreshold: 80,
        percentageFailThreshold: 60,
        hasPaymentData: false,
        paymentColumns: { approved: '', rejected: '', rate: '', total: '' },
        chartPreferences: {
            statusChart: 'donut',
            trendChart: 'area',
            colorScheme: 'purple'
        },
        showTables: { expert: true, category: true, reviewer: true, detailed: true },
    });

    const autoDetectColumns = useCallback((projectType) => {
        if (!projectType || !columns.length) return;
        const patterns = PROJECT_TYPES[projectType]?.commonFields || {};
        const detected = {};

        Object.entries(patterns).forEach(([field, keywords]) => {
            const match = columns.find(col =>
                keywords.some(kw => col.toLowerCase().includes(kw.toLowerCase()))
            );
            if (match) detected[field + 'Column'] = match;
        });

        setConfig(prev => ({ ...prev, ...detected }));
    }, [columns]);

    const getColumnValues = useCallback((columnName) => {
        const source = rawData.length ? rawData : sampleData;
        if (!columnName || !source.length) return [];
        const values = new Set();
        source.forEach(row => {
            const val = row[columnName];
            if (val !== null && val !== undefined && val !== '') {
                values.add(String(val).trim());
            }
        });
        return Array.from(values).sort();
    }, [sampleData, rawData]);

    const updateConfig = (field, value) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    const updateNestedConfig = (parent, field, value) => {
        setConfig(prev => ({
            ...prev,
            [parent]: { ...prev[parent], [field]: value }
        }));
    };

    const handleProjectTypeSelect = (type) => {
        updateConfig('projectType', type);
        autoDetectColumns(type);
    };

    const handleQualityTypeSelect = (type) => {
        const qualityConfig = QUALITY_TYPES[type];

        // Use functional update to avoid stale closure issues
        setConfig(prev => {
            const updates = { ...prev, qualityType: type };

            if (qualityConfig) {
                if (qualityConfig.isNumeric) {
                    // Always set defaults for numeric types
                    updates.numericFailThreshold = qualityConfig.defaultFailThreshold;
                    updates.numericMinorThreshold = qualityConfig.defaultMinorThreshold;
                    // Clear discrete values when switching to numeric
                    updates.passValues = [];
                    updates.minorValues = [];
                    updates.failValues = [];
                } else {
                    // Set discrete values
                    updates.passValues = qualityConfig.defaultPass || [];
                    updates.minorValues = qualityConfig.defaultMinor || [];
                    updates.failValues = qualityConfig.defaultFail || [];
                    // Clear numeric thresholds when switching to discrete
                    updates.numericFailThreshold = null;
                    updates.numericMinorThreshold = null;
                }
            }

            return updates;
        });
    };

    const toggleArrayValue = (field, value) => {
        setConfig(prev => {
            const arr = prev[field] || [];
            if (arr.includes(value)) {
                return { ...prev, [field]: arr.filter(v => v !== value) };
            }
            return { ...prev, [field]: [...arr, value] };
        });
    };

    const canProceed = () => {
        switch (step) {
            case 1: return config.projectType !== '';
            case 2: return (config.scoreFormat || '') !== '';
            case 3: return config.expertIdColumn !== '' && config.scoreColumn !== '';
            case 4:
                const qualityCfg = QUALITY_TYPES[config.qualityType];
                const fmt = config.scoreFormat || 'numeric';
                const numericLike = qualityCfg?.isNumeric || config.qualityType === 'percentage' || fmt === 'numeric' || fmt === 'percentage';
                if (numericLike) return true;
                return config.passValues.length > 0 || config.failValues.length > 0;
            default: return true;
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <FolderOpen className="h-8 w-8 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">What type of project?</h2>
                            <p className="text-slate-400">This helps us understand your data structure</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {Object.entries(PROJECT_TYPES).map(([key, type]) => {
                                const IconComponent = type.icon;
                                return (
                                    <button
                                        key={key}
                                        onClick={() => handleProjectTypeSelect(key)}
                                        className={`p-4 rounded-xl border-2 transition-all text-left ${config.projectType === key
                                            ? 'border-indigo-500 bg-indigo-500/20'
                                            : 'border-white/10 bg-white/5 hover:border-white/30'
                                            }`}
                                    >
                                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-3">
                                            <IconComponent className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="font-semibold text-white mb-1">{type.name}</div>
                                        <div className="text-xs text-slate-400">{type.description}</div>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-6">
                            <label className="block text-sm font-medium text-slate-300 mb-2">Project Name (optional)</label>
                            <input
                                type="text"
                                value={config.projectName}
                                onChange={(e) => updateConfig('projectName', e.target.value)}
                                placeholder="e.g., Video QA Dashboard - Q4 2024"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            />
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Target className="h-8 w-8 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">What format is your score?</h2>
                            <p className="text-slate-400">Choose one. This controls how Strong/Weak Pass vs Fail are classified.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-300">
                            {[
                                { key: 'numeric', label: 'Numeric (whole numbers)', desc: 'e.g., 1, 3, 5' },
                                { key: 'percentage', label: 'Percentage/Decimal', desc: 'e.g., 0.76 or 76%' },
                                { key: 'text', label: 'Text labels', desc: 'e.g., Good/Bad, Strong/Weak/Fail' },
                                { key: 'binary', label: 'Binary', desc: 'e.g., Yes/No, True/False, 0/1' },
                            ].map(opt => (
                                <label key={opt.key} className="flex items-start gap-2 cursor-pointer p-3 rounded-lg border border-white/10 hover:border-emerald-400/60">
                                    <input
                                        type="radio"
                                        name="scoreFormat"
                                        value={opt.key}
                                        checked={config.scoreFormat === opt.key}
                                        onChange={() => updateConfig('scoreFormat', opt.key)}
                                        className="mt-1 text-emerald-500 focus:ring-emerald-500"
                                    />
                                    <div>
                                        <div className="font-semibold text-white">{opt.label}</div>
                                        <div className="text-xs text-slate-400">{opt.desc}</div>
                                    </div>
                                </label>
                            ))}
                        </div>

                        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                            <div className="flex items-center gap-2 mb-3">
                                <Activity className="h-4 w-4 text-emerald-400" />
                                <div className="text-sm font-semibold text-white">Metrics Needed</div>
                            </div>
                            <div className="space-y-2 text-sm text-slate-300">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={config.metricNeeds.approval}
                                        onChange={(e) => updateConfig('metricNeeds', { ...config.metricNeeds, approval: e.target.checked })}
                                    />
                                    Approval / Pass-Fail
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={config.metricNeeds.quality}
                                        onChange={(e) => updateConfig('metricNeeds', { ...config.metricNeeds, quality: e.target.checked })}
                                    />
                                    Quality Score
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={config.metricNeeds.consensus}
                                        onChange={(e) => updateConfig('metricNeeds', { ...config.metricNeeds, consensus: e.target.checked })}
                                    />
                                    Consensus (multiple reviews per task)
                                </label>
                                <textarea
                                    value={config.metricNeeds.custom || ''}
                                    onChange={(e) => updateConfig('metricNeeds', { ...config.metricNeeds, custom: e.target.value })}
                                    placeholder="Other: e.g., average grade per task, dual-score comparisons, payment-adjusted quality..."
                                    className="w-full mt-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Database className="h-8 w-8 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Map your columns</h2>
                            <p className="text-slate-400">Tell us which columns contain which data</p>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                            <div className="flex items-center gap-2 text-sm text-indigo-300 mb-2">
                                <Info className="h-4 w-4" />
                                <span>Detected {columns.length} columns</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {columns.slice(0, 10).map(col => (
                                    <span key={col} className="px-2 py-1 bg-white/10 text-slate-300 text-xs rounded-lg">{col}</span>
                                ))}
                                {columns.length > 10 && <span className="text-slate-400 text-xs">+{columns.length - 10} more</span>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                                    <Users className="h-4 w-4 text-indigo-400" />
                                    Expert/Worker ID <span className="text-rose-400">*</span>
                                </label>
                                <select
                                    value={config.expertIdColumn}
                                    onChange={(e) => updateConfig('expertIdColumn', e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                >
                                    <option value="">Select column...</option>
                                    {columns.map(col => <option key={col} value={col}>{col}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                                    <Target className="h-4 w-4 text-emerald-400" />
                                    Score/Status <span className="text-rose-400">*</span>
                                </label>
                                <select
                                    value={config.scoreColumn}
                                    onChange={(e) => updateConfig('scoreColumn', e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                >
                                    <option value="">Select column...</option>
                                    {columns.map(col => <option key={col} value={col}>{col}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                                    <Calendar className="h-4 w-4 text-amber-400" />
                                    Timestamp/Date
                                </label>
                                <select
                                    value={config.timestampColumn}
                                    onChange={(e) => updateConfig('timestampColumn', e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                >
                                    <option value="">Select (optional)...</option>
                                    {columns.map(col => <option key={col} value={col}>{col}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                                    <Layers className="h-4 w-4 text-purple-400" />
                                    Category/Error Type
                                </label>
                                <select
                                    value={config.categoryColumn}
                                    onChange={(e) => updateConfig('categoryColumn', e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                >
                                    <option value="">Select (optional)...</option>
                                    {columns.map(col => <option key={col} value={col}>{col}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                                    <UserCheck className="h-4 w-4 text-cyan-400" />
                                    Reviewer/Auditor
                                </label>
                                <select
                                    value={config.reviewerColumn}
                                    onChange={(e) => updateConfig('reviewerColumn', e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                >
                                    <option value="">Select (optional)...</option>
                                    {columns.map(col => <option key={col} value={col}>{col}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                                    <FileText className="h-4 w-4 text-rose-400" />
                                    Task Link
                                </label>
                                <select
                                    value={config.taskLinkColumn}
                                    onChange={(e) => updateConfig('taskLinkColumn', e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                >
                                    <option value="">Select (optional)...</option>
                                    {columns.map(col => <option key={col} value={col}>{col}</option>)}
                                </select>
                            </div>
                        </div>

                        {config.qualityType === 'multi_dimension' && (
                            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                                <label className="flex items-center gap-2 text-sm font-medium text-amber-300 mb-3">
                                    <Activity className="h-4 w-4" />
                                    Quality Dimension Columns
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {columns.map(col => (
                                        <button
                                            key={col}
                                            onClick={() => {
                                                const dims = config.qualityDimensionColumns || [];
                                                if (dims.includes(col)) {
                                                    updateConfig('qualityDimensionColumns', dims.filter(c => c !== col));
                                                } else {
                                                    updateConfig('qualityDimensionColumns', [...dims, col]);
                                                }
                                            }}
                                            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${(config.qualityDimensionColumns || []).includes(col)
                                                ? 'bg-amber-500 text-white'
                                                : 'bg-white/10 text-slate-300 hover:bg-white/20'
                                                }`}
                                        >
                                            {col}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 4:
                const scoreValues = getColumnValues(config.scoreColumn);
                const qualityConfig = QUALITY_TYPES[config.qualityType];
                const isNumeric = qualityConfig?.isNumeric;

                return (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="h-8 w-8 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Define Quality Thresholds</h2>
                            <p className="text-slate-400">
                                {isNumeric ? 'Set numeric thresholds for pass/fail criteria' : 'Tell us which values indicate success or failure'}
                            </p>
                        </div>

                        {isNumeric ? (
                            <div className="space-y-6">
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                                    <div className="flex items-center gap-2 text-sm text-indigo-300 mb-2">
                                        <Info className="h-4 w-4" />
                                        <span>Scoring Range: {qualityConfig.minValue} - {qualityConfig.maxValue}</span>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        Set thresholds to determine what scores are considered pass, minor issues, or fail.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Fail Threshold */}
                                    <div className="p-5 bg-rose-500/10 border-2 border-rose-500/30 rounded-xl">
                                        <div className="flex items-center gap-2 mb-3">
                                            <X className="h-5 w-5 text-rose-400" />
                                            <label className="text-sm font-semibold text-rose-300">
                                                Fail Threshold
                                            </label>
                                        </div>
                                        <p className="text-xs text-rose-300/70 mb-3">
                                            Scores <strong>below</strong> this value are considered failures
                                        </p>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min={qualityConfig.minValue}
                                                max={qualityConfig.maxValue}
                                                step={qualityConfig.maxValue > 10 ? 1 : 0.5}
                                                value={config.numericFailThreshold ?? ''}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === '' || val === null) {
                                                        updateConfig('numericFailThreshold', qualityConfig.defaultFailThreshold);
                                                    } else {
                                                        const parsed = parseFloat(val);
                                                        updateConfig('numericFailThreshold', isNaN(parsed) ? qualityConfig.defaultFailThreshold : parsed);
                                                    }
                                                }} className="w-full px-4 py-3 bg-white/5 border border-rose-500/50 rounded-xl text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                                            />
                                            <div className="mt-2 text-xs text-rose-300/50">
                                                Example: Score of {Math.floor((config.numericFailThreshold ?? qualityConfig.defaultFailThreshold) - 1)} = <span className="text-rose-400 font-semibold">FAIL</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Minor Threshold */}
                                    <div className="p-5 bg-amber-500/10 border-2 border-amber-500/30 rounded-xl">
                                        <div className="flex items-center gap-2 mb-3">
                                            <AlertTriangle className="h-5 w-5 text-amber-400" />
                                            <label className="text-sm font-semibold text-amber-300">
                                                Minor Issues Threshold
                                            </label>
                                        </div>
                                        <p className="text-xs text-amber-300/70 mb-3">
                                            Scores <strong>below</strong> this (but above fail) have minor issues but still pass
                                        </p>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min={qualityConfig.minValue}
                                                max={qualityConfig.maxValue}
                                                step={qualityConfig.maxValue > 10 ? 1 : 0.5}
                                                value={config.numericMinorThreshold ?? ''}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === '' || val === null) {
                                                        updateConfig('numericMinorThreshold', qualityConfig.defaultMinorThreshold);
                                                    } else {
                                                        const parsed = parseFloat(val);
                                                        updateConfig('numericMinorThreshold', isNaN(parsed) ? qualityConfig.defaultMinorThreshold : parsed);
                                                    }
                                                }} className="w-full px-4 py-3 bg-white/5 border border-amber-500/50 rounded-xl text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                            />
                                            <div className="mt-2 text-xs text-amber-300/50">
                                                Example: Score of {Math.floor((config.numericMinorThreshold ?? qualityConfig.defaultMinorThreshold) - 1)} = <span className="text-amber-400 font-semibold">MINOR (Weak Pass)</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pass Threshold (display only) */}
                                    <div className="p-5 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-xl md:col-span-2">
                                        <div className="flex items-center gap-2 mb-3">
                                            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                            <label className="text-sm font-semibold text-emerald-300">
                                                Strong Pass
                                            </label>
                                        </div>
                                        <p className="text-xs text-emerald-300/70 mb-2">
                                            Scores at or above <strong>{config.numericMinorThreshold ?? qualityConfig.defaultMinorThreshold}</strong> are strong passes
                                        </p>
                                        <div className="mt-3 text-xs text-emerald-300/50">
                                            Example: Score of {config.numericMinorThreshold ?? qualityConfig.defaultMinorThreshold} or higher = <span className="text-emerald-400 font-semibold">PASS</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Visual Summary */}
                                <div className="p-5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
                                    <h4 className="text-sm font-semibold text-indigo-300 mb-3">📊 Threshold Summary</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                                            <span className="text-slate-300">Score &lt; {config.numericFailThreshold ?? qualityConfig.defaultFailThreshold}</span>
                                            <span className="px-3 py-1 bg-rose-500/20 text-rose-300 rounded-full text-xs font-semibold">FAIL</span>
                                        </div>
                                        <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                                            <span className="text-slate-300">Score {config.numericFailThreshold ?? qualityConfig.defaultFailThreshold} - {((config.numericMinorThreshold ?? qualityConfig.defaultMinorThreshold) - (qualityConfig.maxValue > 10 ? 1 : 0.5)).toFixed(1)}</span>
                                            <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-semibold">MINOR (Weak Pass)</span>
                                        </div>
                                        <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                                            <span className="text-slate-300">Score ≥ {config.numericMinorThreshold ?? qualityConfig.defaultMinorThreshold}</span>
                                            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-semibold">PASS (Strong)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : scoreValues.length > 0 ? (
                            <div className="space-y-6">
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                    <div className="text-sm text-slate-400 mb-3">
                                        Found {scoreValues.length} unique values in "{config.scoreColumn}":
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {scoreValues.map(val => (
                                            <span key={val} className="px-3 py-1.5 bg-white/10 text-white text-sm rounded-lg">{val}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                                        <div className="flex items-center gap-2 text-emerald-300 font-semibold mb-3">
                                            <CheckCircle2 className="h-5 w-5" />
                                            PASS Values
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {scoreValues.map(val => (
                                                <button
                                                    key={val}
                                                    onClick={() => toggleArrayValue('passValues', val)}
                                                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${config.passValues.includes(val)
                                                        ? 'bg-emerald-500 text-white'
                                                        : 'bg-white/10 text-slate-300 hover:bg-white/20'
                                                        }`}
                                                >
                                                    {val}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                                        <div className="flex items-center gap-2 text-amber-300 font-semibold mb-2">
                                            <AlertTriangle className="h-5 w-5" />
                                            MINOR Issues (track separately)
                                        </div>
                                        <p className="text-xs text-amber-300/70 mb-3">
                                            Values here are tracked separately. If also in Pass, they count as Minor (not failed, but flagged).
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {scoreValues.map(val => (
                                                <button
                                                    key={val}
                                                    onClick={() => toggleArrayValue('minorValues', val)}
                                                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${config.minorValues.includes(val)
                                                        ? 'bg-amber-500 text-white'
                                                        : 'bg-white/10 text-slate-300 hover:bg-white/20'
                                                        }`}
                                                >
                                                    {val}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl">
                                        <div className="flex items-center gap-2 text-rose-300 font-semibold mb-3">
                                            <X className="h-5 w-5" />
                                            FAIL Values
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {scoreValues.map(val => (
                                                <button
                                                    key={val}
                                                    onClick={() => toggleArrayValue('failValues', val)}
                                                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${config.failValues.includes(val)
                                                        ? 'bg-rose-500 text-white'
                                                        : 'bg-white/10 text-slate-300 hover:bg-white/20'
                                                        }`}
                                                >
                                                    {val}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-500/10 border border-slate-500/30 rounded-xl">
                                        <div className="flex items-center gap-2 text-slate-300 font-semibold mb-3">
                                            <Filter className="h-5 w-5" />
                                            EXCLUDE from calculations
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {scoreValues.map(val => (
                                                <button
                                                    key={val}
                                                    onClick={() => toggleArrayValue('excludeValues', val)}
                                                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${config.excludeValues.includes(val)
                                                        ? 'bg-slate-500 text-white'
                                                        : 'bg-white/10 text-slate-300 hover:bg-white/20'
                                                        }`}
                                                >
                                                    {val}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2">e.g., "Duplicate", "N/A"</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center p-8 bg-white/5 border border-white/10 rounded-xl">
                                <AlertCircle className="h-12 w-12 text-amber-400 mx-auto mb-3" />
                                <p className="text-slate-300">No score column selected or no data found.</p>
                            </div>
                        )}
                    </div>
                );

            case 5:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <DollarSign className="h-8 w-8 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Payment Data</h2>
                            <p className="text-slate-400">Does your data include payment information?</p>
                        </div>

                        <div className="flex justify-center gap-4 mb-8">
                            <button
                                onClick={() => updateConfig('hasPaymentData', true)}
                                className={`px-8 py-4 rounded-xl border-2 transition-all ${config.hasPaymentData
                                    ? 'border-amber-500 bg-amber-500/20 text-white'
                                    : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/30'
                                    }`}
                            >
                                <DollarSign className="h-8 w-8 mx-auto mb-2" />
                                <div className="font-semibold">Yes, include payment</div>
                            </button>
                            <button
                                onClick={() => updateConfig('hasPaymentData', false)}
                                className={`px-8 py-4 rounded-xl border-2 transition-all ${!config.hasPaymentData
                                    ? 'border-slate-500 bg-slate-500/20 text-white'
                                    : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/30'
                                    }`}
                            >
                                <X className="h-8 w-8 mx-auto mb-2" />
                                <div className="font-semibold">No payment data</div>
                            </button>
                        </div>

                        {config.hasPaymentData && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                                {['approved', 'rejected', 'rate', 'total'].map(field => (
                                    <div key={field}>
                                        <label className="block text-sm font-medium text-amber-300 mb-2 capitalize">
                                            {field === 'approved' ? 'Approved Tasks Pay' :
                                                field === 'rejected' ? 'Rejected Tasks Pay' :
                                                    field === 'rate' ? 'Pay Rate' : 'Total Payment'} Column
                                        </label>
                                        <select
                                            value={config.paymentColumns[field]}
                                            onChange={(e) => updateNestedConfig('paymentColumns', field, e.target.value)}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                                        >
                                            <option value="">Select column...</option>
                                            {columns.map(col => <option key={col} value={col}>{col}</option>)}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );

            case 6:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Palette className="h-8 w-8 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Visual Preferences</h2>
                            <p className="text-slate-400">Customize your dashboard appearance</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                <label className="block text-sm font-medium text-slate-300 mb-3">Status Chart Style</label>
                                <div className="flex gap-2">
                                    {[{ value: 'donut', label: 'Donut' }, { value: 'pie', label: 'Pie' }, { value: 'bar', label: 'Bar' }].map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => updateNestedConfig('chartPreferences', 'statusChart', opt.value)}
                                            className={`flex-1 py-2 rounded-lg text-sm transition-all ${config.chartPreferences.statusChart === opt.value
                                                ? 'bg-purple-500 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                <label className="block text-sm font-medium text-slate-300 mb-3">Trend Chart Style</label>
                                <div className="flex gap-2">
                                    {[{ value: 'area', label: 'Area' }, { value: 'line', label: 'Line' }, { value: 'bar', label: 'Bar' }].map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => updateNestedConfig('chartPreferences', 'trendChart', opt.value)}
                                            className={`flex-1 py-2 rounded-lg text-sm transition-all ${config.chartPreferences.trendChart === opt.value
                                                ? 'bg-purple-500 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 bg-white/5 border border-white/10 rounded-xl md:col-span-2">
                                <label className="block text-sm font-medium text-slate-300 mb-3">Tables to Include</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {[
                                        { key: 'expert', label: 'Expert Performance' },
                                        { key: 'category', label: 'Category Breakdown' },
                                        { key: 'reviewer', label: 'Reviewer Statistics' },
                                        { key: 'detailed', label: 'Detailed Records' }
                                    ].map(opt => (
                                        <label key={opt.key} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-white/5">
                                            <input
                                                type="checkbox"
                                                checked={config.showTables[opt.key]}
                                                onChange={(e) => updateNestedConfig('showTables', opt.key, e.target.checked)}
                                                className="w-4 h-4 rounded border-slate-500 text-purple-500"
                                            />
                                            <span className="text-sm text-slate-300">{opt.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 7:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-slate-500 to-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Settings className="h-8 w-8 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Additional Settings</h2>
                            <p className="text-slate-400">Final configuration options</p>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {config.qualityType === 'multi_dimension' && (
                                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                    <label className="text-sm font-medium text-slate-300 mb-2">"Good" Value for Dimensions</label>
                                    <p className="text-xs text-slate-500 mb-2">What value indicates "good" in quality dimensions?</p>
                                    <input
                                        type="text"
                                        value={config.goodValue}
                                        onChange={(e) => updateConfig('goodValue', e.target.value)}
                                        placeholder="e.g., Good, Pass, Yes"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                                    />
                                </div>
                            )}

                            {/* Info about chat */}
                            <div className="p-5 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                                <div className="flex items-center gap-2 mb-3">
                                    <MessageSquare className="h-5 w-5 text-purple-400" />
                                    <h4 className="text-sm font-semibold text-purple-300">Need Custom Calculations?</h4>
                                </div>
                                <p className="text-sm text-purple-200/80">
                                    After generating your dashboard, use the <strong>Chat</strong> button to ask the AI assistant for help with:
                                </p>
                                <ul className="mt-2 text-sm text-purple-200/70 space-y-1 ml-5 list-disc">
                                    <li>Custom quality calculations</li>
                                    <li>Additional metrics or breakdowns</li>
                                    <li>Data filtering and analysis</li>
                                    <li>Modifying thresholds</li>
                                </ul>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="mt-8 p-6 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
                            <h3 className="text-lg font-semibold text-indigo-300 mb-4">📋 Configuration Summary</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <div className="text-slate-400">Project</div>
                                    <div className="text-white font-medium">{PROJECT_TYPES[config.projectType]?.name || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-slate-400">Quality System</div>
                                    <div className="text-white font-medium">{QUALITY_TYPES[config.qualityType]?.name || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-slate-400">Expert Column</div>
                                    <div className="text-white font-medium">{config.expertIdColumn || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-slate-400">Score Column</div>
                                    <div className="text-white font-medium">{config.scoreColumn || '-'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="w-full">
            {/* Progress */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-400">Step {step} of {totalSteps}</span>
                    <span className="text-sm text-slate-400">{Math.round((step / totalSteps) * 100)}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                        style={{ width: `${(step / totalSteps) * 100}%` }}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10 p-4 sm:p-6 lg:p-8 mb-6">
                {renderStep()}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
                <button
                    onClick={() => step === 1 ? onCancel() : setStep(s => s - 1)}
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all"
                >
                    <ArrowLeft className="h-4 w-4" />
                    {step === 1 ? 'Cancel' : 'Back'}
                </button>

                {step < totalSteps ? (
                    <button
                        onClick={() => setStep(s => s + 1)}
                        disabled={!canProceed()}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-white transition-all ${canProceed()
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
                            : 'bg-slate-700 cursor-not-allowed opacity-50'
                            }`}
                    >
                        Continue
                        <ArrowRight className="h-4 w-4" />
                    </button>
                ) : (
                    <button
                        onClick={() => onComplete(config)}
                        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl text-white transition-all"
                    >
                        <Zap className="h-4 w-4" />
                        Generate Dashboard
                    </button>
                )}
            </div>
        </div>
    );
}

// Main App
export default function QADashboardGenerator() {
    const [showLandingPage, setShowLandingPage] = useState(true);
    const [file, setFile] = useState(null);
    const [rawData, setRawData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [sheets, setSheets] = useState([]);
    const [selectedSheet, setSelectedSheet] = useState('');
    const [workbookData, setWorkbookData] = useState(null);
    const [config, setConfig] = useState(null);
    const [showWizard, setShowWizard] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [chatMinimized, setChatMinimized] = useState(false);
    const [chatMessages, setChatMessages] = useState(null);


    // Multi-file support
    const [dataSources, setDataSources] = useState([]); // Array of { id, name, data, columns, sheets, workbookData, selectedSheet }
    const [showDataManager, setShowDataManager] = useState(false);
    const [joinConfig, setJoinConfig] = useState(null); // { primarySourceId, joins: [{ sourceId, primaryKey, foreignKey }] }

    // Data parsing settings
    const [showParsingSettings, setShowParsingSettings] = useState(false);
    const [parsingSettings, setParsingSettings] = useState({ headerRow: 1, dateFormat: 'auto' });

    // Parse a single file and return parsed data
    const parseFile = (uploadedFile) => {
        return new Promise((resolve) => {
            const ext = uploadedFile.name.split('.').pop().toLowerCase();

            if (ext === 'csv') {
                Papa.parse(uploadedFile, {
                    header: true,
                    dynamicTyping: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        const cleaned = results.data.map(row => {
                            const newRow = {};
                            Object.entries(row).forEach(([k, v]) => {
                                newRow[k.trim()] = typeof v === 'string' ? v.trim() : v;
                            });
                            return newRow;
                        });
                        resolve({
                            data: cleaned,
                            columns: results.meta.fields.map(f => f.trim()) || [],
                            sheets: [],
                            workbookData: null,
                            selectedSheet: ''
                        });
                    }
                });
            } else if (['xlsx', 'xls'].includes(ext)) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const workbook = XLSX.read(e.target.result, { type: 'binary', cellDates: true });
                    const sheetNames = workbook.SheetNames;
                    const allData = {};
                    sheetNames.forEach(name => {
                        const sheet = workbook.Sheets[name];
                        const data = XLSX.utils.sheet_to_json(sheet, { defval: null, raw: false, dateNF: 'yyyy-mm-dd' });
                        allData[name] = data.map(row => {
                            const newRow = {};
                            Object.entries(row).forEach(([k, v]) => {
                                const key = String(k).trim();
                                if (v instanceof Date) {
                                    newRow[key] = v;
                                } else if (typeof v === 'string') {
                                    newRow[key] = v.trim();
                                } else {
                                    newRow[key] = v;
                                }
                            });
                            return newRow;
                        });
                    });
                    const firstSheetData = allData[sheetNames[0]] || [];
                    resolve({
                        data: firstSheetData,
                        columns: firstSheetData.length > 0 ? Object.keys(firstSheetData[0]) : [],
                        sheets: sheetNames,
                        workbookData: allData,
                        selectedSheet: sheetNames[0]
                    });
                };
                reader.readAsBinaryString(uploadedFile);
            } else {
                resolve(null);
            }
        });
    };

    // Add new data source
    const addDataSource = async (uploadedFile) => {
        setIsProcessing(true);
        const parsed = await parseFile(uploadedFile);
        if (parsed) {
            const newSource = {
                id: Date.now().toString(),
                name: uploadedFile.name,
                ...parsed
            };
            setDataSources(prev => [...prev, newSource]);

            // If this is the first file, also set it as the main data
            if (dataSources.length === 0) {
                setFile(uploadedFile);
                setRawData(parsed.data);
                setColumns(parsed.columns);
                setSheets(parsed.sheets);
                setWorkbookData(parsed.workbookData);
                setSelectedSheet(parsed.selectedSheet);
                // Set as primary source
                setJoinConfig({ primarySourceId: newSource.id, joins: [] });
            }
        }
        setIsProcessing(false);
        return parsed;
    };

    // Remove data source
    const removeDataSource = (sourceId) => {
        setDataSources(prev => prev.filter(s => s.id !== sourceId));
        // If we removed the primary source, clear main data
        if (joinConfig?.primarySourceId === sourceId) {
            setJoinConfig(null);
        }
    };

    // Update sheet selection for a data source
    const updateDataSourceSheet = (sourceId, sheetName) => {
        setDataSources(prev => prev.map(source => {
            if (source.id === sourceId && source.workbookData) {
                const sheetData = source.workbookData[sheetName] || [];
                return {
                    ...source,
                    selectedSheet: sheetName,
                    data: sheetData,
                    columns: sheetData.length > 0 ? Object.keys(sheetData[0]) : []
                };
            }
            return source;
        }));
    };

    // Join data from multiple sources
    const joinDataSources = useCallback(() => {
        if (!joinConfig || dataSources.length === 0) return null;

        const primarySource = dataSources.find(s => s.id === joinConfig.primarySourceId);
        if (!primarySource) return null;

        let joinedData = [...primarySource.data];

        // Apply each join
        joinConfig.joins?.forEach(join => {
            const secondarySource = dataSources.find(s => s.id === join.sourceId);
            if (!secondarySource) return;

            // Create lookup map from secondary source
            const lookupMap = new Map();
            secondarySource.data.forEach(row => {
                const key = String(row[join.foreignKey] || '').toLowerCase().trim();
                if (key) {
                    lookupMap.set(key, row);
                }
            });

            // Join data
            joinedData = joinedData.map(row => {
                const key = String(row[join.primaryKey] || '').toLowerCase().trim();
                const matchedRow = lookupMap.get(key);
                if (matchedRow) {
                    // Merge fields from matched row, prefixing with source name if conflict
                    const merged = { ...row };
                    Object.entries(matchedRow).forEach(([k, v]) => {
                        if (k !== join.foreignKey) {
                            if (merged.hasOwnProperty(k)) {
                                merged[`${secondarySource.name.replace(/\.[^.]+$/, '')}_${k}`] = v;
                            } else {
                                merged[k] = v;
                            }
                        }
                    });
                    return merged;
                }
                return row;
            });
        });

        return joinedData;
    }, [dataSources, joinConfig]);

    // Get effective data (joined if configured, otherwise raw)
    const effectiveData = useMemo(() => {
        if (joinConfig && joinConfig.joins?.length > 0) {
            return joinDataSources() || rawData;
        }
        return rawData;
    }, [joinConfig, joinDataSources, rawData]);

    // Get effective columns
    const effectiveColumns = useMemo(() => {
        if (effectiveData && effectiveData.length > 0) {
            return Object.keys(effectiveData[0]);
        }
        return columns;
    }, [effectiveData, columns]);

    const handleFileUpload = async (event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        setIsProcessing(true);

        // If this is the first upload, reset everything
        if (dataSources.length === 0) {
            setRawData([]);
            setColumns([]);
            setSheets([]);
            setWorkbookData(null);
            setConfig(null);
        }

        // Process all uploaded files
        for (const uploadedFile of files) {
            await addDataSource(uploadedFile);
        }

        // Show parsing settings after upload
        setShowParsingSettings(true);

        setIsProcessing(false);
    };

    // Proceed to wizard with current data configuration
    const proceedToWizard = () => {
        // Update raw data with effective (possibly joined) data
        const data = effectiveData;
        const cols = effectiveColumns;

        if (data && data.length > 0) {
            setRawData(data);
            setColumns(cols);
            setShowDataManager(false);
            setShowWizard(true);
        }
    };

    // Handle parsing settings completion
    const handleParsingSettingsComplete = (settings, sheetSelections) => {
        setParsingSettings(settings);

        // Process sheet selections to create multiple data sources
        const newDataSources = [];

        dataSources.forEach(source => {
            const selectedSheets = sheetSelections[source.id];

            if (selectedSheets && selectedSheets.length > 0) {
                // Create a data source for each selected sheet
                selectedSheets.forEach(sheetName => {
                    const sheetData = source.workbookData ? source.workbookData[sheetName] : source.data;
                    newDataSources.push({
                        id: `${source.id}_${sheetName}`,
                        name: source.sheets.length > 1 ? `${source.name} - ${sheetName}` : source.name,
                        data: sheetData,
                        columns: sheetData.length > 0 ? Object.keys(sheetData[0]) : [],
                        sheets: [sheetName],
                        workbookData: null,
                        selectedSheet: sheetName
                    });
                });
            } else {
                // No sheet selection (single sheet or CSV), keep as-is
                newDataSources.push(source);
            }
        });

        setDataSources(newDataSources);

        // Set first source as primary
        if (newDataSources.length > 0) {
            setFile({ name: newDataSources[0].name });
            setRawData(newDataSources[0].data);
            setColumns(newDataSources[0].columns);
            setSheets(newDataSources[0].sheets);
            setJoinConfig({ primarySourceId: newDataSources[0].id, joins: [] });
        }

        setShowParsingSettings(false);

        // If multiple sources, show data manager for joining
        if (newDataSources.length > 1) {
            setShowDataManager(true);
        } else {
            // Single source, go straight to wizard
            setShowWizard(true);
        }
    };

    const handleSheetChange = (sheetName) => {
        setSelectedSheet(sheetName);
        setRawData(workbookData[sheetName]);
        if (workbookData[sheetName].length > 0) {
            setColumns(Object.keys(workbookData[sheetName][0]));
        }
    };

    // Process data with configuration
    const processedData = useMemo(() => {
        if (!rawData.length || !config) return null;

        const qualityConfig = QUALITY_TYPES[config.qualityType];
        const isNumericConfig = qualityConfig?.isNumeric === true;
        const scoreFormat = config.scoreFormat || 'numeric';

        // Collect numeric samples up-front for auto-threshold inference
        const parseNum = (raw) => {
            if (raw === null || raw === undefined) return NaN;
            const str = String(raw).trim();
            if (!str) return NaN;
            const match = str.match(/[-+]?\d*\.?\d+/);
            if (match) return parseFloat(match[0]);
            const asNum = Number(str);
            return Number.isFinite(asNum) ? asNum : NaN;
        };

        const numericSamples = [];
        rawData.forEach(row => {
            const n = parseNum(row[config.scoreColumn]);
            if (!isNaN(n)) numericSamples.push(n);
        });
        const uniqueNumeric = Array.from(new Set(numericSamples)).sort((a, b) => a - b);

        return rawData.map(row => {
            const expertId = row[config.expertIdColumn] ? String(row[config.expertIdColumn]).trim() : '';
            const scoreRaw = row[config.scoreColumn];
            const scoreStr = scoreRaw !== null && scoreRaw !== undefined ? String(scoreRaw).trim() : '';
            const scoreLower = scoreStr.toLowerCase();
            const numScore = parseNum(scoreRaw);
            const scoreLooksNumeric = scoreStr !== '' && Number.isFinite(numScore);
            const forceNumeric = config.scoringMode === 'numeric_score' || scoreFormat === 'numeric' || scoreFormat === 'percentage';
            const autoNumeric = !qualityConfig && scoreLooksNumeric && config.passValues.length === 0 && config.failValues.length === 0 && config.minorValues.length === 0;
            const isNumeric = isNumericConfig || forceNumeric || autoNumeric;
            const isBinary = scoreFormat === 'binary';

            let status = 'unknown';
            let isExcluded = config.excludeValues.some(v => v.toLowerCase() === scoreLower);

            if (!isExcluded) {
                if (isNumeric) {
                    // Numeric or percentage scoring system
                    if (!isNaN(numScore)) {
                        const effectiveScore = (scoreFormat === "percentage" && numScore <= 1) ? (numScore * 100) : numScore;

                        // Thresholds: use user-set, else defaults, else infer from data
                        let failThreshold = Number.isFinite(config.numericFailThreshold)
                            ? config.numericFailThreshold
                            : (qualityConfig?.defaultFailThreshold ?? (uniqueNumeric[0] ?? 0));
                        let minorThreshold = Number.isFinite(config.numericMinorThreshold)
                            ? config.numericMinorThreshold
                            : (qualityConfig?.defaultMinorThreshold ?? (uniqueNumeric[1] ?? (failThreshold + 1)));

                        if (!Number.isFinite(config.numericFailThreshold) && !Number.isFinite(config.numericMinorThreshold)) {
                            if (uniqueNumeric.length >= 2) {
                                failThreshold = uniqueNumeric[0];
                                minorThreshold = uniqueNumeric[1];
                            } else if (uniqueNumeric.length === 1) {
                                failThreshold = uniqueNumeric[0];
                                minorThreshold = uniqueNumeric[0] + 1; // avoid collapsing all scores into fail
                            }
                        }
                        if (!Number.isFinite(minorThreshold)) { minorThreshold = failThreshold + 1; }

                        // Inclusive thresholds so boundary values are counted as expected
                        if (effectiveScore <= failThreshold) {
                            status = 'fail';
                        } else if (effectiveScore <= minorThreshold) {
                            status = 'minor';
                        } else {
                            status = 'pass';
                        }
                    } else {
                        // If numeric is expected but value is not a number, mark as unknown
                        status = 'unknown';
                        console.warn(`Non-numeric score found: "${scoreStr}" for expert ${expertId}`);
                    }
                } else if (isBinary) {
                    const passBin = ['1', 'yes', 'true', 'y', 'strong pass', 'pass'];
                    const failBin = ['0', 'no', 'false', 'n', 'fail', 'reject'];
                    if (passBin.includes(scoreLower)) status = 'pass';
                    else if (failBin.includes(scoreLower)) status = 'fail';
                } else {
                    // Discrete text system
                    const isMinor = config.minorValues.some(v => v.toLowerCase() === scoreLower);
                    const isPass = config.passValues.some(v => v.toLowerCase() === scoreLower);
                    const isFail = config.failValues.some(v => v.toLowerCase() === scoreLower);

                    if (isMinor) status = 'minor';
                    else if (isPass) status = 'pass';
                    else if (isFail) status = 'fail';
                }
            }


            let date = '';
            if (config.timestampColumn && row[config.timestampColumn]) {
                const rawDate = row[config.timestampColumn];
                try {
                    // Handle Excel serial date numbers (days since 1899-12-30)
                    if (typeof rawDate === 'number') {
                        // Excel serial date - convert to JS date
                        // Excel's epoch is Dec 30, 1899 (accounting for the leap year bug)
                        const excelEpoch = new Date(1899, 11, 30);
                        const jsDate = new Date(excelEpoch.getTime() + rawDate * 24 * 60 * 60 * 1000);
                        if (!isNaN(jsDate.getTime()) && jsDate.getFullYear() > 1970) {
                            date = jsDate.toISOString().split('T')[0];
                        }
                    } else if (typeof rawDate === 'string') {
                        // Try parsing various string formats
                        const str = rawDate.trim();

                        // Check if it's already ISO format (YYYY-MM-DD)
                        if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
                            date = str.substring(0, 10);
                        }
                        // MM/DD/YYYY or M/D/YYYY format
                        else if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(str)) {
                            const parts = str.split(/[\s\/]/);
                            const month = parts[0].padStart(2, '0');
                            const day = parts[1].padStart(2, '0');
                            const year = parts[2].substring(0, 4);
                            date = `${year}-${month}-${day}`;
                        }
                        // DD/MM/YYYY format (if dateFormat is set)
                        else if (parsingSettings.dateFormat === 'DD/MM/YYYY' && /^\d{1,2}\/\d{1,2}\/\d{4}/.test(str)) {
                            const parts = str.split(/[\s\/]/);
                            const day = parts[0].padStart(2, '0');
                            const month = parts[1].padStart(2, '0');
                            const year = parts[2].substring(0, 4);
                            date = `${year}-${month}-${day}`;
                        }
                        // Try native Date parsing as fallback
                        else {
                            const d = new Date(str);
                            if (!isNaN(d.getTime()) && d.getFullYear() > 1970) {
                                date = d.toISOString().split('T')[0];
                            }
                        }
                    } else if (rawDate instanceof Date) {
                        // Already a Date object
                        if (!isNaN(rawDate.getTime())) {
                            date = rawDate.toISOString().split('T')[0];
                        }
                    }
                } catch (e) {
                    console.warn('Date parsing error:', e, rawDate);
                }
            }

            let qualityScore = null;
            if (config.qualityDimensionColumns?.length > 0) {
                const goodCount = config.qualityDimensionColumns.filter(col =>
                    String(row[col] || '').trim().toLowerCase() === config.goodValue.toLowerCase()
                ).length;
                qualityScore = (goodCount / config.qualityDimensionColumns.length) * 100;
            } else if (isNumeric && !isNaN(numScore)) {
                // Map numeric scores to a 0-100 quality scale based on observed range if no config range
                const minVal = qualityConfig?.minValue ?? (uniqueNumeric[0] ?? 0);
                const maxVal = qualityConfig?.maxValue ?? (uniqueNumeric[uniqueNumeric.length - 1] ?? (minVal + 1));
                const denom = (maxVal - minVal) === 0 ? 1 : (maxVal - minVal);
                const clamped = Math.min(Math.max(numScore, minVal), maxVal);
                qualityScore = ((clamped - minVal) / denom) * 100;
            }

            return {
                expertId,
                score: scoreStr,
                status,
                isExcluded,
                date,
                category: config.categoryColumn ? String(row[config.categoryColumn] || '').trim() : '',
                reviewer: config.reviewerColumn ? String(row[config.reviewerColumn] || '').trim() : '',
                taskLink: config.taskLinkColumn ? String(row[config.taskLinkColumn] || '').trim() : '',
                qualityScore,
                raw: row
            };
        }).filter(r => r.expertId);
    }, [rawData, config, parsingSettings]);

    // Metrics
    const metrics = useMemo(() => {
        if (!processedData) return null;

        const validData = processedData.filter(r => !r.isExcluded);
        const total = processedData.length;
        const totalValid = validData.length;
        const excluded = processedData.filter(r => r.isExcluded).length;
        const passCount = validData.filter(r => r.status === 'pass').length;
        const minorCount = validData.filter(r => r.status === 'minor').length;
        const failCount = validData.filter(r => r.status === 'fail').length;

        // Approval should include both pass and minor
        const approvalRate = totalValid > 0 ? ((passCount + minorCount) / totalValid) * 100 : 0;
        const defectRate = totalValid > 0 ? (failCount / totalValid) * 100 : 0;

        const qualityScores = processedData.filter(r => r.qualityScore !== null).map(r => r.qualityScore);
        const avgQuality = qualityScores.length > 0
            ? qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length : null;

        // Correlation between quality score and approval (pass/minor treated as approval = 1)
        let qualityApprovalCorrelation = null;
        const pairs = validData
            .filter(r => r.qualityScore !== null)
            .map(r => ({
                q: r.qualityScore,
                a: (r.status === 'pass' || r.status === 'minor') ? 1 : 0
            }));
        if (pairs.length >= 2) {
            const meanQ = pairs.reduce((s, p) => s + p.q, 0) / pairs.length;
            const meanA = pairs.reduce((s, p) => s + p.a, 0) / pairs.length;
            const covariance = pairs.reduce((s, p) => s + ((p.q - meanQ) * (p.a - meanA)), 0);
            const stdQ = Math.sqrt(pairs.reduce((s, p) => s + Math.pow(p.q - meanQ, 2), 0));
            const stdA = Math.sqrt(pairs.reduce((s, p) => s + Math.pow(p.a - meanA, 2), 0));
            const denom = stdQ * stdA;
            qualityApprovalCorrelation = denom > 0 ? covariance / denom : null;
        }

        return {
            total, totalValid, excluded, passCount, minorCount, failCount,
            approvalRate, defectRate, avgQuality, qualityApprovalCorrelation,
            uniqueExperts: new Set(processedData.map(r => r.expertId)).size,
            uniqueCategories: new Set(processedData.map(r => r.category).filter(Boolean)).size,
            uniqueReviewers: new Set(processedData.map(r => r.reviewer).filter(Boolean)).size
        };
    }, [processedData]);

    const passLabel = 'Strong Pass';
    const minorLabel = 'Weak Pass';
    const failLabel = 'Fail';

    // Expert performance
    const expertPerformance = useMemo(() => {
        if (!processedData) return [];
        const byExpert = {};
        processedData.forEach(r => {
            if (!byExpert[r.expertId]) byExpert[r.expertId] = { total: 0, pass: 0, minor: 0, fail: 0, excluded: 0, qualityScores: [] };
            byExpert[r.expertId].total++;
            if (r.isExcluded) byExpert[r.expertId].excluded++;
            else if (r.status === 'pass') byExpert[r.expertId].pass++;
            else if (r.status === 'minor') byExpert[r.expertId].minor++;
            else if (r.status === 'fail') byExpert[r.expertId].fail++;
            if (r.qualityScore !== null) byExpert[r.expertId].qualityScores.push(r.qualityScore);
        });

        return Object.entries(byExpert).map(([expert, data]) => {
            const validTotal = data.total - data.excluded;
            return {
                Expert: expert,
                Total: data.total,
                'Strong Pass': data.pass,
                'Weak Pass': data.minor,
                Fail: data.fail,
                'Approval %': validTotal > 0 ? ((data.pass + data.minor) / validTotal) * 100 : 0,
                'Weak Pass %': validTotal > 0 ? (data.minor / validTotal) * 100 : 0,
                'Defect %': validTotal > 0 ? (data.fail / validTotal) * 100 : 0,
                'Quality %': data.qualityScores.length > 0
                    ? data.qualityScores.reduce((a, b) => a + b, 0) / data.qualityScores.length : null
            };
        }).sort((a, b) => b.Total - a.Total);
    }, [processedData]);

    // Category breakdown
    const categoryBreakdown = useMemo(() => {
        if (!processedData) return [];
        const byCategory = {};

        processedData.filter(r => r.category && !r.isExcluded).forEach(r => {
          if (!byCategory[r.category]) byCategory[r.category] = { count: 0, pass: 0, minor: 0, fail: 0, qualityScores: [] };
          
          if (r.status === 'pass' || r.status === 'minor' || r.status === 'fail') {
            byCategory[r.category].count++;
            if (r.status === 'pass') byCategory[r.category].pass++;
            if (r.status === 'minor') byCategory[r.category].minor++;
            if (r.status === 'fail') byCategory[r.category].fail++;
          }
          if (r.qualityScore !== null) {
            byCategory[r.category].qualityScores.push(r.qualityScore);
          }
        });
      
        return Object.entries(byCategory).map(([cat, data]) => ({
          Category: cat,
          Count: data.count,
          'Strong Pass': data.pass,
          'Weak Pass': data.minor,
          Fail: data.fail,
          'Approval %': data.count > 0 ? ((data.pass + data.minor) / data.count) * 100 : 0,
          'Defect %': data.count > 0 ? (data.fail / data.count) * 100 : 0,
          'Quality %': data.qualityScores.length > 0
            ? data.qualityScores.reduce((a, b) => a + b, 0) / data.qualityScores.length
                : null
        })).sort((a, b) => b.Count - a.Count);
    }, [processedData]);

    // Reviewer stats
    const reviewerStats = useMemo(() => {
        if (!processedData) return [];
        const byReviewer = {};

        // Only count non-excluded records with valid status
        processedData.filter(r => r.reviewer && !r.isExcluded).forEach(r => {
          if (!byReviewer[r.reviewer]) byReviewer[r.reviewer] = { reviews: 0, pass: 0, minor: 0, fail: 0, qualityScores: [] };
          
          if (r.status === 'pass' || r.status === 'minor' || r.status === 'fail') {
            byReviewer[r.reviewer].reviews++;
                if (r.status === 'pass') byReviewer[r.reviewer].pass++;
                else if (r.status === 'minor') byReviewer[r.reviewer].minor++;
                else if (r.status === 'fail') byReviewer[r.reviewer].fail++;
            }
            if (r.qualityScore !== null) {
                byReviewer[r.reviewer].qualityScores.push(r.qualityScore);
            }
        });
      
        return Object.entries(byReviewer).map(([reviewer, data]) => ({
          Reviewer: reviewer,
          'Total Reviews': data.reviews,
          'Strong Pass Given': data.pass,
          'Weak Pass Given': data.minor,
          'Fail Given': data.fail,
          'Approval %': data.reviews > 0 ? ((data.pass + data.minor) / data.reviews) * 100 : 0,
          'Fail %': data.reviews > 0 ? (data.fail / data.reviews) * 100 : 0,
          'Quality %': data.qualityScores.length > 0
            ? data.qualityScores.reduce((a, b) => a + b, 0) / data.qualityScores.length
                : null
        })).sort((a, b) => b['Total Reviews'] - a['Total Reviews']);
    }, [processedData]);

    // Chart data
    const statusDistribution = useMemo(() => {
        if (!metrics) return [];
        return [
            { name: passLabel, value: metrics.passCount, color: '#10b981' },
            { name: minorLabel, value: metrics.minorCount, color: '#f59e0b' },
            { name: failLabel, value: metrics.failCount, color: '#ef4444' },
            { name: 'Excluded', value: metrics.excluded, color: '#6b7280' }
        ].filter(d => d.value > 0);
    }, [metrics, passLabel, minorLabel, failLabel]);

    const trendData = useMemo(() => {
        if (!processedData) return [];
        const byDate = {};
        processedData.filter(r => r.date).forEach(r => {
            if (!byDate[r.date]) byDate[r.date] = { date: r.date, total: 0, pass: 0, minor: 0, fail: 0 };
            byDate[r.date].total++;
            if (r.status === 'pass') byDate[r.date].pass++;
            if (r.status === 'minor') byDate[r.date].minor++;  // ADD THIS LINE
            if (r.status === 'fail') byDate[r.date].fail++;
        });
        return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date)).slice(-30);
    }, [processedData]);

    const qualityTrend = useMemo(() => {
        if (!processedData) return [];
        const byDate = {};
        processedData.filter(r => r.date && r.qualityScore !== null && !r.isExcluded).forEach(r => {
            if (!byDate[r.date]) byDate[r.date] = { date: r.date, sum: 0, count: 0 };
            byDate[r.date].sum += r.qualityScore;
            byDate[r.date].count += 1;
        });
        return Object.values(byDate)
            .map(d => ({ date: d.date, quality: d.count > 0 ? d.sum / d.count : 0 }))
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(-30);
    }, [processedData]);

    // Landing Page
    if (showLandingPage) {
        return <LandingPage onGetStarted={() => setShowLandingPage(false)} />;
    }

    // Data Parsing Settings
    if (showParsingSettings) {
        return (
            <DataParsingSettings
                dataSources={dataSources}
                onComplete={handleParsingSettingsComplete}
                onCancel={() => {
                    setDataSources([]);
                    setShowParsingSettings(false);
                }}
            />
        );
    }

    // Data Source Manager
    if (showDataManager) {
        return (
            <DataSourceManager
                dataSources={dataSources}
                onAddSource={addDataSource}
                onRemoveSource={removeDataSource}
                onUpdateSheet={updateDataSourceSheet}
                joinConfig={joinConfig}
                onJoinConfigChange={setJoinConfig}
                onProceed={proceedToWizard}
                isProcessing={isProcessing}
            />
        );
    }

    // Wizard
    if (showWizard && columns.length > 0) {
        return (
            <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-8">
                <div className="max-w-4xl mx-auto">
                    {/* Back to data manager if multiple sources */}
                    {dataSources.length > 1 && (
                        <button
                            onClick={() => { setShowWizard(false); setShowDataManager(true); }}
                            className="mb-4 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Data Sources
                        </button>
                    )}

                    {/* Sheet selector at top when multiple sheets */}
                    {sheets.length > 1 && (
                        <SheetSelector
                            sheets={sheets}
                            selectedSheet={selectedSheet}
                            onSheetChange={handleSheetChange}
                        />
                    )}

                    {/* Wizard content */}
                    <SetupWizard
                        columns={columns}
                        sampleData={rawData.slice(0, 100)}
                        onComplete={(c) => { setConfig(c); setShowWizard(false); }}
                        onCancel={() => {
                            setFile(null);
                            setRawData([]);
                            setColumns([]);
                            setShowWizard(false);
                            setDataSources([]);
                            setJoinConfig(null);
                            setShowParsingSettings(false);
                            setParsingSettings({ headerRow: 1, dateFormat: 'auto' });
                        }}
                    />
                </div>
            </div>
        );
    }

    // Dashboard
    if (config && metrics) {
        return (
            <div className="min-h-screen bg-slate-950 text-white">
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-500/10 via-transparent to-transparent rounded-full blur-3xl"></div>
                </div>

                <header className="relative z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl sticky top-0">
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                                    {config.projectType && PROJECT_TYPES[config.projectType]?.icon ? (
                                        React.createElement(PROJECT_TYPES[config.projectType].icon, { className: "h-6 w-6 text-white" })
                                    ) : (
                                        <BarChart3 className="h-6 w-6 text-white" />
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold">{config.projectName || `${PROJECT_TYPES[config.projectType]?.name} Dashboard`}</h1>
                                    <p className="text-sm text-slate-500">{file?.name} • {rawData.length.toLocaleString()} records</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* Export dropdown */}
                                <ExportMenu
                                    metrics={metrics}
                                    expertPerformance={expertPerformance}
                                    categoryBreakdown={categoryBreakdown}
                                    reviewerStats={reviewerStats}
                                    processedData={processedData}
                                    config={config}
                                    fileName={file?.name || 'qa-dashboard'}
                                />
                                {/* Chat Button */}
                                <button
                                    onClick={() => { setShowChat(true); setChatMinimized(false); }}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 rounded-xl text-sm text-white font-medium transition-all"
                                >
                                    <MessageSquare className="h-4 w-4" />
                                    Chat
                                    {chatMessages && chatMessages.length > 1 && (
                                        <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                                            {chatMessages.length - 1}
                                        </span>
                                    )}
                                </button>
                                {dataSources.length > 1 && (
                                    <button onClick={() => { setConfig(null); setShowDataManager(true); }} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm text-slate-300">
                                        <Database className="h-4 w-4" />Data Sources
                                    </button>
                                )}
                                <button onClick={() => setShowWizard(true)} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm text-slate-300">
                                    <Settings className="h-4 w-4" />Reconfigure
                                </button>
                                <button onClick={() => {
                                    setFile(null);
                                    setRawData([]);
                                    setColumns([]);
                                    setConfig(null);
                                    setDataSources([]);
                                    setJoinConfig(null);
                                    setShowWizard(false);
                                    setShowDataManager(false);
                                    setShowParsingSettings(false);
                                    setParsingSettings({ headerRow: 1, dateFormat: 'auto' });
                                }} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm text-slate-300">
                                    <Upload className="h-4 w-4" />New File
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="relative z-10 max-w-7xl mx-auto px-6 py-8 space-y-8">
                    {/* Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <MetricCard title="Total Records" value={metrics.total.toLocaleString()} subtitle={`${metrics.excluded} excluded`} icon={FileSpreadsheet} color="indigo" />
                        <MetricCard title="Approval Rate" value={`${metrics.approvalRate.toFixed(1)}%`} subtitle={`${passLabel}+${minorLabel} count as pass`} icon={CheckCircle2} color="emerald" />
                        <MetricCard title="Defect Rate" value={`${metrics.defectRate.toFixed(1)}%`} subtitle={`${metrics.failCount} failed`} icon={AlertTriangle} color={metrics.defectRate > 10 ? 'rose' : 'emerald'} />
                        <MetricCard title="Unique Experts" value={metrics.uniqueExperts.toLocaleString()} subtitle={`${metrics.uniqueReviewers} reviewers`} icon={Users} color="cyan" />
                        {metrics.avgQuality !== null && (
                            <MetricCard title="Avg Quality" value={`${metrics.avgQuality.toFixed(1)}%`} subtitle="across dimensions" icon={Award} color="amber" />
                        )}
                        {metrics.qualityApprovalCorrelation !== null && (
                            <MetricCard title="Quality vs Approval" value={metrics.qualityApprovalCorrelation.toFixed(2)} subtitle="correlation (r)" icon={Activity} color="rose" />
                        )}
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Status Distribution</h3>
                            <ResponsiveContainer width="100%" height={280}>
                                {config.chartPreferences.statusChart === 'bar' ? (
                                    <BarChart data={statusDistribution}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                        <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} />
                                        <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} />
                                        <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                                            itemStyle={{ color: '#e2e8f0' }} />
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                            {statusDistribution.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                                        </Bar>
                                    </BarChart>
                                ) : (
                                    <PieChart>
                                        <Pie
                                            data={statusDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={config.chartPreferences.statusChart === 'donut' ? 60 : 0}
                                            outerRadius={100}
                                            paddingAngle={2}
                                            dataKey="value"
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {statusDistribution.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                                            itemStyle={{ color: '#e2e8f0' }} />
                                        <Legend />
                                    </PieChart>
                                )}
                            </ResponsiveContainer>
                        </div>

                        {trendData.length > 0 && (
                            <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Submissions Over Time</h3>
                                <ResponsiveContainer width="100%" height={280}>
                                    {config.chartPreferences.trendChart === 'bar' ? (
                                        <BarChart data={trendData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                            <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }}
                                                tickFormatter={(d) => { const dt = new Date(d); return `${dt.getMonth() + 1}/${dt.getDate()}`; }} />
                                            <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} />
                                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                                                itemStyle={{ color: '#e2e8f0' }} />
                                            <Bar dataKey="total" fill="#6366F1" radius={[4, 4, 0, 0]} name="Total" />
                                            <Bar dataKey="pass" fill="#10b981" radius={[4, 4, 0, 0]} name="Pass" />
                                            <Bar dataKey="minor" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Minor" />
                                            <Bar dataKey="fail" fill="#ef4444" radius={[4, 4, 0, 0]} name="Fail" />
                                            <Legend />
                                        </BarChart>
                                    ) : config.chartPreferences.trendChart === 'line' ? (
                                        <LineChart data={trendData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                            <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }}
                                                tickFormatter={(d) => { const dt = new Date(d); return `${dt.getMonth() + 1}/${dt.getDate()}`; }} />
                                            <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} />
                                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                                                itemStyle={{ color: '#e2e8f0' }} />
                                            <Line type="monotone" dataKey="total" stroke="#6366F1" strokeWidth={2} name="Total" />
                                            <Line type="monotone" dataKey="pass" stroke="#10b981" strokeWidth={2} name="Pass" />
                                            <Line type="monotone" dataKey="minor" stroke="#f59e0b" strokeWidth={2} name="Minor" />
                                            <Line type="monotone" dataKey="fail" stroke="#ef4444" strokeWidth={2} name="Fail" />
                                            <Legend />
                                        </LineChart>
                                    ) : (
                                        <AreaChart data={trendData}>
                                            <defs>
                                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                            <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }}
                                                tickFormatter={(d) => { const dt = new Date(d); return `${dt.getMonth() + 1}/${dt.getDate()}`; }} />
                                            <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} />
                                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                                                itemStyle={{ color: '#e2e8f0' }} />
                                            <Area type="monotone" dataKey="total" stroke="#6366F1" fillOpacity={1} fill="url(#colorTotal)" name="Total" />
                                            <Line type="monotone" dataKey="pass" stroke="#10b981" strokeWidth={2} dot={false} name="Pass" />
                                            <Line type="monotone" dataKey="minor" stroke="#f59e0b" strokeWidth={2} dot={false} name="Minor" />
                                            <Line type="monotone" dataKey="fail" stroke="#ef4444" strokeWidth={2} dot={false} name="Fail" />
                                            <Legend />
                                        </AreaChart>
                                    )}
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>

                    {qualityTrend.length > 0 && (
                        <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Quality Over Time</h3>
                            <ResponsiveContainer width="100%" height={280}>
                                <LineChart data={qualityTrend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }}
                                        tickFormatter={(d) => { const dt = new Date(d); return `${dt.getMonth() + 1}/${dt.getDate()}`; }} />
                                    <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} />
                                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                                        itemStyle={{ color: '#e2e8f0' }} />
                                    <Line type="monotone" dataKey="quality" stroke="#a855f7" strokeWidth={2} dot={false} name="Quality %" />
                                    <Legend />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Category Chart */}
                    {categoryBreakdown.length > 0 && (
                        <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Category Distribution</h3>
                            <ResponsiveContainer width="100%" height={Math.max(200, categoryBreakdown.slice(0, 10).length * 40)}>
                                <BarChart data={categoryBreakdown.slice(0, 10)} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis type="number" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} />
                                    <YAxis type="category" dataKey="Category" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} width={150}
                                        tickFormatter={(v) => v.length > 25 ? v.substring(0, 22) + '...' : v} />
                                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                                        itemStyle={{ color: '#e2e8f0' }} />
                                    <Bar dataKey="Count" fill="#6366F1" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Tables */}
                    {config.showTables.expert && expertPerformance.length > 0 && (
                        <DataTable data={expertPerformance} title="Expert Performance"
                            columns={['Expert', 'Total', 'Strong Pass', 'Weak Pass', 'Fail', 'Approval %', 'Weak Pass %', 'Defect %', ...(metrics.avgQuality !== null ? ['Quality %'] : [])]} />
                    )}
                    {config.showTables.category && categoryBreakdown.length > 0 && (
                        <DataTable data={categoryBreakdown} title="Category Breakdown"
                            columns={['Category', 'Count', 'Strong Pass', 'Weak Pass', 'Fail', 'Approval %', 'Defect %', 'Quality %']} />
                    )}
                    {config.showTables.reviewer && reviewerStats.length > 0 && (
                        <DataTable data={reviewerStats} title="Reviewer Statistics"
                            columns={['Reviewer', 'Total Reviews', 'Strong Pass Given', 'Weak Pass Given', 'Fail Given', 'Approval %', 'Fail %',
                                'Quality %']} />
                    )}
                </main>
                {/* Chat Panel */}
                {showChat && !chatMinimized && (
                    <ChatPanel
                        config={config}
                        processedData={processedData}
                        metrics={metrics}
                        initialMessages={chatMessages}
                        onMessagesChange={setChatMessages}
                        onClose={() => {
                            setShowChat(false);
                            setChatMessages(null); // Clear on close
                        }}
                        onMinimize={() => setChatMinimized(true)}
                        onApplyChanges={(changes) => {
                            // Apply config changes
                            setConfig(prev => ({ ...prev, ...changes }));
                        }}
                    />
                )}

                {/* Minimized Chat Indicator */}
                {showChat && chatMinimized && (
                    <button
                        onClick={() => setChatMinimized(false)}
                        className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 rounded-xl text-white shadow-2xl z-50 transition-all"
                    >
                        <MessageSquare className="h-5 w-5" />
                        <span className="font-medium">AI Assistant</span>
                        {chatMessages && chatMessages.length > 1 && (
                            <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                                {chatMessages.length - 1}
                            </span>
                        )}
                    </button>
                )}
                <Footer />
            </div>
        );
    }

    // Upload screen
    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col">
            <Header onNavigateHome={() => setShowLandingPage(true)} showNav={true} />

            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-indigo-500/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-500/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative z-10 flex-1 flex items-center justify-center p-8">
                <div className="max-w-2xl w-full">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/30">
                            <BarChart3 className="h-10 w-10 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            QA Dashboard Generator
                        </h1>
                        <p className="text-slate-400 text-lg">
                            Upload your QA data and we'll guide you through creating a custom dashboard
                        </p>
                    </div>

                    <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
                        <label className={`block border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${isProcessing ? 'border-indigo-500/50 bg-indigo-500/10' : 'border-white/20 hover:border-indigo-500/50 hover:bg-white/5'
                            }`}>
                            <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} className="hidden" disabled={isProcessing} multiple />
                            {isProcessing ? (
                                <>
                                    <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-slate-300">Processing files...</p>
                                </>
                            ) : (
                                <>
                                    <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                                    <p className="text-lg font-medium text-white mb-2">Drop your files here or click to browse</p>
                                    <p className="text-sm text-slate-500">Supports CSV, XLSX, XLS • Multiple files supported</p>
                                </>
                            )}
                        </label>

                        <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
                            <div className="flex items-start gap-3">
                                <Info className="h-5 w-5 text-indigo-400 mt-0.5" />
                                <div className="text-sm text-indigo-200">
                                    <p className="font-medium mb-1">Multi-file support with data joining</p>
                                    <p className="text-indigo-300/70">
                                        Upload multiple files and connect them by a common field (e.g., Expert ID).
                                        Perfect for combining audit data with roster or metadata files.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}


