export interface SecurityLog {
  id: string;
  timestamp: string;
  ip: string;
  action: string;
  reason: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  details?: string;
  status: "BLOCKED" | "FLAGGED" | "ALLOWED";
}

export interface FirewallConfig {
  enabled: boolean;
  mode: "STRICT" | "STANDARD" | "AUDIT";
  enableRateLimiting: boolean;
  maxRequestsPerMinute: number;
  enableXssProtection: boolean;
  enableSqlInjectionShield: boolean;
  enableBotHoneypot: boolean;
  enableAdminPinLock: boolean;
  adminPin: string;
  blacklistedIps: string[];
  whitelistedIps: string[];
  blockGeos: string[];
  failedLoginThreshold: number;
  lockoutDurationMinutes: number;
}

export const DEFAULT_FIREWALL_CONFIG: FirewallConfig = {
  enabled: true,
  mode: "STRICT",
  enableRateLimiting: true,
  maxRequestsPerMinute: 15,
  enableXssProtection: true,
  enableSqlInjectionShield: true,
  enableBotHoneypot: true,
  enableAdminPinLock: true,
  adminPin: "8888", // Default admin security firewall PIN
  blacklistedIps: ["185.220.101.4", "45.154.255.88"],
  whitelistedIps: ["127.0.0.1", "localhost"],
  blockGeos: [],
  failedLoginThreshold: 5,
  lockoutDurationMinutes: 15,
};

const CONFIG_KEY = "nangsal_waf_config";
const LOGS_KEY = "nangsal_waf_logs";
const RATE_LIMIT_KEY = "nangsal_waf_rate_limit";

export function getFirewallConfig(): FirewallConfig {
  try {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) {
      return { ...DEFAULT_FIREWALL_CONFIG, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn("Error reading WAF config:", e);
  }
  return DEFAULT_FIREWALL_CONFIG;
}

export function saveFirewallConfig(config: FirewallConfig): void {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error("Error saving WAF config:", e);
  }
}

export function getSecurityLogs(): SecurityLog[] {
  try {
    const saved = localStorage.getItem(LOGS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn("Error reading security logs:", e);
  }
  return [
    {
      id: "waf-log-1",
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      ip: "185.220.101.4",
      action: "FORM_SUBMIT",
      reason: "IP in blacklist rule",
      severity: "HIGH",
      status: "BLOCKED",
      details: "Attempted automated order submission from known proxy"
    },
    {
      id: "waf-log-2",
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      ip: "192.168.1.42",
      action: "ADMIN_LOGIN",
      reason: "XSS Pattern detected in input field (<script>)",
      severity: "CRITICAL",
      status: "BLOCKED",
      details: "Sanitized script tag in login username payload"
    }
  ];
}

export function addSecurityLog(log: Omit<SecurityLog, "id" | "timestamp">): void {
  try {
    const logs = getSecurityLogs();
    const newLog: SecurityLog = {
      ...log,
      id: `waf-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString()
    };
    const updated = [newLog, ...logs].slice(0, 100); // Keep last 100 logs
    localStorage.setItem(LOGS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Error adding security log:", e);
  }
}

export function clearSecurityLogs(): void {
  try {
    localStorage.setItem(LOGS_KEY, JSON.stringify([]));
  } catch (e) {
    console.error("Error clearing logs:", e);
  }
}

// XSS & SQL Injection Sanitizer
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== "string") return input;
  let clean = input;
  
  // Remove script tags and dangerous event handlers
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "[REMOVED_SCRIPT]");
  clean = clean.replace(/javascript:/gi, "nojavascript:");
  clean = clean.replace(/on\w+\s*=/gi, "noattr=");
  
  // SQL injection patterns
  clean = clean.replace(/(?:union\s+select|drop\s+table|delete\s+from|insert\s+into)/gi, "[REMOVED_SQL]");
  
  return clean;
}

// Check for XSS or malicious payload
export function containsMaliciousPattern(input: string): boolean {
  if (!input || typeof input !== "string") return false;
  const lower = input.toLowerCase();
  const patterns = [
    "<script>", "</script>", "javascript:", "onerror=", "onload=", "eval(", 
    "union select", "drop table", "--", "1=1", "or 1=1"
  ];
  return patterns.some(p => lower.includes(p));
}

// Client-side Rate Limiting Guard
export function checkRateLimit(actionKey: string, maxRequests = 10, windowMs = 60000): { allowed: boolean; reason?: string } {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    const store: Record<string, number[]> = raw ? JSON.parse(raw) : {};
    const now = Date.now();
    
    const timestamps = (store[actionKey] || []).filter(t => now - t < windowMs);
    
    if (timestamps.length >= maxRequests) {
      return { 
        allowed: false, 
        reason: `Rate limit exceeded. Maximum ${maxRequests} requests per minute.` 
      };
    }
    
    timestamps.push(now);
    store[actionKey] = timestamps;
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(store));
    return { allowed: true };
  } catch (e) {
    return { allowed: true };
  }
}

// Comprehensive WAF Request Inspector
export function validateFirewallRequest(req: {
  ip?: string;
  input?: string;
  action: string;
}): { allowed: boolean; reason?: string; sanitizedInput?: string } {
  const config = getFirewallConfig();
  if (!config.enabled) {
    return { allowed: true, sanitizedInput: req.input };
  }

  const clientIp = req.ip || "127.0.0.1";

  // Check Whitelist
  if (config.whitelistedIps.includes(clientIp)) {
    return { allowed: true, sanitizedInput: req.input };
  }

  // Check Blacklist
  if (config.blacklistedIps.includes(clientIp)) {
    addSecurityLog({
      ip: clientIp,
      action: req.action,
      reason: "IP Address is in Firewall Blacklist",
      severity: "HIGH",
      status: "BLOCKED",
      details: `Blocked attempt for action: ${req.action}`
    });
    return { allowed: false, reason: "ACCESS DENIED BY FIREWALL: IP Blacklisted." };
  }

  // Check Malicious Input (XSS / SQLi)
  if (req.input && containsMaliciousPattern(req.input)) {
    addSecurityLog({
      ip: clientIp,
      action: req.action,
      reason: "Malicious payload detected (XSS/SQLi)",
      severity: "CRITICAL",
      status: "BLOCKED",
      details: `Blocked string containing dangerous characters in ${req.action}`
    });
    return {
      allowed: false,
      reason: "FIREWALL SECURITY BREACH: Malicious script or query pattern detected."
    };
  }

  // Check Rate Limit
  if (config.enableRateLimiting) {
    const rateCheck = checkRateLimit(req.action, config.maxRequestsPerMinute);
    if (!rateCheck.allowed) {
      addSecurityLog({
        ip: clientIp,
        action: req.action,
        reason: rateCheck.reason || "Rate limit threshold breached",
        severity: "MEDIUM",
        status: "BLOCKED",
        details: `Action ${req.action} exceeded rate limit of ${config.maxRequestsPerMinute}/min`
      });
      return { allowed: false, reason: rateCheck.reason };
    }
  }

  return { 
    allowed: true, 
    sanitizedInput: req.input ? sanitizeInput(req.input) : req.input 
  };
}

export function verifyAdminPin(pin: string): boolean {
  const config = getFirewallConfig();
  if (!config.enableAdminPinLock) return true;
  return pin === config.adminPin;
}
