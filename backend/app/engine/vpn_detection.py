"""
VPN Detection Engine.

Detects VPN/proxy usage based on IP characteristics:
  - Known VPN/proxy IP ranges (demo: simple heuristics)
  - In production: integrate with MaxMind GeoIP2 or similar services
"""
from __future__ import annotations

import ipaddress
from typing import Optional


# Known VPN/proxy IP ranges (demo - in production use MaxMind or similar)
KNOWN_VPN_RANGES = [
    # Example ranges (these are placeholders)
    "10.0.0.0/8",  # Private network
    "172.16.0.0/12",  # Private network
    "192.168.0.0/16",  # Private network
]

# Common VPN provider ASNs (simplified - real implementation would use IP-to-ASN mapping)
KNOWN_VPN_ASNS = [
    # Placeholder - in production, use MaxMind GeoIP2 or similar
]


def is_vpn_ip(ip_address: str) -> bool:
    """
    Check if an IP address is likely a VPN/proxy.

    Args:
        ip_address: IPv4 or IPv6 address string

    Returns:
        True if IP appears to be VPN/proxy, False otherwise
    """
    try:
        ip = ipaddress.ip_address(ip_address)
        
        # Check if it's a private/local IP (often used with VPNs)
        if ip.is_private or ip.is_loopback or ip.is_link_local:
            return True
        
        # Check against known VPN ranges
        for cidr in KNOWN_VPN_RANGES:
            try:
                network = ipaddress.ip_network(cidr, strict=False)
                if ip in network:
                    return True
            except ValueError:
                continue
        
        # Heuristic: Check for suspicious patterns
        # In production, integrate with MaxMind GeoIP2 or similar service
        # For demo, we'll flag certain IP patterns
        
        # Example: Flag if IP ends in certain patterns (demo heuristic)
        ip_str = str(ip)
        if ip_str.startswith("127.") or ip_str.startswith("0."):
            return True
        
        return False
        
    except ValueError:
        # Invalid IP format
        return False


def detect_vpn(
    ip_address: str,
    country_code: Optional[str] = None,
    isp: Optional[str] = None,
) -> dict:
    """
    Comprehensive VPN detection with multiple signals.

    Args:
        ip_address: IP address to check
        country_code: Optional country code from GeoIP
        isp: Optional ISP name

    Returns:
        {
            "is_vpn": bool,
            "confidence": float,  # 0.0 - 1.0
            "reasons": list[str]
        }
    """
    reasons = []
    confidence = 0.0
    
    # Check IP characteristics
    if is_vpn_ip(ip_address):
        reasons.append("IP matches known VPN/proxy patterns")
        confidence += 0.4
    
    # Check ISP name for VPN keywords (if available)
    if isp:
        isp_lower = isp.lower()
        vpn_keywords = ["vpn", "proxy", "hosting", "datacenter", "cloud"]
        if any(keyword in isp_lower for keyword in vpn_keywords):
            reasons.append(f"ISP name suggests VPN/proxy: {isp}")
            confidence += 0.3
    
    # Check for country mismatch (if we have user's normal country)
    # This would require user history - simplified for demo
    
    # High confidence threshold
    is_vpn = confidence >= 0.3
    
    return {
        "is_vpn": is_vpn,
        "confidence": min(confidence, 1.0),
        "reasons": reasons,
    }
