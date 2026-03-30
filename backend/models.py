"""
Data models for XDP-DDOS Dashboard API
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

# === METRICS & STATS ===
class MetricPoint(BaseModel):
    """Single data point with timestamp"""
    timestamp: float
    pps: float
    bps: float


class CurrentMetrics(BaseModel):
    """Current real-time metrics"""
    pps: float
    bps: float
    timestamp: float
    status: str  # "HEALTHY", "UNDER_ATTACK", "WARNING"


class MetricsHistory(BaseModel):
    """Historical metrics for charts"""
    data: List[MetricPoint]
    period: str  # "5m", "1h", "24h"


# === BLOCKED IPs ===
class BlockedIP(BaseModel):
    """Blocked IP entry"""
    ip_address: str
    timestamp: str
    pps_at_block: float = 0.0
    bps_at_block: float = 0.0
    reason: str = "DDoS Attack Detected"
    is_active: bool = True


class BlockedIPsList(BaseModel):
    """List of blocked IPs"""
    total_blocked: int
    currently_active: int
    ips: List[BlockedIP]


class UnblockRequest(BaseModel):
    """Request to unblock an IP"""
    ip_address: str
    reason: str = ""


# === ACTIVE ATTACKS ===
class AttackEvent(BaseModel):
    """Single attack event"""
    timestamp: str
    source_ip: str
    pps: float
    bps: float
    confidence: float  # 0-1 (model confidence)
    action: str  # "BLOCKED", "MONITORING", "ALLOWED"


class Top10Attackers(BaseModel):
    """Top 10 attacking IPs"""
    ips: List[AttackEvent]


# === LOGS ===
class LogEntry(BaseModel):
    """Log entry"""
    timestamp: str
    level: str  # "INFO", "WARNING", "CRITICAL"
    message: str
    source_ip: Optional[str] = None


class LogResponse(BaseModel):
    """Log response"""
    logs: List[LogEntry]
    total: int


# === SYSTEM STATS ===
class SystemStats(BaseModel):
    """System health & statistics"""
    kernel_module_loaded: bool
    model_loaded: bool
    model_accuracy: float
    total_attacks_detected: int
    total_ips_blocked: int
    system_uptime: str
    last_attack: Optional[str]
    model_version: str


# === ANALYTICS ===
class AttackStats(BaseModel):
    """Attack statistics"""
    total_attacks: int
    attacks_blocked: int
    block_rate: float  # percentage
    average_pps: float
    peak_pps: float
    average_bps: float
    peak_bps: float


class Analytics(BaseModel):
    """Analytics dashboard data"""
    attack_stats: AttackStats
    top_attackers: List[AttackEvent]
    blocked_ips_count: int


# === CONFIG ===
class SystemConfig(BaseModel):
    """System configuration"""
    block_threshold_pps: int
    update_interval_seconds: int
    auto_block_enabled: bool
    websocket_enabled: bool


class ConfigUpdateRequest(BaseModel):
    """Request to update config"""
    block_threshold_pps: Optional[int] = None
    update_interval_seconds: Optional[int] = None
    auto_block_enabled: Optional[bool] = None
