
import React from "react";
import "./TeamMember.css";

const teamMembers = [
  {
    id: 1,
    name: "Rahul Sharma",
    role: "Founder & CEO",
    department: "Management",
    description: "Leading our vision to make agriculture smarter and more sustainable.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=85",
    email: "rahul@farmtechagro.com",
  },
  {
    id: 2,
    name: "Priya Das",
    role: "Agriculture Specialist",
    department: "Agriculture",
    description: "Helping farmers discover better crop practices and farming solutions.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=85",
    email: "priya@farmtechagro.com",
  },
  {
    id: 3,
    name: "Amit Kumar",
    role: "Operations Manager",
    department: "Operations",
    description: "Managing operations to ensure reliable service and smooth delivery.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=85",
    email: "amit@farmtechagro.com",
  },
  {
    id: 4,
    name: "Sneha Patel",
    role: "Marketing Manager",
    department: "Marketing",
    description: "Building meaningful connections between farmers and quality products.",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=600&auto=format&fit=crop&q=85",
    email: "sneha@farmtechagro.com",
  },
  {
    id: 5,
    name: "Vikash Singh",
    role: "Product Manager",
    department: "Product",
    description: "Developing product strategies for real-world farming requirements.",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=85",
    email: "vikash@farmtechagro.com",
  },
  {
    id: 6,
    name: "Ananya Mohanty",
    role: "Customer Support Lead",
    department: "Support",
    description: "Ensuring every farmer receives friendly and dependable support.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=85",
    email: "ananya@farmtechagro.com",
  },
  {
    id: 7,
    name: "Rohit Verma",
    role: "Technology Lead",
    department: "Technology",
    description: "Using technology and innovation to improve modern farming.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=85",
    email: "rohit@farmtechagro.com",
  },
  {
    id: 8,
    name: "Neha Sahoo",
    role: "Finance Executive",
    department: "Finance",
    description: "Supporting business growth through careful financial planning.",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=85",
    email: "neha@farmtechagro.com",
  },
];

const TeamMember = () => {
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
              agricultural future.
            </p>
          </div>

          <div className="TeamMember-count">
            <strong>08</strong>
            <span>Dedicated Members</span>
          </div>
        </div>

        <div className="TeamMember-grid">
          {teamMembers.map((member) => (
            <article className="TeamMember-card" key={member.id}>
              <div className="TeamMember-image-box">
                <img
                  className="TeamMember-image"
                  src={member.image}
                  alt={member.name}
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.src =
                      "https://placehold.co/600x650/eaf1df/356005?text=Team+Member";
                  }}
                />

                <span className="TeamMember-number">
                  {String(member.id).padStart(2, "0")}
                </span>

                <div className="TeamMember-image-overlay">
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
                </div>
              </div>

              <div className="TeamMember-details">
                <span className="TeamMember-department">
                  {member.department}
                </span>

                <h3 className="TeamMember-name">{member.name}</h3>

                <p className="TeamMember-role">{member.role}</p>

                <p className="TeamMember-description">
                  {member.description}
                </p>

                <a
                  href={`mailto:${member.email}`}
                  className="TeamMember-contact"
                >
                  Contact Member
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M7 17 17 7M7 7h10v10" />
                  </svg>
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="TeamMember-bottom">
          <div className="TeamMember-bottom-content">
            <span>GROW WITH FARMTECH AGRO</span>
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
