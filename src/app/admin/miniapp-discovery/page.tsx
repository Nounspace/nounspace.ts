import { MiniAppDiscoveryPanel } from '@/common/components/molecules/MiniAppDiscoveryPanel';

export default function MiniAppDiscoveryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mini App Discovery</h1>
          <p className="text-gray-600">
            Manage and monitor the decentralized Mini App discovery system. This system automatically 
            discovers, validates, and indexes Mini Apps from across the web following the same approach 
            used by official Farcaster clients.
          </p>
        </div>

        <MiniAppDiscoveryPanel />

        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">How It Works</h2>
          <div className="space-y-3 text-blue-800">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-sm font-bold text-blue-700 mt-0.5">
                1
              </div>
              <div>
                <strong>Domain Discovery:</strong> Scans public casts, developer tools, and registries for Mini App domains
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-sm font-bold text-blue-700 mt-0.5">
                2
              </div>
              <div>
                <strong>Manifest Validation:</strong> Fetches and validates <code>/.well-known/farcaster.json</code> files
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-sm font-bold text-blue-700 mt-0.5">
                3
              </div>
              <div>
                <strong>Engagement Filtering:</strong> Only indexes apps that meet usage and engagement thresholds
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-sm font-bold text-blue-700 mt-0.5">
                4
              </div>
              <div>
                <strong>Automatic Integration:</strong> Discovered apps appear in the fidget picker alongside curated apps
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-green-900">Benefits</h2>
          <ul className="space-y-2 text-green-800">
            <li>• <strong>Decentralized:</strong> No reliance on centralized APIs</li>
            <li>• <strong>Scalable:</strong> Automatically discovers new apps as they're shared</li>
            <li>• <strong>Quality:</strong> Only indexes apps with valid manifests and sufficient engagement</li>
            <li>• <strong>Real-time:</strong> Apps are re-indexed daily and can be refreshed manually</li>
            <li>• <strong>Compatible:</strong> Follows the same approach as official Farcaster clients</li>
          </ul>
        </div>

        <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-yellow-900">For Developers</h2>
          <p className="text-yellow-800 mb-4">
            To make your Mini App discoverable by this system:
          </p>
          <ol className="space-y-2 text-yellow-800 list-decimal list-inside">
            <li>Create a <code>/.well-known/farcaster.json</code> file on your domain</li>
            <li>Include required fields: <code>name</code>, <code>iconUrl</code>, <code>homeUrl</code></li>
            <li>Ensure your domain is not a development tunnel (ngrok.io, replit.dev, etc.)</li>
            <li>Share your Mini App in Farcaster casts to trigger discovery</li>
            <li>Build engagement to meet indexing thresholds</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 