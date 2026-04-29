# Dijkstra 最短路算法

## 适用条件

- **单源最短路**
- **边权非负**

## 核心思想

贪心策略：每次选择当前距离起点最近的未确定最短路的节点，用该节点更新其邻居的距离。

## 朴素实现 $O(V^2)$

```cpp
int dist[N];
bool vis[N];

void dijkstra(int start) {
    memset(dist, 0x3f, sizeof(dist));
    dist[start] = 0;

    for (int i = 1; i <= n; i++) {
        int u = -1, minDist = INF;
        for (int j = 1; j <= n; j++) {
            if (!vis[j] && dist[j] < minDist) {
                minDist = dist[j];
                u = j;
            }
        }
        if (u == -1) break;
        vis[u] = true;

        for (int v = 1; v <= n; v++) {
            if (!vis[v] && dist[v] > dist[u] + g[u][v]) {
                dist[v] = dist[u] + g[u][v];
            }
        }
    }
}
```

## 堆优化 $O(E \log V)$

```cpp
void dijkstra(int start) {
    memset(dist, 0x3f, sizeof(dist));
    dist[start] = 0;
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;
    pq.push({0, start});

    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;

        for (auto [v, w] : adj[u]) {
            if (dist[v] > dist[u] + w) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }
}
```

## 注意事项

> Dijkstra 不能处理负权边！负权边会破坏贪心策略的正确性。
