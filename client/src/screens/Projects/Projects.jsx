import { React, useState, useMemo } from "react";
import "./Projects.css";
import ProjectCard from "../../components/ProjectCard/ProjectCard"; // new detailed card
import Carousel from "../../components/Carousel/Carousel";
import PageHeading from "../../components/PageHeading/PageHeading";
// import ProgressBar from "../../components/ProgressBar/ProgressBar";
// import { Box } from "@mui/material";
// Category definitions
const categories = [
    { id: 'all', label: 'All Projects', tags: [] },
    { id: 'web', label: 'Web Dev', tags: ['web', 'react'] },
    { id: 'aiml', label: 'AI/ML', tags: ['ai/ml', 'nlp'] },
    { id: 'cyber', label: 'Cybersecurity', tags: ['cybersecurity'] },
    { id: 'cp', label: 'CP/DSA', tags: ['cp', 'leaderboard'] },
    { id: 'media', label: 'Media', tags: ['media'] },
];

// TODO: Replace this static data with fetched project list once API available
const projectData = [
    {
        title: "Dev Portfolio Platform",
        // subtitle: "central hub to showcase members' work",
        description: "Responsive portfolio generator for club members. Pulls GitHub stats & deployed project screenshots automatically. Custom theming + shareable profile links.",
        tags: ["web", "react", "automation"],
        publishedDate: "10th Jun",
        media: "/assets/thumbnail/development.png",
        liveUrl: "#",
        repoUrl: "#",
    },
    {
        title: "Cyber Threat Atlas",
        // subtitle: "visual dashboard of live security feeds",
        description: "Aggregates CVE + threat intel APIs. Heat-map & timeline of attack vectors. Plugin system for custom parsers.",
        tags: ["cybersecurity", "data viz", "dashboard"],
        publishedDate: "22nd Jul",
        media: "/assets/thumbnail/cybersecurity.png",
        liveUrl: "#",
        repoUrl: "#",
    },
    {
        title: "AI Study Buddy",
        // subtitle: "context aware Q&A for course PDFs",
        description: "Embeds lecture PDFs and enables semantic search. Chat interface with citation snippets. Local vector store fallback for privacy.",
        tags: ["ai/ml", "nlp", "education"],
        publishedDate: "5th Aug",
        media: "/assets/thumbnail/aiml.png",
        liveUrl: "#",
        repoUrl: "#",
    },
    {
        title: "CP Leaderboard Engine",
        // subtitle: "automated rating sync & progress charts",
        description: "Scrapes Codeforces + LeetCode standings nightly. Sparkline progress + streak tracking. Exports CSV & weekly digest mailer.",
        tags: ["cp", "leaderboard", "scraper"],
        publishedDate: "18th Aug",
        media: "/assets/thumbnail/cpdsa.png",
        liveUrl: "#",
        repoUrl: "#",
    },
    {
        title: "Event Media Pipeline",
        // subtitle: "auto clipping & tagging of session videos",
        description: "Uploads raw session videos and generates short reels. Speech-to-text + keyword tag extraction. Panel to approve & publish clips to socials.",
        tags: ["media", "automation", "ffmpeg"],
        publishedDate: "28th Aug",
        media: "/assets/thumbnail/media.png",
        liveUrl: "#",
        repoUrl: "#",
    },
];

const Projects = () => {
    const [activeCategory, setActiveCategory] = useState('all');

    // Filter projects based on active category
    const filteredProjects = useMemo(() => {
        if (activeCategory === 'all') {
            return projectData;
        }
        
        const selectedCategory = categories.find(cat => cat.id === activeCategory);
        if (!selectedCategory) return projectData;
        
        return projectData.filter(project => 
            project.tags.some(tag => selectedCategory.tags.includes(tag))
        );
    }, [activeCategory]);

    // Generate carousel items from filtered projects
    const variants = useMemo(() => 
        filteredProjects.map((p, idx) => (
            <div key={`${activeCategory}-${idx}`}>
                <ProjectCard {...p} />
            </div>
        )),
        [filteredProjects, activeCategory]
    );

    return (
        <div className="chapters-wrapper page">
            <div className="bg">
                <img src="/assets/bg/home_bg.png" alt="" />
            </div>
            <PageHeading text={"PROJECTS"} />
            
            {/* Category Filter Tabs */}
            <div className="project-categories">
                {categories.map(category => (
                    <button
                        key={category.id}
                        className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
                        onClick={() => setActiveCategory(category.id)}
                    >
                        {category.label}
                    </button>
                ))}
            </div>

            <div className="inner-content">
                <Carousel items={variants} />
            </div>
        </div>
    );
};

export default Projects;