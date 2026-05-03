import React from 'react';
import { Briefcase, Heart, Zap, Coffee, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Careers = () => {
  const jobs = [
    { title: "Senior Frontend Engineer", department: "Engineering", type: "Full-time", location: "Remote" },
    { title: "Clinical Pharmacist", department: "Medical", type: "Full-time", location: "New York, NY" },
    { title: "Product Designer", department: "Design", type: "Full-time", location: "Remote" },
    { title: "Customer Success Agent", department: "Support", type: "Part-time", location: "Austin, TX" }
  ];

  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem', maxWidth: '800px', margin: '0 auto 4rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Build the Future of Health
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', lineHeight: '1.6' }}>
          Join a team of passionate innovators, doctors, and engineers dedicated to making healthcare universally accessible. We are always looking for top talent.
        </p>
      </div>

      <div style={{ marginBottom: '5rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2rem' }}>Why work with us?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          {[
            { icon: <Heart size={28} />, title: 'Health First', desc: 'Comprehensive medical, dental, and vision coverage for you and your dependents.' },
            { icon: <Zap size={28} />, title: 'Impactful Work', desc: 'Every line of code and every decision directly impacts peoples health and lives.' },
            { icon: <Briefcase size={28} />, title: 'Flexible Working', desc: 'Work from wherever you are happiest. We support fully remote and hybrid setups.' },
            { icon: <Coffee size={28} />, title: 'Great Culture', desc: 'Regular team offsites, continuous learning stipends, and a culture of radical candor.' }
          ].map((perk, i) => (
            <div key={i} style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
              <div style={{ color: 'var(--primary)', marginBottom: '1rem' }}>{perk.icon}</div>
              <h3 style={{ marginBottom: '0.75rem', fontSize: '1.25rem' }}>{perk.title}</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{perk.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 style={{ marginBottom: '2rem', fontSize: '2rem' }}>Open Positions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {jobs.map((job, index) => (
            <div key={index} style={{ background: 'var(--surface)', padding: '1.5rem 2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all var(--transition-fast)' }} className="hover-lift">
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{job.title}</h3>
                <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  <span style={{ fontWeight: 500, color: 'var(--primary)' }}>{job.department}</span>
                  <span>•</span>
                  <span>{job.type}</span>
                  <span>•</span>
                  <span>{job.location}</span>
                </div>
              </div>
              <Link to="/contact" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Apply <ChevronRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Careers;
