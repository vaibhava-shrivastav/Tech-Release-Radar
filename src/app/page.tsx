'use client';

import React, { useState, useEffect } from 'react';
import ReleaseCard from '../components/ReleaseCard';
import { EnrichedRelease } from '../lib/types';
import { mockReleases } from '../lib/mock-data';
import { Radar, RefreshCw, Filter, Bell, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const [releases, setReleases] = useState<EnrichedRelease[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false); // Default to live
  const [isSyncing, setIsSyncing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setErrorMsg(null);
      if (isDemo) {
        setReleases(mockReleases);
      } else {
        try {
          const res = await fetch('/api/releases');
          if (res.ok) {
            const data = await res.json();
            setReleases(data.releases || []);
          } else {
            setErrorMsg('Failed to load live data.');
            setReleases([]);
          }
        } catch (e) {
          setErrorMsg('Network error fetching releases.');
          setReleases([]);
        }
      }
      setIsLoading(false);
    }
    loadData();
  }, [isDemo]);

  const handleCheckNow = async () => {
    setIsSyncing(true);
    setErrorMsg(null);
    
    if (isDemo) {
      // Demo shuffle
      await new Promise(resolve => setTimeout(resolve, 800));
      const shuffled = [...mockReleases].sort(() => Math.random() - 0.5);
      setReleases(shuffled);
    } else {
      // Live ingestion
      try {
        const res = await fetch('/api/ingest', { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          
          if (data.errors && data.errors.length > 0) {
            setErrorMsg(`Some sources failed: ${data.errors.join(', ')}`);
          }
          
          if (data.processed && data.processed.length > 0) {
            setReleases(prev => {
              const newReleases = [...data.processed];
              const existingReleases = prev.filter(r => !newReleases.some(nr => nr.id === r.id));
              return [...newReleases, ...existingReleases];
            });
          }
        } else {
          setErrorMsg('Ingestion failed. Rate limit or upstream error.');
        }
      } catch (e) {
        setErrorMsg('Network error during ingestion.');
      }
    }
    
    setIsSyncing(false);
  };

  return (
    <div className="container">
      <header className="header">
        <div className="title-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px' }}>
              <Radar size={32} color="#3b82f6" />
            </div>
            <h1>Tech Release Radar</h1>
          </div>
          <p>Continuous intelligence for your technology stack</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Mode:</span>
            <button 
              onClick={() => setIsDemo(!isDemo)}
              style={{ background: 'none', border: 'none', color: isDemo ? 'var(--warning)' : 'var(--success)', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {isDemo ? 'Demo (Fixtures)' : 'Live'}
            </button>
          </div>
          <button className="btn btn-primary" onClick={handleCheckNow} disabled={isSyncing || isLoading}>
            <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} style={isSyncing ? { animation: 'spin 1s linear infinite' } : {}} /> 
            {isSyncing ? 'Ingesting...' : 'Check Now'}
          </button>
        </div>
      </header>
      
      {errorMsg && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid var(--danger)', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} />
          {errorMsg}
        </div>
      )}

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <RefreshCw size={32} className="animate-spin" style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
        </div>
      ) : releases.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Radar size={48} color="var(--muted)" style={{ margin: '0 auto 1rem auto' }} />
          <h3>No updates found</h3>
          <p style={{ color: 'var(--muted)' }}>{isDemo ? "Your tech stack is fully up to date." : "Click 'Check Now' to ingest real releases."}</p>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--foreground)' }}>Latest Intelligence</h2>
            <span style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Showing {releases.length} updates</span>
          </div>
          <div className="grid">
            {releases.map((release, i) => (
              <div key={release.id} style={{ animationDelay: `${i * 0.1}s` }}>
                <ReleaseCard release={release} />
              </div>
            ))}
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}
