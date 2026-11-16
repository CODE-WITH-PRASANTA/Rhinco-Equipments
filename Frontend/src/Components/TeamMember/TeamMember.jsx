import React, { useEffect, useState } from "react";
import "./TeamMember.css";
import { API_ENDPOINTS } from "../../config/api";

const TEAM_API = API_ENDPOINTS.TEAM;

const fallbackAvatar =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='450' viewBox='0 0 400 450'%3E%3Crect width='100%25' height='100%25' fill='%23f1f5f9'/%3E%3Ccircle cx='200' cy='170' r='70' fill='%23cbd5e1'/%3E%3Cpath d='M80 380 c0-70 55-120 120-120 s120 50 120 120 Z' fill='%23cbd5e1'/%3E%3C/svg%3E";

const TeamMember = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setLoading(true);
        const res = await fetch(TEAM_API);
        if (!res.ok) {
          throw new Error(`Failed to fetch team members: ${res.statusText}`);
        }
        const result = await res.json();
        if (result.success && Array.isArray(result.data)) {
          setTeamMembers(result.data);
        } else {
          setTeamMembers([]);
        }
      } catch (err) {
        console.error("Error loading team members:", err);
        setError("Unable to load team members right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  return (
    <section className="TeamMember-section">
      <div className="TeamMember-container">

        <div className="TeamMember-header">
          <div className="TeamMember-heading-content">
            <span className="TeamMember-subtitle">
              OUR PEOPLE, OUR STRENGTH
            </span>

            <h2 className="TeamMember-title">
              Meet Our <span>Expert Team</span>
            </h2>

            <p className="TeamMember-intro">
              Behind every successful harvest is a dedicated team.
              Meet the people working together to build a better
              agricultural future with Rhinco Equipments.
            </p>
          </div>

          <div className="TeamMember-count">
            <strong>{String(teamMembers.length).padStart(2, "0")}</strong>
            <span>Dedicated Members</span>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#64748b" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                border: "4px solid #e2e8f0",
                borderTopColor: "#729a36",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 16px",
              }}
            />
            <p style={{ fontSize: "15px", fontWeight: 500 }}>
              Fetching real team members from database...
            </p>
          </div>
        )}

        {/* ERROR STATE */}
        {!loading && error && (
          <div
            style={{
              textAlign: "center",
              padding: "30px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "10px",
              color: "#b91c1c",
              marginBottom: "30px",
            }}
          >
            <p style={{ margin: 0, fontWeight: 600 }}>{error}</p>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && teamMembers.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              background: "#f8fafc",
              borderRadius: "12px",
              color: "#64748b",
            }}
          >
            <h3 style={{ color: "#334155", marginBottom: "8px" }}>
              No Team Members Found
            </h3>
            <p>Team members added via the Admin Panel will appear here.</p>
          </div>
        )}

        {/* TEAM GRID */}
        {!loading && teamMembers.length > 0 && (
          <div className="TeamMember-grid">
            {teamMembers.map((member, index) => (
              <article
                className="TeamMember-card"
                key={member._id || member.id || index}
              >
                <div className="TeamMember-image-box">
                  <img
                    className="TeamMember-image"
                    src={member.image || fallbackAvatar}
                    alt={member.name}
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.src = fallbackAvatar;
                    }}
                  />

                  <span className="TeamMember-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="TeamMember-image-overlay">
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="TeamMember-email-icon"
                        aria-label={`Email ${member.name}`}
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <rect x="3" y="5" width="18" height="14" rx="2" />
                          <path d="m3 7 9 7 9-7" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>

                <div className="TeamMember-details">
                  <span className="TeamMember-department">
                    {member.department || member.designation || "Core Team"}
                  </span>

                  <h3 className="TeamMember-name">{member.name}</h3>

                  <p className="TeamMember-role">{member.designation}</p>

                  {member.description && (
                    <p className="TeamMember-description">
                      {member.description}
                    </p>
                  )}

                  <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="TeamMember-contact"
                      >
                        Email Member
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M7 17 17 7M7 7h10v10" />
                        </svg>
                      </a>
                    )}
                    {member.contact && (
                      <a
                        href={`tel:${member.contact}`}
                        className="TeamMember-contact"
                        style={{ background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" }}
                      >
                        Call
                        <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: 14, height: 14 }}>
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="TeamMember-bottom">
          <div className="TeamMember-bottom-content">
            <span>GROW WITH RHINCO EQUIPMENTS</span>
            <h3>Great things happen when we grow together.</h3>
          </div>

          <a href="/contact" className="TeamMember-button">
            Contact Our Team
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 17 17 7M7 7h10v10" />
            </svg>
          </a>
        </div>

      </div>
    </section>
  );
};

export default TeamMember;
