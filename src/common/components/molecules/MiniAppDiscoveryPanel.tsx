"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/common/components/atoms/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/common/components/atoms/card';
import { Badge } from '@/common/components/atoms/badge';
import { Loader2, RefreshCw, Search, Trash2, Plus } from 'lucide-react';

interface DiscoveryStats {
  totalDiscovered: number;
  validApps: number;
  invalidApps: number;
  queueLength: number;
  isCrawling: boolean;
}

interface DiscoveryApp {
  domain: string;
  name: string;
  description?: string;
  lastCrawled: string;
  engagementScore?: number;
}

interface DiscoveryResponse {
  success: boolean;
  stats: DiscoveryStats;
  validApps: number;
  apps: DiscoveryApp[];
}

export function MiniAppDiscoveryPanel() {
  const [stats, setStats] = useState<DiscoveryStats | null>(null);
  const [apps, setApps] = useState<DiscoveryApp[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [testDomain, setTestDomain] = useState<string>('');
  const [testResults, setTestResults] = useState<any[]>([]);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/miniapp-discovery');
      const data: DiscoveryResponse = await response.json();
      
      if (data.success) {
        setStats(data.stats);
        setApps(data.apps);
      } else {
        setError('Failed to fetch discovery stats');
      }
    } catch (err) {
      setError('Network error while fetching stats');
    } finally {
      setLoading(false);
    }
  };

  const triggerAction = async (action: string, domains?: string[]) => {
    setActionLoading(action);
    setError(null);
    
    try {
      const response = await fetch('/api/miniapp-discovery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, domains }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh stats after action
        await fetchStats();
        
        // Handle test results
        if (action === 'test-domain' && data.results) {
          setTestResults(data.results);
        }
      } else {
        setError(data.error || 'Action failed');
      }
    } catch (err) {
      setError('Network error while executing action');
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading Discovery Stats...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Mini App Discovery
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchStats}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
          <CardDescription>
            Discover and index Mini Apps from across the web
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalDiscovered}</div>
                <div className="text-sm text-gray-600">Total Discovered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.validApps}</div>
                <div className="text-sm text-gray-600">Valid Apps</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.invalidApps}</div>
                <div className="text-sm text-gray-600">Invalid Apps</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.queueLength}</div>
                <div className="text-sm text-gray-600">In Queue</div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => triggerAction('discover')}
              disabled={actionLoading === 'discover'}
              className="flex items-center gap-2"
            >
              {actionLoading === 'discover' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Discover from Seeds
            </Button>
            
            <Button
              variant="outline"
              onClick={() => triggerAction('reindex')}
              disabled={actionLoading === 'reindex'}
              className="flex items-center gap-2"
            >
              {actionLoading === 'reindex' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Re-index All
            </Button>
            
            <Button
              variant="outline"
              onClick={() => triggerAction('clear-cache')}
              disabled={actionLoading === 'clear-cache'}
              className="flex items-center gap-2"
            >
              {actionLoading === 'clear-cache' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Clear Cache
            </Button>
          </div>

          {/* Test Domain Section */}
          <div className="mt-6 p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Test Domain</h3>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Enter domain to test (e.g., nounspace.com)"
                value={testDomain}
                onChange={(e) => setTestDomain(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md"
              />
              <Button
                onClick={() => triggerAction('test-domain', [testDomain])}
                disabled={!testDomain || actionLoading === 'test-domain'}
                className="flex items-center gap-2"
              >
                {actionLoading === 'test-domain' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Test
              </Button>
            </div>
            
            {testResults.length > 0 && (
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-md ${
                      result.success 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {result.success ? '✅ Success' : '❌ Failed'}
                      </span>
                      <span className="text-sm text-gray-600">
                        {result.details?.domain || 'Unknown domain'}
                      </span>
                    </div>
                    {result.error && (
                      <p className="text-sm text-red-600 mt-1">{result.error}</p>
                    )}
                    {result.manifest && (
                      <div className="mt-2 text-sm">
                        <p><strong>Name:</strong> {result.manifest.name}</p>
                        <p><strong>Home URL:</strong> {result.manifest.homeUrl}</p>
                        {result.manifest.description && (
                          <p><strong>Description:</strong> {result.manifest.description}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {stats?.isCrawling && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-blue-700 text-sm">Currently crawling domains...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Discovered Apps List */}
      {apps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Discovered Mini Apps ({apps.length})
            </CardTitle>
            <CardDescription>
              Apps discovered through the decentralized indexing process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {apps.map((app, index) => (
                <div
                  key={app.domain}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{app.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {app.domain}
                      </Badge>
                    </div>
                    {app.description && (
                      <p className="text-sm text-gray-600 mb-2">{app.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Last crawled: {new Date(app.lastCrawled).toLocaleDateString()}</span>
                      {app.engagementScore && (
                        <span>Score: {app.engagementScore}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 