import React, { useState, useContext, useEffect } from 'react';
import { UploadCloud, FileText, CheckCircle, Clock, AlertCircle, User, Phone, MapPin, Search } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import './Prescription.css';

const Prescription = () => {
  const { user } = useContext(AppContext);
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadState, setUploadState] = useState('idle'); // idle, uploading, success
  
  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  
  // Past prescriptions
  const [pastPrescriptions, setPastPrescriptions] = useState([]);
  const [suggestedPrescription, setSuggestedPrescription] = useState(null);
  const [usedPast, setUsedPast] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      fetch(`http://localhost:5000/prescriptions?userId=${user.id}`)
        .then(res => res.json())
        .then(data => setPastPrescriptions(data))
        .catch(err => console.error(err));
    }
  }, [user]);

  const handleDrag = function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = function(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      checkFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = function(e) {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      checkFile(e.target.files[0]);
    }
  };

  const checkFile = (selectedFile) => {
    if (!user) {
      setFile(selectedFile);
      return;
    }
    // Intelligent detection
    const similar = pastPrescriptions.find(p => p.fileName === selectedFile.name);
    if (similar) {
      setSuggestedPrescription(similar);
      setFile(selectedFile); // Store temporarily just in case
    } else {
      setFile(selectedFile);
      setUsedPast(false);
    }
  };

  const handleUpload = (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to upload a prescription.");
      return;
    }
    if (!file && !usedPast) {
      alert("Please select a prescription file.");
      return;
    }

    setUploadState('uploading');

    // Prepare data
    const prescriptionData = {
      userId: user.id,
      customerName: name,
      phone: phone,
      address: address,
      fileName: usedPast ? file.name : file.name,
      uploadedAt: new Date().toISOString(),
      status: 'pending'
    };

    setTimeout(() => {
      fetch('http://localhost:5000/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prescriptionData)
      })
      .then(res => res.json())
      .then(data => {
        setUploadState('success');
        setPastPrescriptions([...pastPrescriptions, data]);
      })
      .catch(err => {
        console.error("Upload failed", err);
        setUploadState('idle');
      });
    }, 1500);
  };

  const useSuggested = () => {
    setFile({ name: suggestedPrescription.fileName });
    setUsedPast(true);
    setName(suggestedPrescription.customerName || name);
    setPhone(suggestedPrescription.phone || phone);
    setAddress(suggestedPrescription.address || address);
    setSuggestedPrescription(null);
  };

  const rejectSuggested = () => {
    setUsedPast(false);
    setSuggestedPrescription(null);
  };

  const reusePast = (pastRecord) => {
    setFile({ name: pastRecord.fileName });
    setUsedPast(true);
    setName(pastRecord.customerName || name);
    setPhone(pastRecord.phone || phone);
    setAddress(pastRecord.address || address);
  };

  return (
    <div className="prescription-container" style={{ maxWidth: '900px' }}>
      <div className="prescription-header">
        <h1>Upload Prescription</h1>
        <p>
          Let our pharmacists do the work for you. Upload your prescription and we will arrange the medicines for fast delivery.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Upload Form Section */}
        <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
          {uploadState === 'idle' && (
            <form onSubmit={handleUpload}>
              
              {!user && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={20} /> Please login to securely save your prescriptions and details.
                </div>
              )}

              {suggestedPrescription && (
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6', padding: '1.5rem', borderRadius: 'var(--radius-lg)', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: '#3b82f6' }}>
                    <Search size={24} />
                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Similar Prescription Detected!</h3>
                  </div>
                  <p style={{ marginBottom: '1rem' }}>We noticed you previously uploaded a prescription named <strong>{suggestedPrescription.fileName}</strong> on {new Date(suggestedPrescription.uploadedAt).toLocaleDateString()}.</p>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="button" className="btn btn-primary" onClick={useSuggested}>Use Previous Upload</button>
                    <button type="button" className="btn" style={{ background: 'transparent', border: '1px solid var(--border)' }} onClick={rejectSuggested}>Upload as New</button>
                  </div>
                </div>
              )}

              {!suggestedPrescription && (
                <>
                  <div 
                    className={`upload-area ${dragActive ? 'drag-active' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    style={{ marginBottom: '2rem' }}
                  >
                    <input 
                      type="file" 
                      className="upload-input" 
                      onChange={handleChange} 
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    <div className="upload-icon">
                      <UploadCloud size={40} />
                    </div>
                    <h3>Drag & Drop your prescription here</h3>
                    <p>Supported formats: PDF, JPG, PNG (Max size: 10MB)</p>
                    <button className="btn btn-primary" type="button" style={{ marginTop: '1rem' }}>Browse Files</button>
                    
                    {file && (
                      <div style={{ marginTop: '1.5rem', padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: 'var(--radius-md)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle size={18} /> {file.name} {usedPast ? '(Re-using past upload)' : '(Ready to upload)'}
                      </div>
                    )}
                  </div>

                  <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', fontSize: '1.25rem' }}>Delivery Details</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div className="input-group">
                      <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={16}/> Customer Name</label>
                      <input type="text" className="input-field" value={name} onChange={e => setName(e.target.value)} required placeholder="John Doe" />
                    </div>
                    <div className="input-group">
                      <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={16}/> Phone Number</label>
                      <input type="tel" className="input-field" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="+1 234 567 890" />
                    </div>
                    <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={16}/> Delivery Address</label>
                      <textarea className="input-field" value={address} onChange={e => setAddress(e.target.value)} required placeholder="Full home address for delivery" rows="3"></textarea>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '1.1rem', padding: '1rem' }}>
                    Submit Prescription
                  </button>
                </>
              )}
            </form>
          )}

          {uploadState === 'uploading' && (
            <div className="upload-area" style={{ cursor: 'default', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="upload-icon" style={{ animation: 'float 2s infinite' }}>
                <FileText size={40} />
              </div>
              <h3>Processing...</h3>
              <p>Securely saving your prescription and details.</p>
            </div>
          )}

          {uploadState === 'success' && (
            <div className="upload-area" style={{ borderColor: 'var(--accent)', background: 'rgba(16, 185, 129, 0.05)', cursor: 'default', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="upload-icon" style={{ background: 'var(--accent)', color: 'white' }}>
                <CheckCircle size={40} />
              </div>
              <h3 style={{ color: 'var(--accent)' }}>Submission Successful!</h3>
              <p>Your prescription has been securely saved to your profile.</p>
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-md)', margin: '1rem auto 2rem', textAlign: 'left', border: '1px solid var(--border)', width: '100%', maxWidth: '400px', color: 'var(--text-primary)' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Delivery Details</div>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.25rem' }}>{name}</div>
                <div style={{ marginBottom: '0.75rem' }}>{phone}</div>
                <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{address}</div>
              </div>
              <button className="btn btn-secondary" onClick={() => { setUploadState('idle'); setFile(null); setUsedPast(false); }}>Upload Another</button>
            </div>
          )}
        </div>

        {/* Past Prescriptions Section */}
        {user && pastPrescriptions.length > 0 && uploadState === 'idle' && (
          <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem' }}><Clock size={24} /> Past Prescriptions</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1rem' }}>Select a previously uploaded prescription to save time.</p>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              {pastPrescriptions.map((past, idx) => (
                <div key={idx} style={{ padding: '1rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                      <FileText size={24} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{past.fileName}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Uploaded on {new Date(past.uploadedAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <button type="button" className="btn" style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '0.5rem 1rem' }} onClick={() => reusePast(past)}>
                    Re-use
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="steps-container" style={{ marginTop: '3rem' }}>
          <div className="step-card">
            <div className="step-number">1</div>
            <h4>Upload Prescription</h4>
            <p>Upload a clear image or PDF of your doctor's valid prescription.</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h4>Pharmacist Review</h4>
            <p>Our licensed pharmacists will verify the prescription details and dosage.</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h4>Doorstep Delivery</h4>
            <p>Once approved, your genuine medicines are packed and delivered swiftly.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Prescription;
