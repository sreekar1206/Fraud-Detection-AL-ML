"""
Network Contagion Analysis via NetworkX.

Maintains a transaction graph where:
  - Nodes  = accounts
  - Edges  = money transfers between accounts

Flags a transaction if the source account is within
``max_hops`` degrees of separation from a known **mule account**.
"""
from __future__ import annotations

from typing import Optional

try:
    import networkx as nx
    _NX_AVAILABLE = True
except ImportError:
    _NX_AVAILABLE = False


class ContagionGraph:
    """
    Lightweight wrapper around a NetworkX DiGraph for
    fraud-network proximity checks.
    """

    def __init__(self, mule_accounts: Optional[list[str]] = None):
        self._mule_set: set[str] = set(mule_accounts or [])

        if _NX_AVAILABLE:
            self._graph = nx.DiGraph()
        else:
            self._graph = None
            print("[GRAPH] NetworkX not installed — graph contagion disabled")

    # ── Mutate ───────────────────────────────────────────────

    def add_transfer(self, from_account: str, to_account: str, amount: float = 0.0):
        """Record a transfer edge in the graph."""
        if self._graph is None:
            return
        self._graph.add_edge(from_account, to_account, amount=amount)

    def add_mule(self, account_id: str):
        """Mark an account as a confirmed mule."""
        self._mule_set.add(account_id)

    # ── Query ────────────────────────────────────────────────

    def is_near_mule(
        self, account_id: str, max_hops: int = 2,
    ) -> dict:
        """
        Check if ``account_id`` is within ``max_hops`` of any mule account.

        Returns:
            {
                "flagged": bool,
                "nearest_mule": str | None,
                "hops": int | None,
                "path": list[str] | None,
            }
        """
        if self._graph is None or not self._mule_set:
            return {"flagged": False, "nearest_mule": None, "hops": None, "path": None}

        # Build undirected view for BFS in both directions
        undirected = self._graph.to_undirected()

        if account_id not in undirected:
            return {"flagged": False, "nearest_mule": None, "hops": None, "path": None}

        best_mule = None
        best_path = None
        best_hops = max_hops + 1

        for mule in self._mule_set:
            if mule not in undirected:
                continue
            try:
                path = nx.shortest_path(undirected, source=account_id, target=mule)
                hops = len(path) - 1
                if hops <= max_hops and hops < best_hops:
                    best_mule = mule
                    best_path = path
                    best_hops = hops
            except nx.NetworkXNoPath:
                continue

        if best_mule:
            return {
                "flagged": True,
                "nearest_mule": best_mule,
                "hops": best_hops,
                "path": best_path,
            }

        return {"flagged": False, "nearest_mule": None, "hops": None, "path": None}

    @property
    def node_count(self) -> int:
        return self._graph.number_of_nodes() if self._graph else 0

    @property
    def edge_count(self) -> int:
        return self._graph.number_of_edges() if self._graph else 0
