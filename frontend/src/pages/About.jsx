
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  HeartPulse,
  BookOpen,
  Users,
  Syringe,
  Pill,
  Activity,
  Stethoscope,
  Building2,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import "./About.css";

function About() {
  const services = [
    {
      icon: Syringe,
      title: "Vaccine Information",
      description:
        "Explore vaccine information, uses, manufacturers, and other relevant details.",
      link: "/vaccines",
    },
    {
      icon: Pill,
      title: "Medicine Information",
      description:
        "Discover medicine information to support better general health awareness.",
      link: "/medicines",
    },
    {
      icon: Activity,
      title: "Disease Awareness",
      description:
        "Learn about diseases, their symptoms, prevention, and available information.",
      link: "/diseases",
    },
    {
      icon: Stethoscope,
      title: "Find Doctors",
      description:
        "Explore the doctor directory and discover healthcare professionals.",
      link: "/doctors",
    },
    {
      icon: Building2,
      title: "Hospitals",
      description:
        "Explore hospital and healthcare facility information.",
      link: "/hospitals",
    },
  ];

  const values = [
    {
      icon: ShieldCheck,
      title: "Reliable Information",
      description:
        "We aim to make healthcare information accessible through appropriate references and verification.",
    },
    {
      icon: BookOpen,
      title: "Health Awareness",
      description:
        "We encourage users to understand healthcare topics and make informed decisions with professional guidance.",
    },
    {
      icon: HeartPulse,
      title: "Accessible Healthcare Knowledge",
      description:
        "We bring different healthcare information categories together in one convenient platform.",
    },
    {
      icon: Users,
      title: "User-Focused Experience",
      description:
        "We focus on making healthcare information easier to explore, understand, and navigate.",
    },
  ];

  return (
    <main className="about-page">

      {/* HERO SECTION */}

      <section className="about-hero">
        <div className="about-hero-content">
          <span className="about-eyebrow">
            ABOUT VAXCARE
          </span>

          <h1>
            Making Healthcare Information
            <span> Easier to Access.</span>
          </h1>

          <p>
            VaxCare is a healthcare information platform
            designed to help people explore vaccine,
            medicine, disease, doctor, and hospital
            information in one place.
          </p>

          <div className="about-hero-actions">
            <Link to="/vaccines" className="about-primary-button">
              Explore Healthcare
              <ArrowRight size={19} />
            </Link>

            <Link to="/doctors" className="about-secondary-button">
              Find Doctors
            </Link>
          </div>
        </div>

        <div className="about-hero-visual">
          <div className="about-visual-card">
            <div className="about-visual-icon">
              <HeartPulse size={58} />
            </div>

            <h3>Healthcare, made accessible</h3>

            <p>
              Explore healthcare knowledge with a
              simpler and more organized experience.
            </p>

            <div className="about-visual-badge">
              <ShieldCheck size={18} />
              Information-focused platform
            </div>
          </div>

          <div className="about-floating-icon about-floating-one">
            <Syringe size={25} />
          </div>

          <div className="about-floating-icon about-floating-two">
            <Pill size={25} />
          </div>
        </div>
      </section>

      {/* INTRODUCTION */}

      <section className="about-introduction">
        <div className="about-section-heading">
          <span className="about-eyebrow">
            WHO WE ARE
          </span>

          <h2>
            One Platform. Multiple Healthcare Resources.
          </h2>

          <p>
            Finding understandable healthcare information
            should be straightforward. VaxCare brings
            multiple healthcare information categories
            together to help users explore relevant
            resources conveniently.
          </p>
        </div>
      </section>

      {/* MISSION AND VISION */}

      <section className="about-mission-section">
        <div className="about-mission-card">
          <div className="about-card-icon">
            <HeartPulse size={29} />
          </div>

          <h3>Our Mission</h3>

          <p>
            To make healthcare information easier to
            discover and understand by providing an
            organized platform for exploring vaccines,
            medicines, diseases, and healthcare services.
          </p>
        </div>

        <div className="about-mission-card">
          <div className="about-card-icon">
            <ShieldCheck size={29} />
          </div>

          <h3>Our Vision</h3>

          <p>
            To contribute to better health awareness by
            connecting people with accessible healthcare
            information and helping them find relevant
            healthcare resources.
          </p>
        </div>
      </section>

      {/* HEALTHCARE SERVICES */}

      <section className="about-services-section">
        <div className="about-section-heading">
          <span className="about-eyebrow">
            WHAT YOU CAN EXPLORE
          </span>

          <h2>Explore VaxCare Services</h2>

          <p>
            Discover the different healthcare information
            sections available on our platform.
          </p>
        </div>

        <div className="about-services-grid">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <Link
                to={service.link}
                className="about-service-card"
                key={service.title}
              >
                <div className="about-service-icon">
                  <Icon size={27} />
                </div>

                <h3>{service.title}</h3>

                <p>{service.description}</p>

                <span className="about-service-link">
                  Explore
                  <ArrowRight size={17} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* OUR VALUES */}

      <section className="about-values-section">
        <div className="about-section-heading">
          <span className="about-eyebrow">
            WHAT GUIDES US
          </span>

          <h2>Our Core Values</h2>
        </div>

        <div className="about-values-grid">
          {values.map((value) => {
            const Icon = value.icon;

            return (
              <div
                className="about-value-card"
                key={value.title}
              >
                <div className="about-value-icon">
                  <Icon size={26} />
                </div>

                <h3>{value.title}</h3>

                <p>{value.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* INFORMATION RESPONSIBILITY */}

      <section className="about-responsibility">
        <div className="about-responsibility-icon">
          <CheckCircle2 size={32} />
        </div>

        <div>
          <h2>Information with Responsibility</h2>

          <p>
            VaxCare is an informational platform. Its
            content is intended for general awareness
            and should not replace professional medical
            advice, diagnosis, or treatment. Always
            consult a qualified healthcare professional
            for personal medical decisions.
          </p>
        </div>
      </section>

      {/* FINAL CTA */}

      <section className="about-cta">
        <span className="about-eyebrow">
          START EXPLORING
        </span>

        <h2>
          Your Healthcare Information Journey Starts Here.
        </h2>

        <p>
          Explore healthcare resources and discover
          information available on VaxCare.
        </p>

        <Link to="/vaccines" className="about-primary-button">
          Explore VaxCare
          <ArrowRight size={19} />
        </Link>
      </section>

    </main>
  );
}

export default About;
