import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { HiGlobeAlt, HiMapPin } from 'react-icons/hi2';

/**
 * Geospatial Map Component
 * 
 * Visualizes transaction locations on a map.
 * In production, integrate with Leaflet, Mapbox, or Google Maps.
 * For demo, shows a placeholder with transaction markers.
 */
export default function GeospatialMap({ transactions = [] }) {
  const mapRef = useRef(null);

  // Filter transactions with location data
  const transactionsWithLocation = transactions.filter(
    (tx) => tx.latitude != null && tx.longitude != null
  );

  useEffect(() => {
    // In production, initialize map library here
    // Example with Leaflet:
    // const map = L.map(mapRef.current).setView([51.505, -0.09], 2);
    // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  }, []);

  if (transactionsWithLocation.length === 0) {
    return (
      <div className="glass rounded-2xl p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
        <HiGlobeAlt className="text-6xl text-indigo-500/40 mb-4" />
        <p className="text-slate-400 text-lg mb-2">No geospatial data available</p>
        <p className="text-slate-500 text-sm">
          Transaction locations will appear here when geolocation data is captured
        </p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <HiGlobeAlt className="text-indigo-400 text-xl" />
        <h3 className="text-xl font-bold text-white">Transaction Locations</h3>
        <span className="text-slate-400 text-sm ml-auto">
          {transactionsWithLocation.length} transactions
        </span>
      </div>

      {/* Map Container */}
      <div
        ref={mapRef}
        className="w-full h-[400px] bg-slate-800/60 rounded-xl relative overflow-hidden"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)',
        }}
      >
        {/* Placeholder Map Grid */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>

        {/* Transaction Markers */}
        <div className="absolute inset-0">
          {transactionsWithLocation.map((tx, i) => {
            // Normalize coordinates to 0-100 for demo visualization
            // In production, use proper map projection
            const x = ((tx.longitude + 180) / 360) * 100;
            const y = ((90 - tx.latitude) / 180) * 100;

            return (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                }}
                title={`${tx.name} - ${tx.ip_address} - Risk: ${tx.risk_score}%`}
              >
                <div className="relative">
                  <HiMapPin
                    className={`text-2xl ${
                      tx.flagged
                        ? 'text-red-500 drop-shadow-lg'
                        : tx.risk_level === 'High'
                        ? 'text-orange-500'
                        : tx.risk_level === 'Medium'
                        ? 'text-yellow-500'
                        : 'text-emerald-500'
                    } transition-transform group-hover:scale-125`}
                  />
                  {tx.flagged && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute inset-0 rounded-full bg-red-500/30 blur-sm"
                    />
                  )}
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="glass-strong rounded-lg p-2 text-xs whitespace-nowrap border border-slate-700">
                    <p className="text-white font-medium">{tx.name}</p>
                    <p className="text-slate-400">{tx.ip_address}</p>
                    <p className={`font-semibold ${
                      tx.flagged ? 'text-red-400' : 'text-slate-300'
                    }`}>
                      Risk: {tx.risk_score?.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 glass-strong rounded-lg p-3 border border-slate-700">
          <p className="text-slate-400 text-xs mb-2 font-medium">Risk Levels</p>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <HiMapPin className="text-emerald-500" />
              <span className="text-slate-300">Low Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <HiMapPin className="text-yellow-500" />
              <span className="text-slate-300">Medium Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <HiMapPin className="text-orange-500" />
              <span className="text-slate-300">High Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <HiMapPin className="text-red-500" />
              <span className="text-slate-300">Flagged</span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-slate-500 text-xs mt-4 text-center">
        Map visualization ready for geolocation integration (Leaflet/Mapbox)
      </p>
    </div>
  );
}
