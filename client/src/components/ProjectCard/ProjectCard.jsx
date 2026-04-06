import PropTypes from "prop-types";
import "./ProjectCard.css";
import { Box } from "@mui/material";

// Globe/World Icon for Live link
const GlobeIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

// GitHub Icon for Repo link
const GitHubIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

const ProjectCard = ({
  name,
  title,
  // subtitle,
  description,
  tags = [],
  publishedDate,
  media,
  liveUrl,
  repoUrl,
}) => {
  const displayTitle = title || name;
  const dateText = publishedDate instanceof Date
    ? publishedDate.toLocaleDateString(undefined, { day: "numeric", month: "short" })
    : publishedDate;

  return (
    <Box className="projectcard-detailed">
      {media && (
        <div className="projectcard-media">
          <img src={media} alt={displayTitle + " preview"} loading="lazy" />
        </div>
      )}
      <div className="projectcard-body">
        <div className="projectcard-header">
          <div className="projectcard-titleblock">
            <h3 className="projectcard-title">{displayTitle}</h3>
            {/* {subtitle && <p className="projectcard-subtitle">{subtitle}</p>} */}
            {(liveUrl || repoUrl) && (
              <div className="projectcard-links">
                {liveUrl && (
                  <a
                    className="projectcard-tag projectcard-tag-live"
                    href={liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="View Live"
                    aria-label="View Live Project"
                  >
                    <GlobeIcon />
                  </a>
                )}
                {repoUrl && (
                  <a
                    className="projectcard-tag projectcard-tag-repo"
                    href={repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="View Repository"
                    aria-label="View Source Code Repository"
                  >
                    <GitHubIcon />
                  </a>
                )}
              </div>
            )}
          </div>
          {dateText && (
            <div className="projectcard-date-badge">
              <span className="label">published date</span>
              <span className="date-value">{dateText}</span>
            </div>
          )}
        </div>
        {description && (
          <div className="projectcard-description">
            <p>{description}</p>
          </div>
        )}
        {tags.length > 0 && (
          <div className="projectcard-tags">
            {tags.map((t) => (
              <span className="projectcard-tag" key={t}>{t}</span>
            ))}
          </div>
        )}
      </div>
    </Box>
  );
};

ProjectCard.propTypes = {
  name: PropTypes.string, // legacy name
  title: PropTypes.string,
  subtitle: PropTypes.string,
  description: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.string),
  publishedDate: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date),
  ]),
  media: PropTypes.string,
  liveUrl: PropTypes.string,
  repoUrl: PropTypes.string,
};

export default ProjectCard;
